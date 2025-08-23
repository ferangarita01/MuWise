'use server';

import { ServiceContainer } from '@/services';
import { revalidatePath } from 'next/cache';

interface ActionResult {
  status: 'success' | 'error';
  message: string;
  data?: any;
}

export async function updateSignerSignatureAction({ 
  agreementId, 
  signerId, 
  signatureDataUrl 
}: { 
  agreementId: string; 
  signerId: string; 
  signatureDataUrl: string; 
}): Promise<ActionResult> {
  if (!agreementId || !signerId || !signatureDataUrl) {
    return { status: 'error', message: 'Missing required fields for updating signature.' };
  }

  try {
    const agreementService = ServiceContainer.getAgreementService();
    const result = await agreementService.updateSignerSignature({
      agreementId,
      signerId,
      signatureDataUrl
    });
    
    revalidatePath(`/dashboard/agreements/${agreementId}`);
    revalidatePath('/dashboard/agreements');

    return {
      status: 'success',
      message: 'Signature updated successfully.',
      data: result
    };
  } catch (error: any) {
    console.error('Failed to update signature:', error);
    return { status: 'error', message: `Failed to update signature: ${error.message}` };
  }
}