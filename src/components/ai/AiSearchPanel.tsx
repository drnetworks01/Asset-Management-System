'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Filters = {
  conditions: string[];
  categoryNames: string[];
  locationNames: string[];
  nameContains: string | null;
  notesContains: string | null;
  qtyMin: number | null;
  qtyMax: number | null;
  intent: string;
};

type Result = {
  id: string;
  name: string;
  qty: number;
  condition: string;
  locationName: string | null;
  categoryName: string | null;
};

export function AiSearchPanel() {
  const [query, setQuery] = useState('');
  const [pending, setPending] = useState(false);
  const [filters, setFilters] = useState<Filters | null>(null);
  const [results, setResults] = useState<Result[]>([]);

  async function run() {
    if (!query.trim()) return;
    setPending(true);
    setFilters(null);
    setResults([]);
    try {
      const res = await fetch('/api/ai/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? 'AI search failed');
        return;
      }
      setFilters(data.filters);
      setResults(data.results);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-background/60 p-5">
      <h2 className="text-lg font-semibold">🤖 Natural Language Search</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Ask in plain English/Sinhala. The AI converts it into filters.
      </p>

      <div className="mt-4 flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='e.g. "all broken chairs in classrooms" or "kitchen items qty more than 3"'
          onKeyDown={(e) => {
            if (e.key === 'Enter') run();
          }}
        />
        <Button onClick={run} disabled={pending}>
          {pending ? 'Thinking…' : 'Ask'}
        </Button>
      </div>

      {filters && (
        <div className="mt-4 rounded-md border border-accent/40 bg-accent/5 p-3 text-sm">
          <p className="font-medium text-accent">Understood:</p>
          <p className="mt-1 text-muted-foreground">{filters.intent}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            {results.length} results
          </p>
        </div>
      )}

      {results.length > 0 && (
        <ul className="mt-4 max-h-96 space-y-1 overflow-y-auto text-sm">
          {results.map((r) => (
            <li key={r.id} className="flex items-center justify-between border-b border-border/40 py-2">
              <Link href={`/items/${r.id}`} className="font-medium hover:text-primary">
                {r.name}
              </Link>
              <span className="text-xs text-muted-foreground">
                {r.locationName ?? '—'} · {r.categoryName ?? '—'} · ×{r.qty} ·{' '}
                <span
                  className={
                    r.condition === 'broken'
                      ? 'text-danger'
                      : r.condition === 'repair'
                        ? 'text-accent'
                        : 'text-success'
                  }
                >
                  {r.condition}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
