
'use server';

import { adminDb } from './firebase-server';
import { PDFDocument, rgb } from 'pdf-lib';
import type { Agreement, Composer, User, AgreementStatus } from './types';
import { randomUUID } from "crypto";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";


// Define a consistent type for the action's state
export type ActionState = {
  status: 'idle' | 'success' | 'error';
  message: string;
  data?: any;
};

/**
 * Genera un link único para que un firmante acceda al acuerdo
 */
export async function generateSigningLink(agreementId: string, signerId: string) {
  const token = randomUUID();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h

  await adminDb.collection("signingTokens").doc(token).set({
    agreementId,
    signerId,
    token,
    expiresAt,
    used: false,
    createdAt: new Date(),
  });

  const url = `${APP_URL}/sign/${token}`;
  return url;
}

export async function validateSigningToken(token: string): Promise<{valid: boolean; message: string; agreementId?: string; signerId?: string}> {
    const tokenDoc = await adminDb.collection("signingTokens").doc(token).get();

    if (!tokenDoc.exists) {
        return { valid: false, message: "This signing link does not exist." };
    }

    const data = tokenDoc.data()!;
    const now = new Date();

    if (data.used) {
        return { valid: false, message: "This signing link has already been used." };
    }

    if (data.expiresAt && data.expiresAt.toDate() < now) {
        return { valid: false, message: "This signing link has expired. Please request a new one." };
    }

    return { 
        valid: true, 
        message: "Token is valid.",
        agreementId: data.agreementId,
        signerId: data.signerId
    };
}


export async function getAgreement(agreementId: string): Promise<Agreement | null> {
    try {
        const docRef = adminDb.collection('agreements').doc(agreementId);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            console.warn(`Agreement with id ${agreementId} not found.`);
            return null;
        }

        const data = docSnap.data()!;
        // Helper function to safely convert timestamp to ISO string
        const toISO = (timestamp: any) => timestamp?._seconds ? new Date(timestamp._seconds * 1000).toISOString() : new Date().toISOString();

        const composers = (data.composers || []).map((composer: any) => ({
            ...composer,
            signedAt: composer.signedAt?._seconds ? new Date(composer.signedAt._seconds * 1000).toISOString() : undefined,
        }));
        
        return {
            id: docSnap.id,
            ...data,
            composers,
            createdAt: toISO(data.createdAt),
            publicationDate: toISO(data.publicationDate),
            lastModified: data.lastModified ? toISO(data.lastModified) : toISO(data.createdAt),
        } as Agreement;

    } catch (error) {
        console.error("Error fetching agreement:", error);
        throw new Error("Failed to fetch agreement details.");
    }
}


export async function updateAgreement(agreementId: string, data: Partial<Omit<Agreement, 'id'>>) {
    try {
        const docRef = adminDb.collection('agreements').doc(agreementId);
        const updateData = {
            ...data,
            lastModified: new Date().toISOString(),
        };
        await docRef.update(updateData);
        console.log(`Agreement ${agreementId} updated successfully.`);
    } catch (error) {
        console.error("Error updating agreement:", error);
        throw new Error("Failed to update agreement.");
    }
}


export async function completeGuestSignature({
    agreementId, 
    signerId, 
    signatureDataUrl,
    token
}: {
    agreementId: string;
    signerId: string;
    signatureDataUrl: string;
    token: string;
}) {
    // Start a transaction to ensure atomicity
    await adminDb.runTransaction(async (transaction) => {
        const tokenRef = adminDb.collection('signingTokens').doc(token);
        const agreementRef = adminDb.collection('agreements').doc(agreementId);

        const tokenDoc = await transaction.get(tokenRef);
        if (!tokenDoc.exists) {
            throw new Error('Invalid or non-existent signing token.');
        }
        if (tokenDoc.data()?.used) {
            throw new Error('This signing link has already been used.');
        }

        const agreementDoc = await transaction.get(agreementRef);
        if (!agreementDoc.exists) {
            throw new Error('Agreement not found');
        }

        const agreementData = agreementDoc.data();
        if (!agreementData) {
             throw new Error('Agreement data is empty');
        }
        const agreement = agreementData as Agreement;
        const composerIndex = agreement.composers.findIndex(c => c.id === signerId);
        
        if (composerIndex === -1) {
            throw new Error('Signer not found in this agreement');
        }

        const updatedComposers = [...agreement.composers];
        updatedComposers[composerIndex] = {
            ...updatedComposers[composerIndex],
            signature: signatureDataUrl,
            signedAt: new Date().toISOString(),
        };

        const allSigned = updatedComposers.every(c => c.signature);

        // Update agreement and token within the transaction
        transaction.update(agreementRef, {
            composers: updatedComposers,
            status: allSigned ? 'Signed' : 'Partial',
            lastModified: new Date().toISOString(),
        });

        transaction.update(tokenRef, {
            used: true,
            usedAt: new Date().toISOString(),
        });
    });
}


