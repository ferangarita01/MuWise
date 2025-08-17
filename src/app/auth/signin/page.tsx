
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { signInWithGoogle, signInWithEmail, signInWithGoogleRedirect, checkRedirectResult } from '@/lib/auth';
import { FirebaseError } from 'firebase/app';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Zap, ShieldCheck, Mail, Lock, Eye, EyeOff, Info, Chrome, ArrowRight, Loader2 } from 'lucide-react';
import { auth } from '@/lib/firebase-client';

const AppleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12.015,2.2c-2.3,0-4.043,1.355-5.263,2.695C5.39,6.41,5.219,8.23,6.236,10.61c0.528,1.235,1.528,2.395,2.8,3.22 c0.675,0.44,1.459,0.78,2.2,0.78c0.273,0,0.54-0.034,0.799-0.09c0.961-0.23,1.961-0.81,2.8-1.57c-1.583-0.94-2.852-2.37-3.415-3.86 C11.23,8.71,11.021,8.25,11.021,7.775c0-1.845,1.4-3.52,1.434-3.565C12.383,4.28,12.348,4.27,12.314,4.265 c-1.125-0.34-2.312,0.48-2.93,0.48c-1.259,0-2.345-0.965-3.6-0.965c-2.235,0-4.025,1.755-4.025,4.365 c0,2.835,1.995,5.18,4.615,5.18c1.36,0,2.375-0.795,3.39-0.795c0.961,0,2.155,0.795,3.46,0.795 c2.723,0,4.425-2.52,4.425-5.06C18.067,5.55,15.659,2.2,12.015,2.2z M12.597,1.01c1.341-0.07,2.671,0.56,3.481,1.38 C16.653,1.69,15.15,0.56,13.29,0.5c-0.09,0-0.19,0-0.27,0.01C12.19,0.55,12.087,0.57,11.995,0.59 c-1.041,0.22-2.221,0.85-3.111,0.85c-1.285,0-2.585-0.8-4.015-0.8c-1.467,0-2.922,0.88-3.797,2.29c-1.63,2.62-0.89,6.59,1.13,8.88 c0.916,1.04,2.026,1.86,3.456,1.86c1.248,0,2.233-0.74,3.248-0.74c1.13,0,2.07,0.74,3.4,0.74c1.55,0,2.78-0.89,3.67-1.89 c0.67-0.75,1.14-1.65,1.37-2.61c-0.12,0.02-2.58,0.7-5.02-1.15c-1.46-1.1-2.33-2.67-2.73-4.14c-0.04-0.14-0.07-0.29-0.09-0.44 c-0.18-1.2,0.49-2.35,0.61-2.5c0.07-0.09,0.12-0.17,0.15-0.21c0.69-0.93,1.84-1.54,3.02-1.54c0.2,0,0.39,0.02,0.58,0.05 C15.937,2.44,14.437,1.09,12.597,1.01z"></path>
    </svg>
);


