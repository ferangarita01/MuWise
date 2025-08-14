
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import { AppleIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { signInWithGoogle, signInWithEmail } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { FirebaseError } from 'firebase/app';

export default function SignInPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleGoogleSignIn = async () => {
    try {
      const user = await signInWithGoogle();
      if (user) {
        toast({
          title: 'Signed in successfully!',
          description: `Welcome back, ${user.displayName}!`,
        });
        router.push('/dashboard');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'There was a problem with your Google sign-in attempt.',
      });
      console.error(error);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
     if (!email || !password) {
      toast({
        variant: 'destructive',
        title: 'Missing fields',
        description: 'Please enter both email and password.',
      });
      return;
    }
    try {
      const user = await signInWithEmail({ email, password });
      if (user) {
        toast({
          title: 'Signed in successfully!',
          description: `Welcome back, ${user.displayName || user.email}!`,
        });
        router.push('/dashboard');
      }
    } catch (error) {
      let description = 'An unexpected error occurred. Please try again.';
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case 'auth/invalid-credential':
          case 'auth/invalid-email':
          case 'auth/wrong-password':
          case 'auth/user-not-found':
            description = 'Invalid email or password. Please check your credentials.';
            break;
          case 'auth/too-many-requests':
            description = 'Access temporarily disabled due to too many failed login attempts.';
            break;
        }
      }
      toast({
        variant: 'destructive',
        title: 'Sign-in failed.',
        description: description,
      });
      console.error(error);
    }
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Welcome Back</CardTitle>
        <CardDescription>
          Sign in to your Muwise account to continue.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleEmailSignIn}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" type="button" onClick={handleGoogleSignIn}>
              <svg role="img" viewBox="0 0 24 24" className="mr-2 h-4 w-4"><path fill="currentColor" d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.05 1.05-2.36 1.95-4.25 1.95-3.52 0-6.33-2.89-6.33-6.42s2.81-6.42 6.33-6.42c1.93 0 3.32.74 4.18 1.59l2.48-2.38C18.09 2.49 15.64 1 12.48 1 7.1 1 3.06 5.14 3.06 10.5S7.1 20 12.48 20c2.73 0 4.93-.91 6.57-2.54 1.72-1.71 2.26-4.25 2.26-6.38 0-.61-.05-1.22-.16-1.82h-8.2z"></path></svg>
              Google
            </Button>
            <Button variant="outline" type="button">
              <AppleIcon className="mr-2 h-4 w-4" />
              Apple
            </Button>
          </div>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="m@example.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link href="#" className="text-sm text-primary hover:underline">
                  Forgot password?
              </Link>
            </div>
            <Input 
              id="password" 
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>
          <div className="flex items-center space-x-2">
              <Checkbox id="remember-me" />
              <Label htmlFor="remember-me" className="font-normal">Remember me</Label>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-4">
          <Button className="w-full" type="submit">Sign In</Button>
          <div className="text-sm text-center text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
