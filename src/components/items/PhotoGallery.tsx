'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  uploadPhotoAction,
  deletePhotoAction,
} from '@/lib/actions/photos';

type Photo = {
  id: string;
  storagePath: string;
  caption: string | null;
};

export function PhotoGallery({
  itemId,
  photos,
}: {
  itemId: string;
  photos: Photo[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [lightbox, setLightbox] = useState<Photo | null>(null);

  function onSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('photo', file);
    startTransition(async () => {
      const r = await uploadPhotoAction(itemId, formData);
      if (r.ok) {
        toast.success('Photo uploaded');
        router.refresh();
      } else {
        toast.error(r.error ?? 'upload failed');
      }
    });
    e.target.value = '';
  }

  function del(photo: Photo) {
    if (!confirm('Delete this photo?')) return;
    startTransition(async () => {
      const r = await deletePhotoAction(photo.id);
      if (r.ok) {
        toast.success('Photo deleted');
        router.refresh();
      } else {
        toast.error(r.error ?? 'failed');
      }
    });
  }

  return (
    <section className="space-y-3">
      <header className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Photos ({photos.length})
        </h3>
        <label className="cursor-pointer rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted">
          {pending ? 'Uploading…' : '📷 Add photo'}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={onSelect}
          />
        </label>
      </header>

      {photos.length === 0 ? (
        <p className="rounded-md border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
          No photos yet. Use your phone camera to add one.
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {photos.map((p) => (
            <div key={p.id} className="group relative aspect-square overflow-hidden rounded-lg border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/photos/${p.storagePath}`}
                alt={p.caption ?? ''}
                className="h-full w-full cursor-pointer object-cover"
                onClick={() => setLightbox(p)}
              />
              <button
                onClick={() => del(p)}
                className="absolute right-1 top-1 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          onClick={() => setLightbox(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/photos/${lightbox.storagePath}`}
            alt={lightbox.caption ?? ''}
            className="max-h-full max-w-full rounded-lg"
          />
        </div>
      )}
    </section>
  );
}
