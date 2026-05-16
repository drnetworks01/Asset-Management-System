'use client';

import { useEffect } from 'react';

/**
 * Catches dev-only "[object Event]" unhandled rejections (HMR / extension noise)
 * so they don't trigger Next.js's red overlay. Real errors with a meaningful
 * message still surface via console.
 */
export function RejectionGuard() {
  useEffect(() => {
    function onRejection(e: PromiseRejectionEvent) {
      const reason = e.reason;
      const isEventLike =
        reason instanceof Event ||
        (typeof reason === 'object' &&
          reason !== null &&
          'type' in reason &&
          !('message' in reason));
      if (isEventLike) {
        e.preventDefault();
        console.warn('[RejectionGuard] swallowed event-like rejection:', reason);
      }
    }
    window.addEventListener('unhandledrejection', onRejection);
    return () => window.removeEventListener('unhandledrejection', onRejection);
  }, []);
  return null;
}
