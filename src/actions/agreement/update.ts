'use server';

import { ServiceContainer } from '@/services';
import { revalidatePath } from 'next/cache';

interface ActionResult {
  status: 'success' | 'error';
  message: string;
  data?: any;
}

export async function updateAgreementStatusAction(agreementId: string, status: string): Promise<ActionResult> {
  if (!agreementId || !status) {
    return { status: 'error', message: 'Missing agreement ID or status.' };
  }

  try {
    const agreementService = ServiceContainer.getAgreementService();
    const result = await agreementService.updateStatus(agreementId, status);

    revalidatePath(`/dashboard/agreements/${agreementId}`);
    revalidatePath('/dashboard/agreements');

    return {
      status: 'success',
      message: 'Agreement status updated successfully.',
      data: result,
    };
  } catch (error: any) {
    console.error('Failed to update agreement status:', error);
    return { status: 'error', message: `Failed to update status: ${error.message}` };
  }
}