'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { createItemAction, updateItemAction, type ItemFormState } from '@/lib/actions/items';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AiCategorizeButton } from '@/components/ai/AiCategorizeButton';

type LocationOption = { id: string; name: string };
type CategoryOption = { id: string; name: string };

type Defaults = {
  id?: string;
  locationId?: string;
  categoryId?: string | null;
  name?: string;
  qty?: number;
  condition?: 'good' | 'broken' | 'repair';
  notes?: string | null;
};

type Props = {
  mode: 'create' | 'edit';
  defaults?: Defaults;
  locations: LocationOption[];
  categories: CategoryOption[];
  onDone?: () => void;
};

const initial: ItemFormState = {};

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Saving…' : label}
    </Button>
  );
}

export function ItemForm({ mode, defaults = {}, locations, categories, onDone }: Props) {
  const boundAction =
    mode === 'edit' && defaults.id
      ? updateItemAction.bind(null, defaults.id)
      : createItemAction;
  const [state, formAction] = useActionState(boundAction, initial);
  const [condition, setCondition] = useState(defaults.condition ?? 'good');
  const [name, setName] = useState(defaults.name ?? '');
  const [notes, setNotes] = useState(defaults.notes ?? '');
  const [categoryId, setCategoryId] = useState<string>(defaults.categoryId ?? '');

  if (state.ok && onDone) {
    setTimeout(onDone, 0);
  }

  function applySuggestion(s: {
    itemName: string;
    category: string;
    condition: 'good' | 'broken' | 'repair';
    damageNotes: string;
  }) {
    setName(s.itemName);
    setCondition(s.condition);
    if (s.damageNotes) setNotes(s.damageNotes);
    const matched = categories.find(
      (c) => c.name.toLowerCase() === s.category.toLowerCase(),
    );
    if (matched) setCategoryId(matched.id);
  }

  return (
    <form action={formAction} className="space-y-4">
      {mode === 'create' && (
        <div className="flex justify-end">
          <AiCategorizeButton onSuggestion={applySuggestion} />
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="name">Item name</Label>
        <Input
          id="name"
          name="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Chair — Black"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="locationId">Location</Label>
          <select
            id="locationId"
            name="locationId"
            required
            defaultValue={defaults.locationId ?? ''}
            className="flex h-10 w-full rounded-md border border-border bg-transparent px-3 text-sm"
          >
            <option value="" disabled>
              Choose location…
            </option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="categoryId">Category</Label>
          <select
            id="categoryId"
            name="categoryId"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="flex h-10 w-full rounded-md border border-border bg-transparent px-3 text-sm"
          >
            <option value="">— Uncategorized —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="qty">Quantity</Label>
          <Input
            id="qty"
            name="qty"
            type="number"
            min={0}
            defaultValue={defaults.qty ?? 1}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="condition">Condition</Label>
          <select
            id="condition"
            name="condition"
            value={condition}
            onChange={(e) =>
              setCondition(e.target.value as 'good' | 'broken' | 'repair')
            }
            className="flex h-10 w-full rounded-md border border-border bg-transparent px-3 text-sm"
          >
            <option value="good">✓ Good</option>
            <option value="broken">⚠ Broken</option>
            <option value="repair">🔧 Repair</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          value={notes ?? ''}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full rounded-md border border-border bg-transparent p-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="e.g. 'Singer brand, R32 gas'"
        />
      </div>

      {state.error && <p className="text-sm text-danger">{state.error}</p>}
      {state.ok && (
        <p className="text-sm text-success">
          {mode === 'create' ? 'Item created.' : 'Item updated.'}
        </p>
      )}

      <div className="flex justify-end gap-2">
        {onDone && (
          <Button type="button" variant="outline" onClick={onDone}>
            Close
          </Button>
        )}
        <Submit label={mode === 'create' ? 'Create item' : 'Save changes'} />
      </div>
    </form>
  );
}
