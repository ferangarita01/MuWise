
'use client';
import { useState } from 'react';
import { AgreementForm } from '@/components/agreement-form';
import { mockAgreements } from '@/lib/data';
import type { Agreement } from '@/lib/types';

export default function NewAgreementPage() {
  const [agreements, setAgreements] = useState<Agreement[]>(mockAgreements);

  const handleSaveAgreement = (newAgreement: Agreement) => {
    // In a real app, this would be an API call.
    // Here we just update the local state.
    setAgreements(prev => [...prev, newAgreement]);
  };

  return (
    <div className="flex flex-col gap-8">
       <div>
          <h1 className="text-3xl font-bold tracking-tight">New Agreement</h1>
          <p className="text-muted-foreground">
            Define the terms of a new songwriter split.
          </p>
        </div>
      <AgreementForm onSave={handleSaveAgreement} />
    </div>
  );
}

    