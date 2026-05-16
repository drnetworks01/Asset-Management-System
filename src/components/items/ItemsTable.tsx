'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ItemActionsRow, AddItemButton } from '@/components/items/ItemActions';
import { BulkBar } from '@/components/items/BulkBar';

type Row = {
  id: string;
  name: string;
  qty: number;
  condition: 'good' | 'broken' | 'repair';
  notes: string | null;
  locationId: string;
  categoryId: string | null;
  locationName: string | null;
  categoryName: string | null;
};

type LocationOption = { id: string; name: string };
type CategoryOption = { id: string; name: string };

export function ItemsTable({
  rows,
  locations,
  categories,
}: {
  rows: Row[];
  locations: LocationOption[];
  categories: CategoryOption[];
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState('');
  const [conditionFilter, setConditionFilter] = useState<'all' | 'good' | 'broken' | 'repair'>('all');

  const filtered = rows.filter((r) => {
    if (conditionFilter !== 'all' && r.condition !== conditionFilter) return false;
    if (!filter.trim()) return true;
    const q = filter.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      (r.locationName ?? '').toLowerCase().includes(q) ||
      (r.categoryName ?? '').toLowerCase().includes(q) ||
      (r.notes ?? '').toLowerCase().includes(q)
    );
  });

  function toggleAll() {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((r) => r.id)));
  }

  function toggle(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  }

  const brokenCount = rows.filter((r) => r.condition === 'broken').length;

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">All Items</h1>
          <p className="text-sm text-muted-foreground">
            {rows.length} total · {brokenCount} broken
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <input
            type="search"
            placeholder="🔍 Filter…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="h-9 w-48 rounded-md border border-border bg-transparent px-3 text-sm"
          />
          <select
            value={conditionFilter}
            onChange={(e) =>
              setConditionFilter(
                e.target.value as 'all' | 'good' | 'broken' | 'repair',
              )
            }
            className="h-9 rounded-md border border-border bg-transparent px-2 text-sm"
          >
            <option value="all">All conditions</option>
            <option value="good">Good</option>
            <option value="broken">Broken</option>
            <option value="repair">Repair</option>
          </select>
          <AddItemButton locations={locations} categories={categories} />
        </div>
      </header>

      <BulkBar
        selected={selected}
        clearSelection={() => setSelected(new Set())}
        locations={locations}
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <input
                type="checkbox"
                checked={selected.size > 0 && selected.size === filtered.length}
                onChange={toggleAll}
              />
            </TableHead>
            <TableHead>Item</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Qty</TableHead>
            <TableHead>Condition</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <input
                  type="checkbox"
                  checked={selected.has(item.id)}
                  onChange={() => toggle(item.id)}
                />
              </TableCell>
              <TableCell className="font-medium">
                <Link href={`/items/${item.id}`} className="hover:text-primary">
                  {item.name}
                </Link>
              </TableCell>
              <TableCell>{item.locationName ?? '—'}</TableCell>
              <TableCell>{item.categoryName ?? '—'}</TableCell>
              <TableCell className="text-right tabular-nums">{item.qty}</TableCell>
              <TableCell>
                <ItemActionsRow
                  item={{
                    id: item.id,
                    name: item.name,
                    qty: item.qty,
                    condition: item.condition,
                    notes: item.notes,
                    locationId: item.locationId,
                    categoryId: item.categoryId,
                  }}
                  locations={locations}
                  categories={categories}
                />
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                <Link href={`/items/${item.id}`} className="hover:text-primary">
                  Detail →
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
