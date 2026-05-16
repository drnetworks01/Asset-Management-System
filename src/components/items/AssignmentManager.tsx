'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  issueAssignmentAction,
  returnAssignmentAction,
} from '@/lib/actions/assignments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Assignment = {
  id: string;
  assigneeName: string;
  assigneeRole: string | null;
  qty: number;
  notes: string | null;
  issuedAt: string;
  returnedAt: string | null;
};

export function AssignmentManager({
  itemId,
  assignments,
  qty,
}: {
  itemId: string;
  assignments: Assignment[];
  qty: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [issuing, setIssuing] = useState(false);

  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [qtyOut, setQtyOut] = useState(1);
  const [notes, setNotes] = useState('');

  function issue() {
    if (!name.trim()) {
      toast.error('Name required');
      return;
    }
    if (qtyOut < 1 || qtyOut > qty) {
      toast.error(`Qty 1–${qty}`);
      return;
    }
    startTransition(async () => {
      const r = await issueAssignmentAction(itemId, {
        assigneeName: name,
        assigneeRole: role || undefined,
        qty: qtyOut,
        notes: notes || undefined,
      });
      if (r.ok) {
        toast.success(`Issued to ${name}`);
        setName('');
        setRole('');
        setQtyOut(1);
        setNotes('');
        setIssuing(false);
        router.refresh();
      } else {
        toast.error(r.error ?? 'failed');
      }
    });
  }

  function returnIt(id: string) {
    startTransition(async () => {
      const r = await returnAssignmentAction(id);
      if (r.ok) {
        toast.success('Returned');
        router.refresh();
      } else {
        toast.error(r.error ?? 'failed');
      }
    });
  }

  const active = assignments.filter((a) => !a.returnedAt);
  const past = assignments.filter((a) => a.returnedAt);

  return (
    <div className="space-y-3">
      {active.length === 0 && !issuing && (
        <Button onClick={() => setIssuing(true)}>📤 Issue to someone</Button>
      )}

      {issuing && (
        <div className="space-y-2 rounded-xl border border-border bg-background/60 p-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Assignee name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Mr. Perera" />
            </div>
            <div>
              <Label className="text-xs">Role / dept (optional)</Label>
              <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Teacher" />
            </div>
            <div>
              <Label className="text-xs">Qty (max {qty})</Label>
              <Input
                type="number"
                min={1}
                max={qty}
                value={qtyOut}
                onChange={(e) => setQtyOut(Number(e.target.value) || 1)}
              />
            </div>
            <div>
              <Label className="text-xs">Notes (optional)</Label>
              <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIssuing(false)}>
              Cancel
            </Button>
            <Button onClick={issue} disabled={pending}>
              {pending ? 'Issuing…' : 'Issue'}
            </Button>
          </div>
        </div>
      )}

      {active.length > 0 && (
        <ul className="space-y-2">
          {active.map((a) => (
            <li
              key={a.id}
              className="flex items-center justify-between rounded-md border border-accent/40 bg-accent/5 p-3 text-sm"
            >
              <div>
                <p className="font-medium">
                  {a.assigneeName}
                  {a.assigneeRole && (
                    <span className="ml-2 text-muted-foreground">({a.assigneeRole})</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  ×{a.qty} · since {new Date(a.issuedAt).toLocaleDateString()}
                  {a.notes && ` · ${a.notes}`}
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={() => returnIt(a.id)}>
                Return
              </Button>
            </li>
          ))}
        </ul>
      )}

      {past.length > 0 && (
        <details>
          <summary className="cursor-pointer text-xs text-muted-foreground">
            Past assignments ({past.length})
          </summary>
          <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
            {past.map((a) => (
              <li key={a.id} className="border-b border-border/60 pb-1">
                {a.assigneeName} × {a.qty} · {new Date(a.issuedAt).toLocaleDateString()} → {a.returnedAt ? new Date(a.returnedAt).toLocaleDateString() : '—'}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
