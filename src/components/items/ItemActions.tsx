'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  toggleConditionAction,
  deleteItemAction,
} from '@/lib/actions/items';
import { ItemForm } from './ItemForm';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type LocationOption = { id: string; name: string };
type CategoryOption = { id: string; name: string };

type Item = {
  id: string;
  name: string;
  qty: number;
  condition: 'good' | 'broken' | 'repair';
  notes: string | null;
  locationId: string;
  categoryId: string | null;
};

type Props = {
  item: Item;
  locations: LocationOption[];
  categories: CategoryOption[];
};

export function ItemActionsRow({ item, locations, categories }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={() =>
            startTransition(async () => {
              await toggleConditionAction(item.id);
              router.refresh();
            })
          }
          disabled={pending}
          title={
            item.condition === 'good'
              ? 'Mark as broken'
              : 'Mark as good'
          }
          className={cn(
            'rounded-full px-2 py-0.5 text-xs transition-colors',
            item.condition === 'broken'
              ? 'bg-danger/15 text-danger hover:bg-danger/25'
              : 'bg-success/15 text-success hover:bg-success/25',
          )}
        >
          {item.condition}
        </button>
        <button
          onClick={() => setEditing(true)}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          ✎
        </button>
        <button
          onClick={() => setConfirmDelete(true)}
          className="text-xs text-muted-foreground hover:text-danger"
          aria-label="Delete item"
        >
          🗑
        </button>
      </div>

      {editing && (
        <Modal onClose={() => setEditing(false)} title={`Edit: ${item.name}`}>
          <ItemForm
            mode="edit"
            defaults={{
              id: item.id,
              locationId: item.locationId,
              categoryId: item.categoryId,
              name: item.name,
              qty: item.qty,
              condition: item.condition,
              notes: item.notes,
            }}
            locations={locations}
            categories={categories}
            onDone={() => {
              setEditing(false);
              router.refresh();
            }}
          />
        </Modal>
      )}

      {confirmDelete && (
        <Modal onClose={() => setConfirmDelete(false)} title="Delete item?">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">{item.name}</strong> (×{item.qty})
            will be soft-deleted. Reports will exclude it from now on.
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await deleteItemAction(item.id);
                  setConfirmDelete(false);
                  router.refresh();
                })
              }
            >
              {pending ? 'Deleting…' : 'Delete'}
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}

export function AddItemButton({
  locations,
  categories,
  defaultLocationId,
  label = '+ Add Item',
}: {
  locations: LocationOption[];
  categories: CategoryOption[];
  defaultLocationId?: string;
  label?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>{label}</Button>
      {open && (
        <Modal onClose={() => setOpen(false)} title="Add new item">
          <ItemForm
            mode="create"
            defaults={{ locationId: defaultLocationId }}
            locations={locations}
            categories={categories}
            onDone={() => {
              setOpen(false);
              router.refresh();
            }}
          />
        </Modal>
      )}
    </>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl border border-border bg-background p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            ✕
          </button>
        </header>
        {children}
      </div>
    </div>
  );
}
