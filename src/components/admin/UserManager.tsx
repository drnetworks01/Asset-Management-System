'use client';

import { useState, useTransition, useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  createUserAction,
  updateUserAction,
  deleteUserAction,
  type UserFormResult,
} from '@/lib/actions/users';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type UserRow = {
  id: string;
  email: string;
  name: string | null;
  role: 'admin' | 'staff' | 'viewer';
  createdAt: string;
};

const initial: UserFormResult = { ok: false };

export function UserManager({
  users,
  currentUserId,
}: {
  users: UserRow[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [openCreate, setOpenCreate] = useState(false);
  const [state, formAction] = useActionState(createUserAction, initial);

  if (state.ok) {
    setTimeout(() => {
      toast.success('User created');
      setOpenCreate(false);
      router.refresh();
    }, 0);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setOpenCreate((o) => !o)}>
          {openCreate ? 'Cancel' : '+ Add user'}
        </Button>
      </div>

      {openCreate && (
        <form
          action={formAction}
          className="space-y-3 rounded-xl border border-border bg-background/60 p-5"
        >
          <h2 className="text-lg font-semibold">New user</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="u-email">Email</Label>
              <Input id="u-email" name="email" type="email" required />
            </div>
            <div>
              <Label htmlFor="u-name">Name (optional)</Label>
              <Input id="u-name" name="name" />
            </div>
            <div>
              <Label htmlFor="u-password">Password</Label>
              <Input id="u-password" name="password" type="password" required minLength={6} />
            </div>
            <div>
              <Label htmlFor="u-role">Role</Label>
              <select
                id="u-role"
                name="role"
                defaultValue="staff"
                className="flex h-10 w-full rounded-md border border-border bg-transparent px-3 text-sm"
              >
                <option value="viewer">Viewer (read only)</option>
                <option value="staff">Staff (add/edit items)</option>
                <option value="admin">Admin (full access)</option>
              </select>
            </div>
          </div>
          {state.error && <p className="text-sm text-danger">{state.error}</p>}
          <Button type="submit">Create user</Button>
        </form>
      )}

      <table className="w-full text-sm">
        <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="pb-2">Email</th>
            <th className="pb-2">Name</th>
            <th className="pb-2">Role</th>
            <th className="pb-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <UserRowEditor
              key={u.id}
              user={u}
              isSelf={u.id === currentUserId}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function UserRowEditor({ user, isSelf }: { user: UserRow; isSelf: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [resetPwd, setResetPwd] = useState(false);
  const [pwd, setPwd] = useState('');

  function updateRole(role: 'admin' | 'staff' | 'viewer') {
    startTransition(async () => {
      const r = await updateUserAction(user.id, { role });
      if (r.ok) {
        toast.success(`Role updated to ${role}`);
        router.refresh();
      } else {
        toast.error(r.error ?? 'failed');
      }
    });
  }

  function savePassword() {
    if (pwd.length < 6) {
      toast.error('Password 6+ chars');
      return;
    }
    startTransition(async () => {
      const r = await updateUserAction(user.id, { password: pwd });
      if (r.ok) {
        toast.success('Password updated');
        setResetPwd(false);
        setPwd('');
      } else {
        toast.error(r.error ?? 'failed');
      }
    });
  }

  function del() {
    if (isSelf) {
      toast.error('Cannot delete yourself.');
      return;
    }
    if (!confirm(`Delete ${user.email}? This is irreversible.`)) return;
    startTransition(async () => {
      const r = await deleteUserAction(user.id);
      if (r.ok) {
        toast.success('User deleted');
        router.refresh();
      } else {
        toast.error(r.error ?? 'failed');
      }
    });
  }

  return (
    <>
      <tr className="border-t border-border">
        <td className="py-2 font-medium">
          {user.email}
          {isSelf && <span className="ml-2 text-xs text-muted-foreground">(you)</span>}
        </td>
        <td className="py-2 text-muted-foreground">{user.name ?? '—'}</td>
        <td className="py-2">
          <select
            value={user.role}
            disabled={pending || isSelf}
            onChange={(e) => updateRole(e.target.value as typeof user.role)}
            className="rounded border border-border bg-transparent px-2 py-1 text-sm"
          >
            <option value="viewer">viewer</option>
            <option value="staff">staff</option>
            <option value="admin">admin</option>
          </select>
        </td>
        <td className="py-2 text-right">
          <button
            onClick={() => setResetPwd((o) => !o)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            🔑 Reset PW
          </button>
          {!isSelf && (
            <button
              onClick={del}
              className="ml-3 text-xs text-muted-foreground hover:text-danger"
            >
              🗑 Delete
            </button>
          )}
        </td>
      </tr>
      {resetPwd && (
        <tr className="border-t border-dashed border-border/60 bg-muted/20">
          <td colSpan={4} className="px-2 py-3">
            <div className="flex items-center gap-2">
              <Input
                type="password"
                placeholder="New password (6+ chars)"
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                className="max-w-xs"
              />
              <Button size="sm" disabled={pending} onClick={savePassword}>
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setResetPwd(false);
                  setPwd('');
                }}
              >
                Cancel
              </Button>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
