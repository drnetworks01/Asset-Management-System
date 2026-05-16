import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Kurikara Assets</h1>
          <p className="text-sm text-muted-foreground">
            Sign in to manage office inventory.
          </p>
        </header>
        <LoginForm />
      </div>
    </main>
  );
}
