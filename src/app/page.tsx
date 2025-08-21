
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait until loading is false to ensure user state is definitive
    if (!loading) {
      if (user) {
        // If user is logged in, redirect to the dashboard
        router.replace('/dashboard');
      } else {
        // If no user is logged in, redirect to the sign-in page
        router.replace('/auth/signin');
      }
    }
  }, [user, loading, router]);

  // Display a loading indicator while checking auth state and redirecting
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  );
}
