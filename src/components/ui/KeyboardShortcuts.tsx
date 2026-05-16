'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const SHORTCUTS = [
  { keys: 'Ctrl + K', label: 'Open command palette' },
  { keys: '?', label: 'Show this shortcuts list' },
  { keys: 'G then H', label: 'Go to Floor Plan' },
  { keys: 'G then D', label: 'Go to Dashboard' },
  { keys: 'G then I', label: 'Go to All Items' },
  { keys: 'G then Q', label: 'Go to QR Labels' },
  { keys: 'G then R', label: 'Go to Reports' },
  { keys: 'Esc', label: 'Close any modal / drawer' },
  { keys: 'In Designer:', label: '' },
  { keys: 'V', label: 'Select tool' },
  { keys: 'R / O / L', label: 'Rectangle / Circle / L-shape' },
  { keys: 'Delete', label: 'Delete selected room' },
  { keys: 'Ctrl + Z / Ctrl + Y', label: 'Undo / Redo' },
  { keys: 'Ctrl + S', label: 'Save layout' },
];

export function KeyboardShortcutsButton() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let lastG = 0;
    function handler(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const tag = target.tagName;
      // Skip when typing in inputs
      if (tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable) return;

      if (e.key === '?' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setOpen((o) => !o);
        return;
      }
      if (e.key === 'Escape' && open) {
        setOpen(false);
        return;
      }

      // G then X navigation
      if (e.key.toLowerCase() === 'g') {
        lastG = Date.now();
        return;
      }
      if (Date.now() - lastG < 1200) {
        const dest: Record<string, string> = {
          h: '/',
          d: '/dashboard',
          i: '/items',
          q: '/qr',
          r: '/reports',
        };
        const path = dest[e.key.toLowerCase()];
        if (path) {
          e.preventDefault();
          router.push(path);
          lastG = 0;
        }
      }
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, router]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Keyboard shortcuts (press ?)"
        className="hidden h-9 w-9 items-center justify-center rounded-md border border-border text-xs hover:bg-muted lg:inline-flex"
        aria-label="Keyboard shortcuts"
      >
        ⌨️
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">Keyboard shortcuts</h2>
              <button onClick={() => setOpen(false)} className="text-muted-foreground">
                ✕
              </button>
            </header>
            <table className="w-full text-sm">
              <tbody>
                {SHORTCUTS.map((s, i) => (
                  <tr key={i} className="border-b border-border/40">
                    <td className="py-2 pr-4 font-mono text-xs">{s.keys}</td>
                    <td className="py-2 text-muted-foreground">{s.label}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-4 text-xs text-muted-foreground">
              Tip: press <kbd className="rounded bg-muted px-1">G</kbd> then a letter to navigate.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
