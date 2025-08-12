
'use client';

import { useParams } from 'next/navigation';
import { getAgreement } from '@/lib/actions';
import { GuestSigningFlow } from '@/components/guest-signing-flow';
import { useEffect, useState } from 'react';
import type { Agreement } from '@/lib/types';
import { Music } from 'lucide-react';
import Link from 'next/link';

export default function GuestSigningPage() {
  const params = useParams();
  const token = params.token as string;
  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (token) {
        getAgreement(token)
            .then(foundAgreement => {
                if (foundAgreement) {
                    setAgreement(foundAgreement);
                } else {
                    setError('Invalid or expired signing link.');
                }
            })
            .catch(() => setError('Failed to load agreement.'))
            .finally(() => setIsLoading(false));
    } else {
        setIsLoading(false);
        setError('No signing token provided.');
    }
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
            {isLoading && <p className="text-center">Loading agreement...</p>}
            {error && <p className="text-center text-destructive">{error}</p>}
            {!isLoading && !error && agreement && (
                <GuestSigningFlow agreement={agreement} />
            )}
        </main>
    </div>
  );
}
