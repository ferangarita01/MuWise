'use server';

import { ServiceContainer } from '@/services';
import { adminDb } from '@/lib/firebase-server';
import type { Signer } from '@/types/legacy';
import { revalidatePath } from 'next/cache';
import { useAuth } from '@/hooks/use-auth';
import { adminAuth } from '@/lib/firebase-server';
import { cookies } from 'next/headers';

interface ActionResult {
  status: 'success' | 'error';
  message: string;
  data?: {
    signerId: string;
  };
}

// La acción ahora necesita saber el correo del solicitante
export async function addSignerAction({
  agreementId,
  signerData,
  agreementTitle,
  requesterName,
  requesterEmail
}: {
  agreementId: string;
  signerData: Omit<Signer, 'id'>;
  agreementTitle: string;
  requesterName: string;
  requesterEmail: string; // <-- NUEVO
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
    
    const updatedSigners = [
        signers[0],
        newSigner,
        ...signers.slice(1)
    ];

    const signerEmails = updatedSigners.map(signer => signer.email);
    
    await agreementRef.update({ 
        signers: updatedSigners,
        signerEmails: signerEmails,
        lastModified: new Date().toISOString() 
    });

    const finalRequesterName = requesterName?.trim() ? requesterName : 'El equipo de Muwise';

    const emailService = ServiceContainer.getEmailService();
    await emailService.sendSignatureRequest({
        email: newSigner.email,
        agreementId,
        agreementTitle,
        requesterName: finalRequesterName,
        requesterEmail: requesterEmail // <-- Pasar el email del solicitante
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
    console.error('Failed to add signer:', error);
    // Devuelve un mensaje de error más específico si es posible
    const errorMessage = error.message.includes('Invalid `from` field') 
        ? 'Email service configuration error. Please contact support.'
        : `Failed to add signer: ${error.message}`;
    return {
      status: 'error',
      message: errorMessage,
    };
  }
}
