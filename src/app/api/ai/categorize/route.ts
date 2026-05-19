import { NextResponse, type NextRequest } from 'next/server';
import { requireUser } from '@/lib/auth/session';
import { aiEnabled, aiJson } from '@/lib/ai/client';
import { getCategoriesList } from '@/lib/queries/meta';

type Suggestion = {
  itemName: string;
  category: string;
  condition: 'good' | 'broken' | 'repair';
  damageNotes: string;
  confidence: number;
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

  // Cost / abuse guard: refuse anything past 1.5 MB of base64 (≈1 MB raw image).
  // OpenRouter is billed per token and large images blow up the prompt fast.
  const contentLength = Number(req.headers.get('content-length') ?? '0');
  if (contentLength > 1_600_000) {
    return NextResponse.json(
      { error: 'image too large (max ~1 MB)' },
      { status: 413 },
    );
  }

  const body = (await req.json()) as { imageDataUrl?: string };
  if (!body.imageDataUrl?.startsWith('data:image/')) {
    return NextResponse.json({ error: 'send imageDataUrl (data:image/...)' }, { status: 400 });
  }
  if (body.imageDataUrl.length > 1_500_000) {
    return NextResponse.json(
      { error: 'image too large (max ~1 MB)' },
      { status: 413 },
    );
  }

  const categories = await getCategoriesList();
  const catNames = categories.map((c) => c.name).join(', ');

  try {
    const suggestion = await aiJson<Suggestion>({
      messages: [
        {
          role: 'system',
          content: `You are an office inventory assistant for the Kurikaralanka campus. Given a photo of an office item, suggest a short item name, the best-matching category, the visible condition, and damage notes if any. Existing categories: ${catNames}. Prefer matching one of these but you can suggest a new short one if none fit.`,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Categorize this item. Return JSON: {"itemName": string, "category": string, "condition": "good"|"broken"|"repair", "damageNotes": string, "confidence": 0-1}',
            },
            { type: 'image_url', image_url: { url: body.imageDataUrl } },
          ],
        },
      ],
      maxTokens: 300,
    });
    return NextResponse.json({ suggestion });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
