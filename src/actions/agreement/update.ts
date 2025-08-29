'use server';

import { ServiceContainer } from '@/services';
import { revalidatePath } from 'next/cache';

interface ActionResult {
  status: 'success' | 'error';
  message: string;
  data?: any;
}

// Modified to accept pdfBase64 and handle the upload on the server
export async function updateAgreementStatusAction(
  agreementId: string, 
  status: string, 
  pdfBase64?: string
): Promise<ActionResult> {
  if (!agreementId || !status) {
    return { status: 'error', message: 'Missing agreement ID or status.' };
  }

  try {
    const agreementService = ServiceContainer.getAgreementService();
    
    // Pass the agreementId, status, and the pdf base64 string to the service layer
    const result = await agreementService.updateStatus(agreementId, status, pdfBase64);

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
