import Link from 'next/link';
import { requireUser } from '@/lib/auth/session';
import { Button } from '@/components/ui/button';
import { CommandPalette } from '@/components/search/CommandPalette';

export async function TopNav() {
  const user = await requireUser();

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-lg tracking-tight">
            Kurikara Assets
          </Link>
          <nav className="flex items-center gap-4 text-sm">
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
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <CommandPalette />
          <span className="text-sm text-muted-foreground">{user?.email}</span>
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