export default function SignInPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');


  useEffect(() => {
    const handleRedirectResult = async () => {
      setIsGoogleLoading(true);
      try {
        const result = await checkRedirectResult(auth);
        if (result.success && result.user) {
           toast({
              title: 'Signed in successfully!',
              description: `Welcome back, ${result.user.displayName || result.user.email}!`,
            });
          router.push('/dashboard');
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
  }, [router, toast]);


  const handleGoogleSignIn = async () => {
    if (isSubmitting || isGoogleLoading) return;

    setIsGoogleLoading(true);
    setError('');

    try {
      const result = await signInWithGoogle(auth);
      
      if (result.success && result.user) {
        toast({
          title: 'Signed in successfully!',
          description: `Welcome back, ${result.user.displayName || result.user.email}!`,
        });
        router.push('/dashboard');
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
    setIsSubmitting(true);
    setError('');
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
            description = 'Email o contraseña incorrectos. Por favor, verifica tus credenciales.';
            break;
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
      setError(description);
      console.error(error);
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="text-center mb-8 fade-in floating">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-700 to-purple-700 rounded-2xl mb-4 shadow-xl glow relative overflow-hidden">
          <Zap className="w-8 h-8 text-white relative z-10" />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-700 opacity-20"></div>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight mb-1">Muwise</h1>
        <p className="text-sm text-gray-300">Sign in to your workspace</p>
        <div className="flex items-center justify-center gap-2 mt-3">
            <div className="security-indicator">
                <ShieldCheck className="w-3 h-3" />
                <span>Protected Session</span>
            </div>
        </div>
      </div>

      <div id="login-box" className="bg-gray-800/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/10 p-6 slide-up relative overflow-hidden" style={{ animationDelay: '0.2s' }}>
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-700/10 via-transparent to-purple-700/10 pointer-events-none"></div>
        {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-500/30 rounded-lg text-red-300 text-sm text-center">
                {error}
            </div>
        )}
        <form onSubmit={handleEmailSignIn} className="space-y-6 relative z-10">
          <div className="space-y-2">
            <Label htmlFor="email" className="block text-sm font-medium text-gray-200">Email address <span className="text-xs text-red-400">*</span></Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
              <Input
                type="email"
                id="email"
                name="email"
                required
                className="input-focus w-full px-4 py-3 pl-12 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all duration-300 bg-gray-700 focus:bg-gray-600 hover:border-white/20 text-white placeholder-gray-400"
                placeholder="emma.chen@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password <span className="text-xs text-red-400">*</span></Label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
              <Input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                required
                className="input-focus w-full px-4 py-3 pl-12 pr-12 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all duration-300 bg-gray-700 focus:bg-gray-600 hover:border-white/20 text-white placeholder-gray-400"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Checkbox id="remember-me" className="w-4 h-4 text-indigo-700 border-white/20 bg-gray-700 rounded focus:ring-indigo-600 focus:ring-2" />
              <Label htmlFor="remember-me" className="ml-2 text-sm text-gray-300 font-normal">Remember me</Label>
            </div>
            <Link href="#" className="text-sm text-indigo-500 hover:text-indigo-400 font-medium transition-colors hover:underline">
              Forgot password?
            </Link>
          </div>
          
          <Button type="submit" className="ripple w-full bg-gradient-to-r from-indigo-700 to-purple-700 text-white py-3 px-4 rounded-xl font-medium hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" disabled={isSubmitting || isGoogleLoading}>
            {isSubmitting ? <Loader2 className="animate-spin" /> : <>Sign in securely <ArrowRight className="w-4 h-4" /></>}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
            <div className="relative flex justify-center text-sm"><span className="px-3 bg-gray-800 text-gray-300 font-medium">Or continue with</span></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" type="button" onClick={() => toast({ title: 'Coming Soon!', description: 'Apple sign-in will be available in a future update.'})} className="ripple flex items-center justify-center px-4 py-3 border border-white/10 rounded-xl bg-transparent hover:bg-gray-700 transition-all duration-200 hover:border-white/20 hover:-translate-y-0.5 hover:shadow-md group">
              <AppleIcon className="w-5 h-5 text-gray-200 group-hover:text-white transition-colors" />
              <span className="ml-2 text-sm font-medium text-gray-200 group-hover:text-white transition-colors">Apple</span>
            </Button>
            <Button variant="outline" type="button" onClick={handleGoogleSignIn} className="ripple flex items-center justify-center px-4 py-3 border border-white/10 rounded-xl bg-transparent hover:bg-gray-700 transition-all duration-200 hover:border-white/20 hover:-translate-y-0.5 hover:shadow-md group" disabled={isSubmitting || isGoogleLoading}>
               {isGoogleLoading ? <Loader2 className="animate-spin" /> : <Chrome className="w-5 h-5 text-gray-200 group-hover:text-indigo-500 transition-colors" />}
              <span className="ml-2 text-sm font-medium text-gray-200 group-hover:text-indigo-500 transition-colors">Google</span>
            </Button>
          </div>
        </form>
      </div>
      
      <div className="text-center mt-6 fade-in" style={{ animationDelay: '0.4s' }}>
        <p className="text-sm text-gray-300">
          Don't have an account?{' '}
          <Link href="/auth/signup" className="text-indigo-500 font-medium hover:text-indigo-400 transition-colors hover:underline">
            Start your free trial
          </Link>
        </p>
      </div>
    </>
  );
}

    