type AuditEntry = {
  id: string;
  action: string;
  before: unknown;
  after: unknown;
  userEmail: string | null;
  createdAt: string;
};

const ACTION_LABEL: Record<string, string> = {
  create: 'Created',
  update: 'Updated',
  delete: 'Deleted',
  import: 'Imported',
  revert: 'Reverted',
  login: 'Login',
};

export function AuditTimeline({ entries }: { entries: AuditEntry[] }) {
  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No history yet.
      </p>
    );
  }

  return (
    <ol className="space-y-3 border-l-2 border-border pl-4">
      {entries.map((e) => (
        <li key={e.id} className="relative">
          <span className="absolute -left-[22px] top-1 inline-block h-3 w-3 rounded-full border-2 border-background bg-primary" />
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-sm font-medium">
              {ACTION_LABEL[e.action] ?? e.action}
            </p>
            <time className="text-xs text-muted-foreground tabular-nums">
              {formatStamp(e.createdAt)}
            </time>
          </div>
          {e.userEmail && (
            <p className="text-xs text-muted-foreground">by {e.userEmail}</p>
          )}
          {e.before || e.after ? (
            <pre className="mt-1 max-h-32 overflow-auto whitespace-pre-wrap rounded bg-muted/50 p-2 text-[10px] text-muted-foreground">
              {JSON.stringify({ before: e.before, after: e.after }, null, 2)}
            </pre>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

function formatStamp(s: string): string {
  try {
    const d = new Date(s);
    return d.toLocaleString();
  } catch {
    return s;
  }
}
