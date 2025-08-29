import { adminDb } from '@/lib/firebase-server';
import { Timestamp } from 'firebase-admin/firestore';
import { notFound } from 'next/navigation';
import AgreementPageClient from '@/app/dashboard/agreements/[agreementId]/AgreementPageClient';
import type { Contract } from '@/types/legacy';
import AgreementPdfView from '@/components/agreement/agreement-pdf-view'; // <-- IMPORTAR NUEVO COMPONENTE

// Helper function to recursively serialize Timestamps
const serializeTimestamps = (data: any): any => {
  if (data === null || typeof data !== 'object') {
    return data;
  }

  if (data instanceof Timestamp) {
    return data.toDate().toISOString();
  }

  if (Array.isArray(data)) {
    return data.map(item => serializeTimestamps(item));
  }

  const serializedData: any = {};
  for (const key in data) {
    serializedData[key] = serializeTimestamps(data[key]);
  }
  return serializedData;
};

export default async function AgreementPage({ params }: { params: { agreementId: string } }) {
  const awaitedParams = await params;
  const { agreementId: rawAgreementId } = awaitedParams;
  const agreementId = rawAgreementId.trim();

  try {
    const agreementRef = adminDb.collection('agreements').doc(agreementId);
    const agreementDoc = await agreementRef.get();

    if (!agreementDoc.exists) {
      notFound();
    }

    const rawAgreementData = agreementDoc.data() as Contract | undefined;
    const serializedAgreement = serializeTimestamps({
      ...rawAgreementData,
      id: agreementDoc.id,
    }) as Contract;

    if (!serializedAgreement) {
      notFound();
    }

    // --- LÓGICA CONDICIONAL ---
    // Si el acuerdo está completado y tiene una URL de PDF, muestra el visor.
    // De lo contrario, muestra la página de trabajo normal.
    if (serializedAgreement.status === 'Completado' && serializedAgreement.pdfUrl) {
      return <AgreementPdfView agreement={serializedAgreement} />;
    } else {
      return <AgreementPageClient agreement={serializedAgreement} />;
    }
  } catch (error) {
    console.error('Failed to load agreement:', error);
    throw new Error(`Failed to load agreement ${agreementId}: ${(error as Error).message}`);
  }
}
