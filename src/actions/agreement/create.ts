'use server';

import { adminDb } from '@/lib/firebase-server';
import type { Contract, Signer } from '@/types/legacy';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

interface ActionResult {
  status: 'success' | 'error';
  message: string;
  data?: {
    agreementId: string;
  };
}

export async function createAgreementAction(
  agreementData: Omit<Contract, 'id' | 'createdAt'>,
  creatorId: string
): Promise<ActionResult> {
  
  if (!creatorId) {
    return { status: 'error', message: 'User must be authenticated to create an agreement.' };
  }

  try {
    // We need to fetch creator's data to act as the first signer
    const userDoc = await adminDb.collection('users').doc(creatorId).get();
    if (!userDoc.exists) {
        return { status: 'error', message: 'Creator profile not found.' };
    }
    const creatorData = userDoc.data();

    const creatorSigner: Signer = {
      id: `signer-${Date.now()}-creator`,
      name: creatorData?.displayName || 'Creator',
      email: creatorData?.email || '',
      role: 'Creator',
      signed: false, // El creador no ha firmado por defecto
    };

    const initialSigners = [creatorSigner];

    // **NUEVO: Crear el array de emails para la consulta**
    const signerEmails = initialSigners.map(s => s.email).filter(Boolean);

    const newAgreement: Omit<Contract, 'id'> = {
      ...agreementData,
      userId: creatorId,
      signers: initialSigners,
      signerEmails: signerEmails, // <-- AÑADIR ESTE CAMPO
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      status: 'Borrador', // Forzar estado inicial a Borrador
    };

    const docRef = await adminDb.collection('agreements').add(newAgreement);
    
    // Opcional: Revalidar la página de acuerdos para mostrar el nuevo borrador
    revalidatePath('/dashboard/agreements');

    return {
      status: 'success',
      message: 'Agreement created successfully as a draft.',
      data: {
        agreementId: docRef.id,
      },
    };
  } catch (error: any) {
    console.error('Failed to create agreement:', error);
    return {
      status: 'error',
      message: `Failed to create agreement: ${error.message}`,
    };
  }
}
