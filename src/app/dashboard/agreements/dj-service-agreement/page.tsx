// src/app/dashboard/agreements/dj-service-agreement/page.tsx
'use client';
import { useState } from 'react';
import AgreementPageClient from '@/app/dashboard/agreements/[agreementId]/AgreementPageClient';
import type { Contract } from '@/types/legacy';
import { initialContractData } from '@/lib/initialData';

// This is a temporary mock function to find the specific contract
// In a real app, this would likely come from a database or API call
const getDJAgreementData = (): Contract | null => {
  const djContract = initialContractData.find(c => c.id === 'contrato-de-artista-en-vivo');
  if (djContract) {
    // We add some mock signers for demonstration purposes, similar to the original logic
    djContract.signers = [
      { id: 'client', name: 'Ana Torres', role: 'Cliente', email: 'ana@example.com', signed: false },
      { id: 'provider', name: 'DJ Nova', role: 'Proveedor', email: 'dj.nova@example.com', signed: false }
    ];
  }
  return djContract || null;
};


export default function DJServiceAgreementPage() {
  const [agreement] = useState<Contract | null>(getDJAgreementData());

  if (!agreement) {
    return <div>Error: Contrato de DJ no encontrado.</div>;
  }

  // Reuse the robust client component we already have for displaying agreements
  return <AgreementPageClient agreement={agreement} />;
}
