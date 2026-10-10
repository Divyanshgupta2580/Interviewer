'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Brain, ArrowRight, GraduationCap, ShieldCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';

export default function SignInPage() {
  const router = useRouter();
  const { signIn, signInDemo, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error('Please enter your email and password');
      return;
    }
    clearError();
    await signIn(email.trim(), password);
    const state = useAuthStore.getState();
    if (state.user) {
      toast.success('Signed in successfully', { duration: 5000 });
      router.push(state.user.role === 'admin' ? '/admin/dashboard' : '/dashboard');
    } else if (state.error) {
      toast.error(state.error);
    }
  };

  const handleDemoSignIn = (role: 'student' | 'admin') => {
    signInDemo(role);
    toast.success(`Signed in as demo ${role}`, { duration: 5000 });
    router.push(role === 'admin' ? '/admin/dashboard' : '/dashboard');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Brain className="h-7 w-7 text-brand" />
            <span className="text-xl font-semibold tracking-tight">MSOT</span>
          </Link>
          <p className="text-sm text-muted-foreground">Sign in to continue your interview prep</p>
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Sign In</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" variant="brand" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}

            <div className="relative">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                or try demo mode
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => handleDemoSignIn('student')}
                disabled={isLoading}
              >
                <GraduationCap className="mr-1.5 h-4 w-4" />
                Demo Student
              </Button>
              <Button
                variant="outline"
                onClick={() => handleDemoSignIn('admin')}
                disabled={isLoading}
              >
                <ShieldCheck className="mr-1.5 h-4 w-4" />
                Demo Admin
              </Button>
            </div>
          </CardContent>
          <CardFooter className="justify-center">
            <p className="text-xs text-muted-foreground">
              No account?{' '}
              <Link href="/signup" className="font-medium text-brand hover:underline">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Demo accounts use sample data stored in your browser. Real accounts use secure Supabase authentication.
        </p>
      </div>
    </div>
  );
}