export async function updateComposerSignature(formData: FormData) {
    console.log('🚀 Starting updateComposerSignature');
    console.log('📋 FormData entries:', Array.from(formData.entries()));

    const agreementId = formData.get('agreementId') as string;
    const composerId = formData.get('composerId') as string;
    const signatureDataUrl = formData.get('signatureDataUrl') as string;

    if (!agreementId || !composerId || !signatureDataUrl) {
      console.error('❌ Missing required form data');
      throw new Error("Missing required data to update signature.");
    }
    
    try {
        console.log(`🔥 Updating signature for composer ${composerId} on agreement ${agreementId}`);
        const docRef = adminDb.collection('agreements').doc(agreementId);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            throw new Error('Agreement not found');
        }

        const agreementData = docSnap.data();
         if (!agreementData) {
             throw new Error('Agreement data is empty');
        }
        const agreement = agreementData as Agreement;
        
        if (!agreement.composers || !Array.isArray(agreement.composers)) {
          throw new Error('Composers array is missing or invalid in the agreement.');
        }
      
        const composerIndex = agreement.composers.findIndex(c => c.id === composerId);

        if (composerIndex === -1) {
            throw new Error('Composer not found in this agreement');
        }
        
        const updatedComposers = [...agreement.composers];
        updatedComposers[composerIndex] = {
            ...updatedComposers[composerIndex],
            signature: signatureDataUrl,
            signedAt: new Date().toISOString(),
        };

        const allSigned = updatedComposers.every(c => c.signature);

        await docRef.update({
            composers: updatedComposers,
            status: allSigned ? 'Signed' : 'Partial',
            lastModified: new Date().toISOString(),
        });
        console.log(`✅ Signature for composer ${composerId} updated successfully.`);
        
    } catch (error) {
        console.error('❌ Error in updateComposerSignature:', error);
        console.error('🔍 Error stack:', (error as Error).stack);
        throw new Error("Failed to save signature.");
    }
}


export async function updateAgreementStatus(agreementId: string, status: AgreementStatus) {
    try {
        const docRef = adminDb.collection('agreements').doc(agreementId);
        await docRef.update({ status: status, lastModified: new Date().toISOString() });
    } catch (error) {
        console.error(`Error updating status for agreement ${agreementId}:`, error);
        throw new Error("Failed to update agreement status.");
    }
}

// PDF Generation Action
export async function generatePdfAction(agreementId: string): Promise<{data: string} | {error: string}> {
  try {
    const agreement = await getAgreement(agreementId);
    if (!agreement) {
        return { error: 'Agreement not found.'};
    }
    
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont('Helvetica');
    const fontSize = 12;
    
    let y = height - 50;

    const drawText = (text: string, x: number, yPos: number, size = fontSize) => {
        page.drawText(text, { x, y: yPos, size, font, color: rgb(0, 0, 0) });
        return yPos - (size * 1.5);
    };

    y = drawText(`Agreement: ${agreement.songTitle}`, 50, y, 18);
    y -= 20;

    y = drawText(`Status: ${agreement.status}`, 50, y);
    y = drawText(`Date: ${new Date(agreement.createdAt).toLocaleDateString()}`, 50, y);
    y -= 10;
    
    agreement.composers.forEach(c => {
        y = drawText(`Composer: ${c.name} (${c.share}%)`, 50, y);
        y = drawText(`Email: ${c.email}`, 70, y, 10);
        if (c.signedAt) {
           y = drawText(`Signed: ${new Date(c.signedAt).toLocaleString()}`, 70, y, 10);
        } else {
             y = drawText('Signed: Not yet signed', 70, y, 10);
        }
        y -= 5;
    });

    const pdfBytes = await pdfDoc.save();
    const base64 = Buffer.from(pdfBytes).toString('base64');
    
    return { data: base64 };
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "An unknown error occurred during PDF generation."
    return { error: message };
  }
}

export async function uploadProfilePhotoAction(formData: FormData): Promise<ActionState> {
     try {
        // ... Logic to upload file to Cloud Storage and get URL ...
        // This is a placeholder for the actual implementation
        const downloadURL = "https://placehold.co/100x100.png";
        
        return {
            status: 'success',
            message: 'Photo uploaded successfully.',
            data: { downloadURL }
        };
    } catch (error) {
        return { status: 'error', message: 'File upload failed.' };
    }
}
