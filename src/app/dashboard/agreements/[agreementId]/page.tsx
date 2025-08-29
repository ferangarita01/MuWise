import { adminDb } from '@/lib/firebase-server'; // Asegúrate de usar la instancia de servidor
import { Timestamp } from 'firebase-admin/firestore'; // Import Timestamp
import { Agreement, Composer } from '@/types/agreement'; // Import Composer as well
import { notFound } from 'next/navigation';
import AgreementPageClient from '@/app/dashboard/agreements/[agreementId]/AgreementPageClient';
import type { Contract } from '@/types/legacy';


export default async function AgreementPage({ params }: { params: { agreementId: string } }) {

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
  const awaitedParams = await params; // Await params
  const { agreementId: rawAgreementId } = awaitedParams; // Access agreementId from the awaited object
  const agreementId = rawAgreementId.trim(); // Trim whitespace from the ID

  try {
    const agreementRef = adminDb.collection('agreements').doc(agreementId);
    const agreementDoc = await agreementRef.get();

    let serializedAgreement: Contract | null = null;

    if (agreementDoc.exists) {
      // Get the raw data and recursively serialize Timestamps
      const rawAgreementData = agreementDoc.data() as Agreement | undefined;
      const serializedDataWithoutId = serializeTimestamps(rawAgreementData);

      serializedAgreement = {
        ...serializedDataWithoutId,
        id: agreementId, // Add the document ID
      };
    } else {
      notFound(); // Trigger Next.js notFound if agreement does not exist
    }
    
    if (!serializedAgreement) {
      notFound();
    }

    return (
      // Pass the serialized agreement object to the Client Component
      <AgreementPageClient agreement={serializedAgreement} />
    );
  } catch (error) {
    console.error('Failed to load agreement:', error);
    // In a build process, throwing an error might be better to fail fast.
    // In a runtime scenario, you might render an error page.
    throw new Error(`Failed to load agreement ${agreementId}: ${(error as Error).message}`);
  }
}
