'use server';

import { ServiceContainer } from '@/services';
import { adminDb } from '@/lib/firebase-server';
import type { Signer } from '@/types/legacy';
import { revalidatePath } from 'next/cache';

interface ActionResult {
  status: 'success' | 'error';
  message: string;
  data?: {
    signerId: string;
  };
}

export async function addSignerAction({
  agreementId,
  signerData,
  agreementTitle,
  requesterName
}: {
  agreementId: string;
  signerData: Omit<Signer, 'id'>;
  agreementTitle: string;
  requesterName: string;
}): Promise<ActionResult> {
  if (!agreementId || !signerData.email) {
    return { status: 'error', message: 'Agreement ID and signer email are required.' };
  }

  try {
    const agreementRef = adminDb.collection('agreements').doc(agreementId);
    const doc = await agreementRef.get();

    if (!doc.exists) {
      return { status: 'error', message: 'Agreement not found.' };
    }

    const agreement = doc.data()!;
    const signers = agreement.signers || [];
    
    // Check if email already exists
    if (signers.some((s: Signer) => s.email === signerData.email)) {
        return { status: 'error', message: 'A signer with this email already exists for this agreement.' };
    }

    const newSigner: Signer = {
      ...signerData,
      id: `signer-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      signed: false,
    };
    
    // Insert the new signer at the second position (index 1), right after the creator
    const updatedSigners = [
        signers[0],
        newSigner,
        ...signers.slice(1)
    ];
    
    // Persist the change to Firestore
    await agreementRef.update({ 
        signers: updatedSigners,
        lastModified: new Date().toISOString() 
    });

    // Send the email notification
    const emailService = ServiceContainer.getEmailService();
    await emailService.sendSignatureRequest({
        email: newSigner.email,
        agreementId,
        agreementTitle,
        requesterName
    });

    // Revalidate the path to update the client UI
    revalidatePath(`/dashboard/agreements/${agreementId}`);
    
    return {
      status: 'success',
      message: 'Signer added and notified successfully.',
      data: {
        signerId: newSigner.id,
      },
    };
  } catch (error: any) {
    console.error('Failed to add signer:', error);
    return {
      status: 'error',
      message: `Failed to add signer: ${error.message}`,
    };
  }
}
