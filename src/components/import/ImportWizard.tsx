'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  uploadImportAction,
  applyImportAction,
  type ImportDiff,
} from '@/lib/actions/import';
import { Button } from '@/components/ui/button';

export function ImportWizard() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [diff, setDiff] = useState<ImportDiff | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState<{ added: number; updated: number } | null>(null);

  async function onUpload(formData: FormData) {
    setError(null);
    setApplied(null);
    startTransition(async () => {
      const res = await uploadImportAction(formData);
      if (!res.ok) setError(res.error ?? 'upload failed');
      else if (res.diff) setDiff(res.diff);
    });
  }

  async function onApply() {
    if (!diff) return;
    setError(null);
    startTransition(async () => {
      const res = await applyImportAction(diff.uploadId);
      if (!res.ok) {
        setError(res.error ?? 'apply failed');
      } else {
        setApplied(res.applied ?? { added: 0, updated: 0 });
        setDiff(null);
        router.refresh();
      }
    });
  }

  if (applied) {
    return (
      <div className="rounded-xl border border-success/30 bg-success/5 p-6">
        <h2 className="text-lg font-semibold text-success">✓ Import applied</h2>
        <p className="mt-2 text-sm">
          {applied.added} items added · {applied.updated} items updated.
        </p>
        <Button className="mt-4" onClick={() => setApplied(null)}>
          Import another file
        </Button>
      </div>
    );
  }

  if (diff) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-border bg-background/60 p-6">
          <h2 className="text-lg font-semibold">Diff preview — {diff.filename}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {diff.totalRows} rows in file.
          </p>
          <div className="mt-4 grid grid-cols-4 gap-3 text-sm">
            <Stat label="🟢 New" value={diff.added.length} tone="success" />
            <Stat
              label="🟡 Changed"
              value={diff.changed.length}
              tone="accent"
            />
            <Stat label="⚪ Unchanged" value={diff.unchanged} tone="muted" />
            <Stat label="🔴 Orphans" value={diff.orphans} tone="danger" />
          </div>
        </div>

        {diff.added.length > 0 && (
          <Section title={`${diff.added.length} new items`}>
            <ul className="space-y-1 text-sm">
              {diff.added.slice(0, 30).map((r, i) => (
                <li
                  key={i}
                  className="flex justify-between border-b border-border/60 pb-1"
                >
                  <span>
                    <strong>{r.itemName}</strong> in {r.locationName}
                  </span>
                  <span className="tabular-nums text-muted-foreground">
                    ×{r.qty} · {r.condition}
                  </span>
                </li>
              ))}
              {diff.added.length > 30 && (
                <li className="text-xs text-muted-foreground">
                  … {diff.added.length - 30} more
                </li>
              )}
            </ul>
          </Section>
        )}

        {diff.changed.length > 0 && (
          <Section title={`${diff.changed.length} changed items`}>
            <ul className="space-y-1 text-sm">
              {diff.changed.slice(0, 30).map((c, i) => (
                <li key={i} className="border-b border-border/60 pb-1">
                  <strong>{c.before.itemName}</strong> in {c.before.locationName}
                  <div className="text-xs text-muted-foreground">
                    qty {c.before.qty} → {c.after.qty} · {c.before.condition} →{' '}
                    {c.after.condition}
                  </div>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {error && <p className="text-sm text-danger">{error}</p>}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setDiff(null)}>
            Cancel
          </Button>
          <Button onClick={onApply} disabled={pending}>
            {pending ? 'Applying…' : 'Apply Import'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form action={onUpload} className="rounded-xl border border-border bg-background/60 p-6">
      <h2 className="text-lg font-semibold">Upload an Excel file</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Drop an <code>.xlsx</code> file matching the original schema. We&apos;ll show a diff
        before anything is changed.
      </p>
      <input
        type="file"
        name="xlsx"
        accept=".xlsx"
        required
        className="mt-4 block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground"
      />
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
      <Button type="submit" className="mt-4" disabled={pending}>
        {pending ? 'Parsing…' : 'Preview Diff'}
      </Button>
    </form>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: 'success' | 'danger' | 'accent' | 'muted';
}) {
  const cls =
    tone === 'success'
      ? 'border-success/30 bg-success/5 text-success'
      : tone === 'danger'
        ? 'border-danger/30 bg-danger/5 text-danger'
        : tone === 'accent'
          ? 'border-accent/30 bg-accent/5 text-accent'
          : 'border-border bg-background text-foreground';
  return (
    <div className={`rounded-lg border p-3 ${cls}`}>
      <p className="text-xs opacity-80">{label}</p>
      <p className="mt-1 text-xl font-bold tabular-nums">{value}</p>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <details
      className="rounded-xl border border-border bg-background/60 p-4 open:pb-4"
      open
    >
      <summary className="cursor-pointer text-sm font-semibold">{title}</summary>
      <div className="mt-3">{children}</div>
    </details>
  );
}
