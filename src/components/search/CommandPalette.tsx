'use client';

import { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { useRouter } from 'next/navigation';
import type { SearchResult } from '@/lib/queries/dashboard';
import { cn } from '@/lib/utils';

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setResults([]);
      return;
    }
  }, [open]);

  useEffect(() => {
    const q = query.trim();
    if (q.length === 0) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        if (!res.ok) throw new Error('search failed');
        const data = await res.json();
        if (!cancelled) setResults(data.results as SearchResult[]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 150);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  function go(result: SearchResult) {
    setOpen(false);
    if (result.href) router.push(result.href);
  }

  const grouped = {
    item: results.filter((r) => r.type === 'item'),
    location: results.filter((r) => r.type === 'location'),
    category: results.filter((r) => r.type === 'category'),
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden items-center gap-2 rounded-md border border-border bg-background/60 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground sm:inline-flex"
        aria-label="Open command palette"
      >
        <span>Search…</span>
        <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
          Ctrl K
        </kbd>
      </button>

      <div
        className={cn(
          'fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm p-4 pt-32 transition-opacity',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={() => setOpen(false)}
      >
        <Command
          label="Command Palette"
          className="w-full max-w-xl overflow-hidden rounded-xl border border-border bg-background shadow-2xl"
          onClick={(e) => e.stopPropagation()}
          shouldFilter={false}
        >
          <div className="flex items-center gap-2 border-b border-border px-4">
            <span className="text-muted-foreground">🔍</span>
            <Command.Input
              autoFocus
              value={query}
              onValueChange={setQuery}
              placeholder="Search items, locations, categories…"
              className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
            />
            <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
              Esc
            </kbd>
          </div>
          <Command.List className="max-h-[360px] overflow-y-auto p-2">
            {loading && (
              <p className="px-3 py-2 text-sm text-muted-foreground">
                Searching…
              </p>
            )}
            {!loading && query.length === 0 && (
              <p className="px-3 py-2 text-sm text-muted-foreground">
                Type to search. Try &ldquo;chair&rdquo;, &ldquo;kitchen&rdquo;,
                &ldquo;broken&rdquo;…
              </p>
            )}
            {!loading && query.length > 0 && results.length === 0 && (
              <Command.Empty className="px-3 py-2 text-sm text-muted-foreground">
                No results for &ldquo;{query}&rdquo;
              </Command.Empty>
            )}
            {grouped.location.length > 0 && (
              <Command.Group heading="Locations" className="text-muted-foreground">
                {grouped.location.map((r) => (
                  <Command.Item
                    key={r.id}
                    onSelect={() => go(r)}
                    className="flex cursor-pointer items-center gap-2 rounded px-3 py-2 text-sm text-foreground aria-selected:bg-muted"
                  >
                    🏛️ {r.label}
                  </Command.Item>
                ))}
              </Command.Group>
            )}
            {grouped.category.length > 0 && (
              <Command.Group heading="Categories">
                {grouped.category.map((r) => (
                  <Command.Item
                    key={r.id}
                    onSelect={() => go(r)}
                    className="flex cursor-pointer items-center gap-2 rounded px-3 py-2 text-sm text-foreground aria-selected:bg-muted"
                  >
                    🏷️ {r.label}
                  </Command.Item>
                ))}
              </Command.Group>
            )}
            {grouped.item.length > 0 && (
              <Command.Group heading="Items">
                {grouped.item.map((r) => (
                  <Command.Item
                    key={r.id}
                    onSelect={() => go(r)}
                    className="flex cursor-pointer items-start gap-2 rounded px-3 py-2 text-sm text-foreground aria-selected:bg-muted"
                  >
                    <span>📦</span>
                    <span>
                      <span className="block font-medium">{r.label}</span>
                      {r.sublabel && (
                        <span className="text-xs text-muted-foreground">
                          {r.sublabel}
                        </span>
                      )}
                    </span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}
          </Command.List>
        </Command>
      </div>
    </>
  );
}
