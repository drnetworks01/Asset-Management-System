'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { updateItemValueAction } from '@/lib/actions/items';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function ValueEditor({
  itemId,
  unitValueLkr,
  lowStockThreshold,
}: {
  itemId: string;
  unitValueLkr: number | null;
  lowStockThreshold: number | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [value, setValue] = useState<string>(
    unitValueLkr !== null ? String(unitValueLkr) : '',
  );
  const [threshold, setThreshold] = useState<string>(
    lowStockThreshold !== null ? String(lowStockThreshold) : '',
  );

  function save() {
    const v = value === '' ? null : Number(value);
    const t = threshold === '' ? null : Number(threshold);
    if (v !== null && (!Number.isFinite(v) || v < 0)) {
      toast.error('Invalid value');
      return;
    }
    if (t !== null && (!Number.isFinite(t) || t < 0)) {
      toast.error('Invalid threshold');
      return;
    }
    startTransition(async () => {
      const r = await updateItemValueAction(itemId, v, t);
      if (r.ok) {
        toast.success('Saved');
        router.refresh();
      } else {
        toast.error(r.error ?? 'failed');
      }
    });
  }

  return (
    <details className="rounded-xl border border-border bg-background/60 p-4">
      <summary className="cursor-pointer text-sm font-semibold">
        💰 Set value & low-stock threshold
      </summary>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Unit value (LKR)</Label>
          <Input
            type="number"
            min={0}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="e.g. 12000"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Low-stock alert when qty ≤</Label>
          <Input
            type="number"
            min={0}
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            placeholder="e.g. 5"
          />
        </div>
      </div>
      <Button onClick={save} disabled={pending} className="mt-3">
        {pending ? 'Saving…' : 'Save value'}
      </Button>
    </details>
  );
}
