'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { bulkUpdateAction } from '@/lib/actions/items';
import { Button } from '@/components/ui/button';

type Props = {
  selected: Set<string>;
  clearSelection: () => void;
  locations: Array<{ id: string; name: string }>;
};

export function BulkBar({ selected, clearSelection, locations }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [moveTo, setMoveTo] = useState('');

  if (selected.size === 0) return null;

  function runCondition(cond: 'good' | 'broken' | 'repair') {
    startTransition(async () => {
      const r = await bulkUpdateAction([...selected], { kind: 'condition', condition: cond });
      if (r.ok) {
        toast.success(`${r.updated} items → ${cond}`);
        clearSelection();
        router.refresh();
      } else {
        toast.error(r.error ?? 'failed');
      }
    });
  }

  function runMove() {
    if (!moveTo) {
      toast.error('Pick a destination location');
      return;
    }
    startTransition(async () => {
      const r = await bulkUpdateAction([...selected], { kind: 'move', locationId: moveTo });
      if (r.ok) {
        toast.success(`${r.updated} items moved`);
        clearSelection();
        router.refresh();
      } else {
        toast.error(r.error ?? 'failed');
      }
    });
  }

  function runDelete() {
    if (!confirm(`Soft-delete ${selected.size} items? (admin only)`)) return;
    startTransition(async () => {
      const r = await bulkUpdateAction([...selected], { kind: 'delete' });
      if (r.ok) {
        toast.success(`${r.updated} items deleted`);
        clearSelection();
        router.refresh();
      } else {
        toast.error(r.error ?? 'failed');
      }
    });
  }

  return (
    <div className="sticky top-2 z-20 mx-auto flex w-fit items-center gap-3 rounded-full border border-accent/40 bg-background/95 px-4 py-2 text-sm shadow-lg backdrop-blur">
      <span className="font-semibold">{selected.size} selected</span>
      <span className="text-muted-foreground">·</span>
      <Button size="sm" variant="outline" disabled={pending} onClick={() => runCondition('good')}>
        ✓ Good
      </Button>
      <Button size="sm" variant="outline" disabled={pending} onClick={() => runCondition('broken')}>
        ⚠ Broken
      </Button>
      <Button size="sm" variant="outline" disabled={pending} onClick={() => runCondition('repair')}>
        🔧 Repair
      </Button>
      <span className="text-muted-foreground">·</span>
      <select
        value={moveTo}
        onChange={(e) => setMoveTo(e.target.value)}
        className="rounded-md border border-border bg-transparent px-2 py-1 text-sm"
      >
        <option value="">Move to…</option>
        {locations.map((l) => (
          <option key={l.id} value={l.id}>
            {l.name}
          </option>
        ))}
      </select>
      <Button size="sm" variant="outline" disabled={pending || !moveTo} onClick={runMove}>
        Move
      </Button>
      <span className="text-muted-foreground">·</span>
      <Button size="sm" variant="destructive" disabled={pending} onClick={runDelete}>
        🗑 Delete
      </Button>
      <Button size="sm" variant="ghost" onClick={clearSelection}>
        Cancel
      </Button>
    </div>
  );
}
