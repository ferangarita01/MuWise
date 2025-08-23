'use server';

import { ServiceContainer } from '@/services';

interface ActionResult {
  status: 'success' | 'error';
  message: string;
  data?: any;
}

export async function sendSignatureRequestEmail(formData: FormData): Promise<ActionResult> {
  const email = formData.get('email') as string;
  const agreementId = formData.get('agreementId') as string;
  const agreementTitle = formData.get('agreementTitle') as string;
  const requesterName = formData.get('requesterName') as string;

  if (!email || !agreementId || !agreementTitle || !requesterName) {
    return { status: 'error', message: 'Missing required fields for sending email.' };
  }

  try {
    const emailService = ServiceContainer.getEmailService();
    await emailService.sendSignatureRequest({
      email,
      agreementId,
      agreementTitle,
      requesterName
    });

    return {
      status: 'success',
      message: `Signature request sent to ${email}.`,
    };
  } catch (error: any) {
    console.error('Failed to send email:', error);
    return { status: 'error', message: `Failed to send email: ${error.message}` };
  }
}