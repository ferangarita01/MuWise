
'use client';

import { useParams } from 'next/navigation';
import { getAgreement } from '@/lib/actions';
import { GuestSigningFlow } from '@/components/guest-signing-flow';
import { useEffect, useState } from 'react';
import type { Agreement } from '@/lib/types';
import { Music, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { validateSigningToken } from '@/lib/actions';

export default function GuestSigningPage() {
  const params = useParams();
  const token = params.token as string;
  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!token) {
      setError('No signing token provided.');
      setIsLoading(false);
      return;
    }

    const verifyAndLoad = async () => {
      try {
        const validationResult = await validateSigningToken(token);
        if (!validationResult.valid) {
          setError(validationResult.message);
          setIsLoading(false);
          return;
        }

        const foundAgreement = await getAgreement(validationResult.agreementId!);
        if (foundAgreement) {
          setAgreement(foundAgreement);
        } else {
          setError('Could not find the specified agreement.');
        }
      } catch (err) {
        setError('An unexpected error occurred while loading the agreement.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    verifyAndLoad();

  }, [token]);

  return (
    <div className="min-h-screen bg-muted/40 p-4 md:p-8">
        <header className="max-w-6xl mx-auto mb-8">
             <Link href="/" className="flex items-center gap-2 text-foreground">
                <Music className="h-8 w-8 text-primary" />
                <span className="text-2xl font-semibold ">
                Muwise
                </span>
            </Link>
        </header>
        <main>
            {isLoading && <p className="text-center text-lg animate-pulse">Loading agreement, please wait...</p>}
            
            {error && (
                <div className="max-w-md mx-auto text-center bg-card p-8 rounded-lg shadow-lg">
                    <ShieldAlert className="h-16 w-16 text-destructive mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Link Invalid or Expired</h2>
                    <p className="text-muted-foreground">{error}</p>
                    <Button asChild variant="link" className="mt-4">
                        <Link href="/">Go to Homepage</Link>
                    </Button>
                </div>
            )}

            {!isLoading && !error && agreement && (
                <GuestSigningFlow agreement={agreement} token={token} />
            )}
        </main>
    </div>
  );
}
