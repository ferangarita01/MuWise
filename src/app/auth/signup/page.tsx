
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { signUpWithEmail, signInWithGoogle } from '@/lib/auth';
import { FirebaseError } from 'firebase/app';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Zap, ShieldCheck, User, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, Info, Chrome } from 'lucide-react';

export default function SignUpPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGoogleSignUp = async () => {
    try {
      const user = await signInWithGoogle();
      if (user) {
        toast({
          title: 'Account created!',
          description: `Welcome to Muwise, ${user.displayName}!`,
        });
        router.push('/dashboard');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'There was a problem with your Google sign-up attempt.',
      });
      console.error(error);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName) {
      toast({
        variant: 'destructive',
        title: 'Missing fields',
        description: 'Please fill in all required fields.',
      });
      return;
    }
     if (password.length < 8) {
      toast({
        variant: 'destructive',
        title: 'Password too short',
        description: 'Password must be at least 8 characters long.',
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const user = await signUpWithEmail({ email, password, fullName });
      if (user) {
        toast({
          title: 'Account created!',
          description: 'Welcome to Muwise! Redirecting you to the dashboard...',
        });
        router.push('/dashboard');
      }
    } catch (error) {
       if (error instanceof FirebaseError && error.code === 'auth/email-already-in-use') {
         toast({
            variant: 'destructive',
            title: 'Email Already Registered',
            description: (
              <>
                An account with this email already exists.{' '}
                <Link href="/auth/signin" className="underline font-bold">
                  Sign in instead
                </Link>
                .
              </>
            ),
         });
       } else {
          toast({
            variant: 'destructive',
            title: 'Sign up failed.',
            description: 'An unexpected error occurred. Please try again.',
          });
       }
      console.error('Sign up error:', error);
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
        <h1 className="text-2xl font-bold text-white tracking-tight mb-1">Create your Muwise Account</h1>
        <p className="text-sm text-gray-300">Join the future of music rights management</p>
         <div className="flex items-center justify-center gap-2 mt-3">
            <div className="security-indicator">
                <ShieldCheck className="w-3 h-3" />
                <span>Start your 14-day free trial</span>
            </div>
        </div>
      </div>

      <div id="login-box" className="bg-gray-800/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/10 p-6 slide-up relative overflow-hidden" style={{ animationDelay: '0.2s' }}>
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-700/10 via-transparent to-purple-700/10 pointer-events-none"></div>
        
        <div className="space-y-4">
            <Button variant="outline" type="button" onClick={handleGoogleSignUp} className="w-full ripple flex items-center justify-center px-4 py-3 border border-white/10 rounded-xl bg-transparent hover:bg-gray-700 transition-all duration-200 hover:border-white/20 hover:-translate-y-0.5 hover:shadow-md group">
              <Chrome className="w-5 h-5 text-gray-200 group-hover:text-indigo-500 transition-colors" />
              <span className="ml-2 text-sm font-medium text-gray-200 group-hover:text-indigo-500 transition-colors">Sign up with Google</span>
            </Button>

            <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                <div className="relative flex justify-center text-sm"><span className="px-3 bg-gray-800 text-gray-300 font-medium">Or continue with email</span></div>
            </div>
        </div>

        <form onSubmit={handleEmailSignUp} className="space-y-6 relative z-10 mt-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="block text-sm font-medium text-gray-200">Full Name <span className="text-xs text-red-400">*</span></Label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
              <Input
                type="text"
                id="fullName"
                name="fullName"
                required
                className="input-focus w-full px-4 py-3 pl-12 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all duration-300 bg-gray-700 focus:bg-gray-600 hover:border-white/20 text-white placeholder-gray-400"
                placeholder="Emma Chen"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
              />
            </div>
          </div>
          
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
                placeholder="8+ characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
              <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" className="ripple w-full bg-gradient-to-r from-indigo-700 to-purple-700 text-white py-3 px-4 rounded-xl font-medium hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" disabled={isSubmitting}>
             {isSubmitting ? <Loader2 className="animate-spin" /> : <>Create Account <ArrowRight className="w-4 h-4" /></>}
          </Button>

          <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-700/50 p-3 rounded-lg border border-white/10">
            <Info className="w-4 h-4 text-indigo-500 flex-shrink-0" />
            <span>By signing up, you agree to our Terms of Service and Privacy Policy.</span>
          </div>

        </form>
      </div>

      <div className="text-center mt-6 fade-in" style={{ animationDelay: '0.4s' }}>
        <p className="text-sm text-gray-300">
          Already have an account?{' '}
          <Link href="/auth/signin" className="text-indigo-500 font-medium hover:text-indigo-400 transition-colors hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </>
  );
}
