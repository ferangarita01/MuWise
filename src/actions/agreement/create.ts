'use server';

import { adminDb } from '@/lib/firebase-server';
import type { Contract, Signer, User } from '@/types/legacy';
import { revalidatePath } from 'next/cache';

interface ActionResult {
  status: 'success' | 'error';
  message: string;
  data?: {
    agreementId: string;
  };
}

export async function createAgreementAction(
  template: Omit<Contract, 'id'>,
  userId: string
): Promise<ActionResult> {
  if (!userId) {
    return { status: 'error', message: 'User not authenticated.' };
  }

  try {
    const newAgreementRef = adminDb.collection('agreements').doc();

    // Fetch user data to use as the first signer
    const userDoc = await adminDb.collection('users').doc(userId).get();
    let userProfile: User | null = null;
    if (userDoc.exists) {
      userProfile = userDoc.data() as User;
    }

    // Create the first signer object from the user's profile
    const firstSigner: Signer = {
      id: userId,
      name: userProfile?.displayName || 'Usuario Principal',
      email: userProfile?.email || '',
      role: 'Cliente', // Default role for creator
      signed: false,
    };

    const newAgreementData = {
      ...template,
      userId,
      status: 'Borrador',
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      signers: [firstSigner], // Add the creator as the first signer
    };

    await newAgreementRef.set(newAgreementData);

    // Revalidate the agreements page to show the new draft
    revalidatePath('/dashboard/agreements');

    return {
      status: 'success',
      message: 'Agreement created successfully.',
      data: {
        agreementId: newAgreementRef.id,
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
