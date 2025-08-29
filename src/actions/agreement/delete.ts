
'use server';

import { adminDb } from '@/lib/firebase-server';
import { revalidatePath } from 'next/cache';

interface ActionResult {
  status: 'success' | 'error';
  message: string;
}

export async function deleteAgreementAction(agreementId: string): Promise<ActionResult> {
  if (!agreementId) {
    return { status: 'error', message: 'Agreement ID is required.' };
  }

  try {
    const agreementRef = adminDb.collection('agreements').doc(agreementId);
    const doc = await agreementRef.get();

    if (!doc.exists) {
      return { status: 'error', message: 'Agreement not found.' };
    }

    const data = doc.data();
    // Security check: Only allow deletion if the status is 'Borrador'
    if (data?.status !== 'Borrador') {
      return { status: 'error', message: 'Only draft agreements can be deleted.' };
    }

    // Perform the deletion
    await agreementRef.delete();

    // Revalidate the agreements page to update the UI
    revalidatePath('/dashboard/agreements');

    return {
      status: 'success',
      message: 'Draft agreement deleted successfully.',
    };
  } catch (error: any) {
    console.error('Failed to delete agreement:', error);
    return {
      status: 'error',
      message: `Failed to delete agreement: ${error.message}`,
    };
  }
}
