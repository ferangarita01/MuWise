'use server';

import { ServiceContainer } from '@/services';
import { adminDb } from '@/lib/firebase-server';
import type { Signer } from '@/types/legacy';
import { revalidatePath } from 'next/cache';
import jwt from 'jsonwebtoken';

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
    
    // PREMIUM FEATURE LOGIC: Determine if the link should be for a guest.
    // For now, we'll base this on the signer's role.
    // In a real app, you might check if the user creating the agreement has a premium subscription.
    const isGuestFlow = signerData.role === 'Invitado';

    // Check if a signer with this email already exists
    const existingSigner = signers.find((s: Signer) => s.email === signerData.email);
    if (existingSigner) {
      // If the user exists, just resend the email
      const emailService = ServiceContainer.getEmailService();
      await emailService.sendSignatureRequest({
        email: existingSigner.email,
        agreementId: agreementId,
        signerId: existingSigner.id,
        agreementTitle: agreementTitle,
        isGuest: isGuestFlow, // Pass the flag to the email service
      });

      return {
        status: 'warning',
        message: 'A signer with this email already exists. A new signature request has been sent.',
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

    const updatedSigners = [...signers, newSigner];
    const signerEmails = updatedSigners.map((signer) => signer.email);

    await agreementRef.update({
      signers: updatedSigners,
      signerEmails: signerEmails,
      lastModified: new Date().toISOString(),
    });

    const emailService = ServiceContainer.getEmailService();
    await emailService.sendSignatureRequest({
        email: newSigner.email,
        agreementId: agreementId,
        signerId: newSigner.id,
        agreementTitle: agreementTitle,
        isGuest: isGuestFlow, // Pass the flag to the email service
    });
    
    revalidatePath(`/dashboard/agreements/${agreementId}`);

    return {
      status: 'success',
      message: 'Signer added and notified successfully.',
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
