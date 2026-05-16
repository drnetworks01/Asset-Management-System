import Link from 'next/link';
import { requireUser } from '@/lib/auth/session';
import { Button } from '@/components/ui/button';
import { CommandPalette } from '@/components/search/CommandPalette';
import { QrScanner } from '@/components/qr/QrScanner';
import { ThemeToggle, LocaleToggle } from '@/components/ui/ThemeToggle';
import { KeyboardShortcutsButton } from '@/components/ui/KeyboardShortcuts';

export async function TopNav() {
  const supabaseUser = await requireUser();
  const isAdmin = supabaseUser?.role === 'admin';

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-lg tracking-tight">
            Kurikara Assets
          </Link>
          <nav className="hidden items-center gap-4 text-sm md:flex">
            <Link href="/" className="hover:text-primary">
              Floor Plan
            </Link>
            <Link href="/dashboard" className="hover:text-primary">
              Dashboard
            </Link>
            <Link href="/items" className="hover:text-primary">
              All Items
            </Link>
            <Link href="/qr" className="hover:text-primary">
              QR Labels
            </Link>
            <Link href="/reports" className="hover:text-primary">
              Reports
            </Link>
            {isAdmin && (
              <Link href="/admin/users" className="hover:text-primary">
                Users
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <CommandPalette />
          <QrScanner />
          <KeyboardShortcutsButton />
          <LocaleToggle />
          <ThemeToggle />
          <span className="hidden text-sm text-muted-foreground sm:inline">
            {supabaseUser?.email}
          </span>
          <form action="/logout" method="post">
            <Button type="submit" variant="outline" size="sm">
              Sign out
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
