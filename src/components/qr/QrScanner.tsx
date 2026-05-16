'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

const SCANNER_ID = 'qr-scanner-container';

export function QrScanner() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef<{ stop: () => Promise<void>; clear: () => void } | null>(null);

  useEffect(() => {
    if (!open || scanning) return;
    let cancelled = false;

    async function start() {
      try {
        const mod = await import('html5-qrcode');
        if (cancelled) return;
        const { Html5Qrcode } = mod;
        const scanner = new Html5Qrcode(SCANNER_ID);
        scannerRef.current = scanner;
        setScanning(true);

        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: 250 },
          (decoded: string) => {
            // Extract code if it's a URL
            try {
              const u = new URL(decoded);
              const path = u.pathname;
              const match = path.match(/\/qr\/([A-Z0-9]+)/i);
              if (match) {
                toast.success(`Scanned: ${match[1]}`);
                close();
                router.push(`/qr/${match[1]}`);
                return;
              }
            } catch {
              // not a URL
            }
            if (/^[A-Z0-9]{6,12}$/i.test(decoded)) {
              toast.success(`Scanned: ${decoded}`);
              close();
              router.push(`/qr/${decoded}`);
              return;
            }
            toast.error(`Unknown QR: ${decoded.slice(0, 24)}`);
          },
          () => {
            // ignore decode errors (continuous polling)
          },
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        toast.error(`Camera failed: ${msg}`);
        setOpen(false);
      }
    }

    start().catch((err) => {
      console.warn('QR scanner failed to start:', err);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function close() {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch {
        // ignore
      }
      scannerRef.current = null;
    }
    setScanning(false);
    setOpen(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Scan QR code"
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-sm hover:bg-muted"
        aria-label="Open QR scanner"
      >
        📷
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-background p-4 shadow-2xl">
            <header className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Scan an item&apos;s QR</h2>
              <Button size="sm" variant="outline" onClick={close}>
                Close
              </Button>
            </header>
            <div id={SCANNER_ID} className="overflow-hidden rounded-lg bg-black" />
            <p className="mt-3 text-xs text-muted-foreground">
              Point your camera at any QR label printed from this app.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
