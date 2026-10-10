'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Brain, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';

export default function SignUpPage() {
  const router = useRouter();
  const { signUp, isLoading, error, clearError } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    clearError();
    await signUp(email.trim(), password, name.trim());
    const state = useAuthStore.getState();
    if (state.user) {
      toast.success('Account created successfully');
      router.push('/dashboard');
    } else if (state.error) {
      toast.error(state.error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Brain className="h-7 w-7 text-brand" />
            <span className="text-xl font-semibold tracking-tight">MSOT</span>
          </Link>
          <p className="text-sm text-muted-foreground">Create your account to start practising</p>
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Sign Up</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Display Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
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
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" variant="brand" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}
          </CardContent>
          <CardFooter className="justify-center">
            <p className="text-xs text-muted-foreground">
              Already have an account?{' '}
              <Link href="/signin" className="font-medium text-brand hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Your account is secured by Supabase authentication. New accounts are created as students.
        </p>
      </div>
    </div>
  );
}
