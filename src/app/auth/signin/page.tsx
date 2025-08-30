
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { signInWithGoogle, signInWithGoogleRedirect, checkRedirectResult, signInWithEmail, EmailPasswordCredentials } from '@/lib/auth';
import { ShieldCheck, Loader2, Mail, Lock } from 'lucide-react';
import { auth } from '@/lib/firebase-client';
import { onAuthStateChanged } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 48 48" fill="none" {...props}>
        <path fill="#4285F4" d="M45.12 24.52c0-1.6-.14-3.15-.4-4.62H24v8.69h11.87c-.52 2.8-2.18 5.18-4.81 6.84v5.62h7.22c4.22-3.88 6.65-9.42 6.65-16.53z"></path>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.91-5.79l-7.22-5.62c-2.13 1.44-4.86 2.3-7.69 2.3-5.88 0-10.86-3.98-12.64-9.31H4.09v5.81C8.17 42.66 15.61 48 24 48z"></path>
        <path fill="#FBBC05" d="M11.36 28.69c-.49-1.48-.77-3.05-.77-4.69s.28-3.21.77-4.69v-5.81H4.09C2.82 16.57 2 19.98 2 24c0 4.02.82 7.43 2.09 10.52l7.27-5.83z"></path>
        <path fill="#EA4335" d="M24 9.8c3.52 0 6.62 1.22 9.07 3.55l6.4-6.4C35.91 2.95 30.48 0 24 0 15.61 0 8.17 5.34 4.09 13.5l7.27 5.81c1.78-5.33 6.76-9.31 12.64-9.31z"></path>
    </svg>
);


export default function SignInPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [credentials, setCredentials] = useState<EmailPasswordCredentials>({ email: '', password: '' });
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSuccessfulLogin = () => {
    const signingToken = localStorage.getItem('pendingSignToken');
    if (signingToken) {
      localStorage.removeItem('pendingSignToken');
      router.push(`/sign?token=${signingToken}`);
    } else {
      router.push('/dashboard');
    }
  };

  useEffect(() => {
    if (!mounted) return;
    
    // Check for a redirect result from Google sign-in
    const handleRedirectResult = async () => {
      setIsGoogleLoading(true);
      try {
        const result = await checkRedirectResult(auth);
        if (result.success && result.user) {
           toast({
              title: 'Signed in successfully!',
              description: `Welcome back, ${result.user.displayName || result.user.email}!`,
            });
            handleSuccessfulLogin();
        } else if (result.error) {
          setError(result.error);
        }
      } catch (e) {
        setError('Failed to process sign-in redirect.');
      } finally {
        setIsGoogleLoading(false);
      }
    };
    handleRedirectResult();

    // Redirect if user is already logged in
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        handleSuccessfulLogin();
      }
    });

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, router]);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };
  
  const handleEmailSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError('');

    try {
      const user = await signInWithEmail(credentials);
      if (user) {
        toast({
          title: 'Signed in successfully!',
          description: `Welcome back, ${user.displayName || user.email}!`,
        });
        handleSuccessfulLogin();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign-in.');
      toast({ variant: 'destructive', title: 'Sign-in Failed', description: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (isGoogleLoading) return;
    setIsGoogleLoading(true);
    setError('');

    try {
      const result = await signInWithGoogle();
      if (result.success && result.user) {
        toast({
          title: 'Signed in successfully!',
          description: `Welcome back, ${result.user.displayName || result.user.email}!`,
        });
        handleSuccessfulLogin();
      } else {
        if (result.errorCode !== 'auth/cancelled-popup-request' && 
            result.errorCode !== 'auth/popup-closed-by-user') {
          setError(result.error || 'An error occurred during sign-in.');
           toast({ variant: 'destructive', title: 'Sign-in Failed', description: result.error });
        }
        if (result.errorCode === 'auth/popup-blocked') {
          toast({ title: 'Popup Blocked', description: 'Redirecting to sign-in page...' });
          await signInWithGoogleRedirect(auth);
        }
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred. Please try again.');
       toast({ variant: 'destructive', title: 'Error', description: 'An unexpected error occurred.' });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <>
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-white tracking-tight mb-1">Muwise</h1>
        <p className="text-sm text-gray-300">Sign in to your workspace</p>
        <div className="flex items-center justify-center gap-2 mt-3 text-xs text-gray-400">
            <ShieldCheck className="w-4 h-4 text-gray-500" />
            <span>Protected Session</span>
        </div>
      </div>

      <div id="login-box" className="bg-[#1C1C2E] rounded-2xl shadow-2xl p-8 border border-white/10">
        {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-500/30 rounded-lg text-red-300 text-sm text-center">
                {error}
            </div>
        )}
        <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input type="email" name="email" value={credentials.email} onChange={handleInputChange} placeholder="Email" required className="pl-10 h-12 bg-[#2a2a3e] border-[#3e3e5b] text-white" />
            </div>
            <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input type="password" name="password" value={credentials.password} onChange={handleInputChange} placeholder="Password" required className="pl-10 h-12 bg-[#2a2a3e] border-[#3e3e5b] text-white" />
            </div>
             <div className="text-right">
                <Link href="#" className="text-xs text-purple-400 hover:text-purple-300 hover:underline">Forgot password?</Link>
            </div>
            <Button type="submit" className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-base" disabled={isSubmitting}>
                 {isSubmitting ? <Loader2 className="animate-spin" /> : 'Sign In'}
            </Button>
        </form>
        <div className="my-6 flex items-center">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="mx-4 text-xs text-gray-400">OR CONTINUE WITH</span>
            <div className="flex-grow border-t border-white/10"></div>
        </div>
        <div className="space-y-6">
            <Button variant="outline" type="button" onClick={handleGoogleSignIn} className="w-full flex items-center justify-center py-2.5 h-12 border border-[#3e3e5b] rounded-lg bg-[#2a2a3e] hover:bg-[#3e3e5b] text-white text-base" disabled={isGoogleLoading}>
                {isGoogleLoading ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : <GoogleIcon className="w-5 h-5 mr-2" />}
                Continue with Google
            </Button>
        </div>
      </div>
      
      <div className="text-center mt-8">
        <p className="text-sm text-gray-400">
          Don't have an account?{' '}
          <Link href="/auth/signup" className="text-purple-400 font-medium hover:text-purple-300 hover:underline">
            Create a free account
          </Link>
        </p>
      </div>
    </>
  );
}
