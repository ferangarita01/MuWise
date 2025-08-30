
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { signInWithGoogle, signUpWithEmail } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Zap, ShieldCheck, Loader2, User, Mail, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 48 48" fill="none" {...props}>
        <path fill="#4285F4" d="M45.12 24.52c0-1.6-.14-3.15-.4-4.62H24v8.69h11.87c-.52 2.8-2.18 5.18-4.81 6.84v5.62h7.22c4.22-3.88 6.65-9.42 6.65-16.53z"></path>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.91-5.79l-7.22-5.62c-2.13 1.44-4.86 2.3-7.69 2.3-5.88 0-10.86-3.98-12.64-9.31H4.09v5.81C8.17 42.66 15.61 48 24 48z"></path>
        <path fill="#FBBC05" d="M11.36 28.69c-.49-1.48-.77-3.05-.77-4.69s.28-3.21.77-4.69v-5.81H4.09C2.82 16.57 2 19.98 2 24c0 4.02.82 7.43 2.09 10.52l7.27-5.83z"></path>
        <path fill="#EA4335" d="M24 9.8c3.52 0 6.62 1.22 9.07 3.55l6.4-6.4C35.91 2.95 30.48 0 24 0 15.61 0 8.17 5.34 4.09 13.5l7.27 5.81c1.78-5.33 6.76-9.31 12.64-9.31z"></path>
    </svg>
);

export default function SignUpPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '' });
  const [mounted, setMounted] = useState(false);

   useEffect(() => {
    setMounted(true);
  }, []);

   useEffect(() => {
    if (!mounted) return;
    // This is to apply animations after mount
    const floatingElement = document.querySelector('.floating');
    if (floatingElement) {
        (floatingElement as HTMLElement).style.animationDelay = '0s';
    }
  }, [mounted]);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleEmailSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setIsSubmitting(true);
      try {
          const user = await signUpWithEmail(formData);
          if (user) {
              toast({
                  title: 'Account created!',
                  description: `Welcome to Muwise, ${user.displayName}!`,
              });
              router.push('/dashboard');
          }
      } catch (error: any) {
          toast({
              variant: 'destructive',
              title: 'Uh oh! Something went wrong.',
              description: error.message,
          });
      } finally {
          setIsSubmitting(false);
      }
  };


  const handleGoogleSignUp = async () => {
    setIsSubmitting(true);
    try {
      const result = await signInWithGoogle();
      if (result.success && result.user) {
        toast({
          title: 'Account created!',
          description: `Welcome to Muwise, ${result.user.displayName}!`,
        });
        router.push('/dashboard');
      } else if (result.error && result.errorCode !== 'auth/popup-closed-by-user') {
          toast({
            variant: 'destructive',
            title: 'Google Sign-Up Failed',
            description: result.error,
          });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'There was a problem with your Google sign-up attempt.',
      });
      console.error(error);
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="text-center mb-8 fade-in floating" style={{ animationDelay: '0.5s' }}>
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mb-4 shadow-xl glow relative overflow-hidden">
          <Zap className="w-8 h-8 text-white relative z-10" />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 opacity-20"></div>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight mb-1">Crea tu cuenta en Muwise</h1>
        <p className="text-sm text-gray-300">Comienza tu prueba gratuita de 30 días hoy mismo.</p>
         <div className="flex items-center justify-center gap-2 mt-3">
            <div className="security-indicator">
                <ShieldCheck className="w-3 h-3 text-green-400" />
                <span>No se requiere tarjeta de crédito</span>
            </div>
        </div>
      </div>

      <div id="login-box" className="bg-gray-800/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/10 p-6 slide-up relative overflow-hidden" style={{ animationDelay: '0.2s' }}>
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 via-transparent to-purple-600/10 pointer-events-none"></div>
        <form onSubmit={handleEmailSignUp} className="space-y-4 relative z-10">
            <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input type="text" name="fullName" placeholder="Full Name" required onChange={handleInputChange} className="input-focus pl-10 h-11 bg-gray-700/50 border-white/10" />
            </div>
            <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input type="email" name="email" placeholder="Email" required onChange={handleInputChange} className="input-focus pl-10 h-11 bg-gray-700/50 border-white/10" />
            </div>
            <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input type="password" name="password" placeholder="Password" required onChange={handleInputChange} className="input-focus pl-10 h-11 bg-gray-700/50 border-white/10" />
            </div>
            <Button type="submit" className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-base" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin" /> : 'Crear Cuenta'}
            </Button>
        </form>

        <div className="my-4 flex items-center">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="mx-4 text-xs text-gray-400">OR</span>
            <div className="flex-grow border-t border-white/10"></div>
        </div>
        
        <div className="space-y-6 relative z-10 mt-4">
            <Button onClick={handleGoogleSignUp} type="button" variant="outline" className="ripple w-full flex items-center justify-center px-4 py-3 h-12 border border-white/10 rounded-xl hover:bg-gray-700 transition-all duration-200 hover:border-white/10 hover:-translate-y-0.5 hover:shadow-md group text-base">
                {isSubmitting ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : <GoogleIcon className="w-5 h-5 mr-2" />}
                Continuar con Google
            </Button>
        </div>
      </div>

      <div className="text-center mt-6 fade-in" style={{ animationDelay: '0.4s' }}>
        <p className="text-sm text-gray-300">
          ¿Ya tienes una cuenta?{' '}
          <Link href="/auth/signin" className="text-indigo-400 font-medium hover:text-indigo-300 transition-colors hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </>
  );
}
