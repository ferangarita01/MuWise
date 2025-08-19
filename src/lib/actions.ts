
'use server';

import type { Agreement, AgreementStatus } from './types';
import { adminAuth } from './firebase-server';
import { revalidatePath } from 'next/cache';

// The Cloud Function URL should be configured in environment variables
const FUNCTION_REGION = process.env.FUNCTION_REGION || 'us-central1';
const GCP_PROJECT = process.env.GCP_PROJECT;
const FUNCTION_URL = `https://${FUNCTION_REGION}-${GCP_PROJECT}.cloudfunctions.net/muwiseApi`;


/**
 * Securely calls the backend Cloud Function.
 * It automatically includes an authentication token for the logged-in user.
 */
async function callApi(endpoint: string, body: object, method: 'GET' | 'POST' = 'POST') {
    try {
        const idToken = await adminAuth.createCustomToken('server-next-js'); // Create a token for server-to-server auth
        
        const response = await fetch(`${FUNCTION_URL}/${endpoint}`, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`,
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'API call failed');
        }

        return await response.json();
    } catch (error) {
        console.error(`API call to endpoint '${endpoint}' failed:`, error);
        // Ensure we throw a standard error object
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('An unexpected error occurred during API call.');
    }
}


// These Server Actions are now simple wrappers around the Cloud Function calls.

export async function getAgreement(agreementId: string): Promise<Agreement | null> {
    const response = await callApi('getAgreement', { agreementId });
    return response.data;
}

export async function generateSigningLink(agreementId: string, signerId: string): Promise<string> {
    const response = await callApi('generateSigningLink', { agreementId, signerId });
    return response.data.link;
}

export async function validateSigningToken(token: string): Promise<{valid: boolean; message: string; agreementId?: string; signerId?: string}> {
    const response = await callApi('validateSigningToken', { token });
    return response.data;
}

export async function updateAgreement(agreementId: string, data: Partial<Omit<Agreement, 'id'>>) {
    await callApi('updateAgreement', { agreementId, data });
    revalidatePath(`/dashboard/agreements/templates/${agreementId}`);
}

export async function completeGuestSignature(params: {
    agreementId: string;
    signerId: string;
    signatureDataUrl: string;
    token: string;
}) {
    await callApi('completeGuestSignature', params);
    revalidatePath(`/sign/${params.token}`);
}

export async function updateComposerSignature(formData: FormData) {
     const params = {
        agreementId: formData.get('agreementId') as string,
        composerId: formData.get('composerId') as string,
        signatureDataUrl: formData.get('signatureDataUrl') as string,
    };
    await callApi('updateComposerSignature', params);
    revalidatePath(`/dashboard/agreements/templates/${params.agreementId}`);
}

export async function updateAgreementStatus(agreementId: string, status: AgreementStatus) {
    await callApi('updateAgreementStatus', { agreementId, status });
    revalidatePath('/dashboard/agreements');
}

export async function generatePdfAction(agreementId: string): Promise<{data: string} | {error: string}> {
    try {
      const response = await callApi('generatePdf', { agreementId });
      return { data: response.data };
    } catch (e) {
        const error = e as Error;
        return { error: error.message };
    }
}

export async function uploadProfilePhotoAction(formData: FormData): Promise<{ status: 'success' | 'error'; message: string; data?: any; }> {
    // Note: File uploads are tricky to pass to Cloud Functions directly via JSON.
    // This part of the logic might need a dedicated function that uploads directly to Storage
    // from the client and then notifies the server.
    // For now, we keep the placeholder.
    console.warn("uploadProfilePhotoAction needs a dedicated client-to-storage implementation.");
    return {
        status: 'success',
        message: 'Photo uploaded successfully (placeholder).',
        data: { downloadURL: "https://placehold.co/100x100.png" }
    };
}
