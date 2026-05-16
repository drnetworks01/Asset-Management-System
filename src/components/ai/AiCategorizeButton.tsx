'use client';

import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

type Suggestion = {
  itemName: string;
  category: string;
  condition: 'good' | 'broken' | 'repair';
  damageNotes: string;
  confidence: number;
};

type Props = {
  onSuggestion: (s: Suggestion) => void;
};

export function AiCategorizeButton({ onSuggestion }: Props) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [pending, setPending] = useState(false);

  function pick() {
    fileRef.current?.click();
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setPending(true);

    try {
      // Read as data URL (small images only — let's keep it client-side)
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });

      const res = await fetch('/api/ai/categorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageDataUrl: dataUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? 'AI failed');
        return;
      }
      toast.success(
        `AI suggests: ${data.suggestion.itemName} (${Math.round(data.suggestion.confidence * 100)}%)`,
      );
      onSuggestion(data.suggestion);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(msg);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <Button type="button" variant="outline" onClick={pick} disabled={pending}>
        {pending ? 'Analyzing…' : '🤖 Suggest from photo'}
      </Button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={onFile}
      />
    </>
  );
}
