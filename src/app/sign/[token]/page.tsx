
'use client';

import { useParams, useRouter } from 'next/navigation';
import { getAgreement, validateSigningToken } from '@/lib/actions';
import { GuestSigningFlow } from '@/components/guest-signing-flow';
import { useEffect, useState } from 'react';
import type { Agreement } from '@/lib/types';
import { Music, ShieldAlert, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';


export default function GuestSigningPage() {
  const params = useParams();
  const token = params.token as string;
  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [signerId, setSignerId] = useState<string | null>(null);
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
          setSignerId(validationResult.signerId!);
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
            {isLoading && (
              <div className="text-center p-20">
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary"/>
                <p className="text-center text-lg mt-4">Verificando enlace y cargando acuerdo...</p>
              </div>
            )}
            
            {error && (
                <div className="max-w-md mx-auto text-center bg-card p-8 rounded-lg shadow-lg border">
                    <ShieldAlert className="h-16 w-16 text-destructive mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Enlace no válido o expirado</h2>
                    <p className="text-muted-foreground">{error}</p>
                    <Button asChild variant="link" className="mt-4">
                        <Link href="/">Volver a la página principal</Link>
                    </Button>
                </div>
            )}

            {!isLoading && !error && agreement && signerId && (
                <GuestSigningFlow agreement={agreement} token={token} signerId={signerId} />
            )}
        </main>
    </div>
  );
}

    