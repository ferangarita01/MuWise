
'use client';

import { useState } from 'react';
import type { Agreement } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';

type GuestSigningFlowProps = {
  agreement: Agreement;
};

type SigningStep = 'verifyIdentity' | 'review' | 'sign' | 'complete';

export function GuestSigningFlow({ agreement }: GuestSigningFlowProps) {
  const [step, setStep] = useState<SigningStep>('verifyIdentity');

  // In a real flow, you would also need to identify WHICH composer is signing.
  // This would typically be part of the data fetched with the token.
  // For now, we'll assume the first composer is the guest.
  const signingComposer = agreement.composers[0];

  return (
    <div className="max-w-4xl mx-auto">
       <Card>
            <CardHeader>
                <CardTitle className="text-2xl">Sign Agreement</CardTitle>
                <CardDescription>
                    You have been invited to sign the agreement for the song:
                    <span className="font-bold"> "{agreement.songTitle}"</span>
                </CardDescription>
            </CardHeader>
            <CardContent>
                {/* Steps will be rendered here based on the `step` state */}
                <p>Current Step: {step}</p>
                <p>Signing as: {signingComposer.name}</p>
            </CardContent>
       </Card>
    </div>
  );
}
