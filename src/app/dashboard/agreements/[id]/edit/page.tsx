
'use client';

import { AgreementForm } from '@/components/agreement-form';
import { getAgreement, updateAgreement } from '@/lib/actions';
import type { Agreement } from '@/lib/types';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function EditAgreementPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const agreementId = params.id as string;
  const [agreement, setAgreement] = useState<Agreement | null>(null);

  useEffect(() => {
    if (agreementId) {
      getAgreement(agreementId).then(setAgreement);
    }
  }, [agreementId]);

  const handleSave = async (updatedAgreementData: Agreement) => {
    try {
        await updateAgreement(agreementId, updatedAgreementData);
        toast({
            title: 'Agreement Updated',
            description: 'Your changes have been saved.',
        });
        router.push('/dashboard');
    } catch (error) {
         toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to update agreement.',
        });
        console.error(error);
    }
  };


  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Agreement</h1>
        <p className="text-muted-foreground">
          Modify the details of your songwriter split agreement.
        </p>
      </div>
      {agreement ? (
        <AgreementForm existingAgreement={agreement} onSave={handleSave} />
      ) : (
        <p>Loading agreement...</p>
      )}
    </div>
  );
}
