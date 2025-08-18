
'use server';

import { adminDb } from './firebase-server';
import { PDFDocument, rgb } from 'pdf-lib';
import type { Agreement, Composer, User, AgreementStatus } from './types';


// Define a consistent type for the action's state
export type ActionState = {
  status: 'idle' | 'success' | 'error';
  message: string;
  data?: any;
};

export async function getAgreement(agreementId: string): Promise<Agreement | null> {
    try {
        const docRef = adminDb.collection('agreements').doc(agreementId);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            console.warn(`Agreement with id ${agreementId} not found.`);
            return null;
        }

        const data = docSnap.data()!;
         const createdAt = data.createdAt?._seconds ? new Date(data.createdAt._seconds * 1000).toISOString() : new Date().toISOString();
        const publicationDate = data.publicationDate; // Keep as string

        const composers = (data.composers || []).map((composer: any) => ({
            ...composer,
            signedAt: composer.signedAt?._seconds ? new Date(composer.signedAt._seconds * 1000).toISOString() : undefined,
        }));
        
        return {
            id: docSnap.id,
            ...data,
            composers,
            createdAt,
            publicationDate,
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


export async function updateComposerSignature(agreementId: string, composerId: string, signatureDataUrl: string) {
    try {
        const docRef = adminDb.collection('agreements').doc(agreementId);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            throw new Error('Agreement not found');
        }

        const agreement = docSnap.data() as Agreement;
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
        
    } catch (error) {
        console.error("Error updating signature:", error);
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
