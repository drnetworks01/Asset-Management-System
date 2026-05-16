import { db, schema } from '@/lib/db/client';
import { requireUser } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { UserManager } from '@/components/admin/UserManager';

export const dynamic = 'force-dynamic';

export default async function UsersAdminPage() {
  const me = await requireUser();
  if (!me) redirect('/login');
  if (me.role !== 'admin') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <h1 className="text-2xl font-bold">Admin only</h1>
        <p className="mt-2 text-muted-foreground">
          You need the <code>admin</code> role to manage users.
        </p>
      </div>
    );
  }

  const users = await db
    .select({
      id: schema.users.id,
      email: schema.users.email,
      name: schema.users.name,
      role: schema.users.role,
      createdAt: schema.users.createdAt,
    })
    .from(schema.users)
    .orderBy(schema.users.email);

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <header>
        <h1 className="text-2xl font-bold">Users & Roles</h1>
        <p className="text-sm text-muted-foreground">
          Add staff or viewers, change roles, reset passwords.
        </p>
      </header>
      <UserManager users={users} currentUserId={me.id} />
    </div>
  );
}
