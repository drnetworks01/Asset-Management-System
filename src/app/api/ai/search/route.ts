import { NextResponse, type NextRequest } from 'next/server';
import { eq, and, isNull, sql } from 'drizzle-orm';
import { db, schema } from '@/lib/db/client';
import { requireUser } from '@/lib/auth/session';
import { aiEnabled, aiJson } from '@/lib/ai/client';
import { getLocationsList, getCategoriesList } from '@/lib/queries/meta';

type Filters = {
  conditions: Array<'good' | 'broken' | 'repair'>;
  categoryNames: string[];
  locationNames: string[];
  nameContains: string | null;
  notesContains: string | null;
  qtyMin: number | null;
  qtyMax: number | null;
  intent: string;
};

export async function POST(req: NextRequest) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!aiEnabled()) {
    return NextResponse.json(
      { error: 'AI not configured. Set OPENROUTER_API_KEY.' },
      { status: 503 },
    );
  }

  const body = (await req.json()) as { query?: string };
  const userQuery = body.query?.trim();
  if (!userQuery) return NextResponse.json({ error: 'query required' }, { status: 400 });

  const [locations, categories] = await Promise.all([
    getLocationsList(),
    getCategoriesList(),
  ]);

  try {
    const filters = await aiJson<Filters>({
      messages: [
        {
          role: 'system',
          content: `You convert natural language queries about an office inventory into JSON filters.

Available locations: ${locations.map((l) => l.name).join(' | ')}
Available categories: ${categories.map((c) => c.name).join(' | ')}
Valid conditions: good, broken, repair

Always return ALL fields. Use empty arrays / nulls when not mentioned. The 'intent' field summarizes what you understood (1 short sentence).`,
        },
        {
          role: 'user',
          content: `Convert this query to filters: "${userQuery}"\n\nReturn JSON:
{
  "conditions": ["good"|"broken"|"repair"...],
  "categoryNames": [strings matching available categories],
  "locationNames": [strings matching available locations],
  "nameContains": string | null,
  "notesContains": string | null,
  "qtyMin": number | null,
  "qtyMax": number | null,
  "intent": "1-sentence summary"
}`,
        },
      ],
      maxTokens: 400,
    });

    // Build SQL where clauses dynamically
    const conds = [isNull(schema.items.deletedAt)];
    if (filters.conditions?.length) {
      conds.push(
        sql`${schema.items.condition} in ${filters.conditions}`,
      );
    }
    if (filters.nameContains) {
      conds.push(sql`lower(${schema.items.name}) like ${`%${filters.nameContains.toLowerCase()}%`}`);
    }
    if (filters.notesContains) {
      conds.push(sql`lower(coalesce(${schema.items.notes}, '')) like ${`%${filters.notesContains.toLowerCase()}%`}`);
    }
    if (filters.qtyMin !== null && filters.qtyMin !== undefined) {
      conds.push(sql`${schema.items.qty} >= ${filters.qtyMin}`);
    }
    if (filters.qtyMax !== null && filters.qtyMax !== undefined) {
      conds.push(sql`${schema.items.qty} <= ${filters.qtyMax}`);
    }
    if (filters.locationNames?.length) {
      conds.push(sql`${schema.locations.name} in ${filters.locationNames}`);
    }
    if (filters.categoryNames?.length) {
      conds.push(sql`${schema.categories.name} in ${filters.categoryNames}`);
    }

    const rows = await db
      .select({
        id: schema.items.id,
        name: schema.items.name,
        qty: schema.items.qty,
        condition: schema.items.condition,
        locationName: schema.locations.name,
        categoryName: schema.categories.name,
      })
      .from(schema.items)
      .leftJoin(schema.locations, eq(schema.items.locationId, schema.locations.id))
      .leftJoin(schema.categories, eq(schema.items.categoryId, schema.categories.id))
      .where(and(...conds))
      .limit(100);

    return NextResponse.json({ filters, results: rows });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
