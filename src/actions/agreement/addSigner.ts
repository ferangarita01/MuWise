'use server';

import { ServiceContainer } from '@/services';
import { adminDb } from '@/lib/firebase-server';
import type { Signer } from '@/types/legacy';
import { revalidatePath } from 'next/cache';

interface ActionResult {
  status: 'success' | 'error' | 'warning';
  message: string;
  data?: {
    signerId: string;
  };
}

export async function addSignerAction({
  agreementId,
  signerData,
  agreementTitle,
}: {
  agreementId: string;
  signerData: Omit<Signer, 'id'>;
  agreementTitle: string;
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

    // Check if a signer with this email already exists
    const existingSigner = signers.find((s: Signer) => s.email === signerData.email);
    if (existingSigner) {
      return {
        status: 'success', // Treat as success to get the ID for email sending
        message: 'A signer with this email already exists.',
        data: {
          signerId: existingSigner.id,
        },
      };
    }

    const newSigner: Signer = {
      ...signerData,
      id: `signer-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      signed: false,
    };

    const updatedSigners = [signers[0], newSigner, ...signers.slice(1)];
    const signerEmails = updatedSigners.map((signer) => signer.email);

    await agreementRef.update({
      signers: updatedSigners,
      signerEmails: signerEmails,
      lastModified: new Date().toISOString(),
    });
    
    revalidatePath(`/dashboard/agreements/${agreementId}`);

    return {
      status: 'success',
      message: 'Signer added successfully.',
      data: {
        signerId: newSigner.id,
      },
    };
  } catch (error: any) {
    console.error('❌ Failed to add signer:', error);
    const errorMessage = `Failed to add signer: ${error.message}`;
    return {
      status: 'error',
      message: errorMessage,
    };
  }
}