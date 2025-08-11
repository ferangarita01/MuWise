
'use client';

import { AgreementForm } from '@/components/agreement-form';
import { mockAgreements } from '@/lib/data';
import type { Agreement } from '@/lib/types';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function EditAgreementPage() {
  const params = useParams();
  const agreementId = params.id as string;
  const [agreement, setAgreement] = useState<Agreement | null>(null);

  useEffect(() => {
    const foundAgreement = mockAgreements.find((a) => a.id === agreementId);
    if (foundAgreement) {
      setAgreement(foundAgreement);
    }
  }, [agreementId]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Agreement</h1>
        <p className="text-muted-foreground">
          Modify the details of your songwriter split agreement.
        </p>
      </div>
      {agreement ? (
        <AgreementForm existingAgreement={agreement} />
      ) : (
        <p>Loading agreement...</p>
      )}
    </div>
  );
}
