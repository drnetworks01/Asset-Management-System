'use client';

import { useEffect } from 'react';
import { useUIStore } from '@/stores/uiStore';

export function ThemeToggle() {
  const theme = useUIStore((s) => s.theme);
  const toggle = useUIStore((s) => s.toggleTheme);

  useEffect(() => {
    const html = document.documentElement;
    if (theme === 'dark') html.classList.add('dark');
    else html.classList.remove('dark');
  }, [theme]);

  return (
    <button
      onClick={toggle}
      title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-sm hover:bg-muted"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? '🌙' : '☀️'}
    </button>
  );
}

export function LocaleToggle() {
  const locale = useUIStore((s) => s.locale);
  const setLocale = useUIStore((s) => s.setLocale);

  return (
    <button
      onClick={() => setLocale(locale === 'en' ? 'si' : 'en')}
      title="Switch language"
      className="inline-flex h-9 items-center rounded-md border border-border px-2 text-xs font-medium hover:bg-muted"
    >
      {locale === 'en' ? '🇱🇰 සිං' : '🇬🇧 EN'}
    </button>
  );
}
