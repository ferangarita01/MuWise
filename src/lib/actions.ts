'use server';

import { rightsConflictDetection } from '@/ai/flows/rights-conflict-detection';
import type { RightsConflictDetectionOutput } from '@/ai/flows/rights-conflict-detection';
import { db } from './firebase-server'; // Use server-side admin SDK
import { getAuthenticatedUser, updateUserProfile as updateUserProfileClient } from './auth';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import type { Agreement, Composer } from './types';
import { format } from 'date-fns';
import { revalidatePath } from 'next/cache';
import { getStorage } from 'firebase-admin/storage';
import { getDownloadURL } from 'firebase-admin/storage';

export type ActionState = {
  status: 'idle' | 'success' | 'error';
  message: string;
  data?: any;
};

// Define a separate state for upload action
export type UploadActionState = {
    status: 'idle' | 'success' | 'error';
    message: string;
    data?: { downloadURL: string };
};

export async function uploadProfilePhotoAction(
  formData: FormData
): Promise<UploadActionState> {
    const file = formData.get('profilePhoto') as File;
    const userId = formData.get('userId') as string;

    if (!file || !userId) {
        return { status: 'error', message: 'File or user ID missing.' };
    }
    
    // Limit file size to 10MB
    if (file.size > 10 * 1024 * 1024) {
        return { status: 'error', message: 'File size must be less than 10MB.' };
    }

    try {
        const storage = getStorage();
        const bucket = storage.bucket();
        const filePath = `user-avatars/${userId}/${Date.now()}-${file.name}`;
        const fileBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(fileBuffer);
        
        const fileRef = bucket.file(filePath);

        await fileRef.save(buffer, {
            metadata: {
                contentType: file.type,
            },
        });
        
        const downloadURL = await getDownloadURL(fileRef);

        return {
            status: 'success',
            message: 'Photo uploaded successfully.',
            data: { downloadURL },
        };
    } catch (error) {
        console.error('Error uploading profile photo:', error);
        return {
            status: 'error',
            message: 'An unexpected error occurred during file upload.',
        };
    }
}

export async function detectRightsConflictAction(
  previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const file = formData.get('splitSheet') as File;

  if (!file || file.size === 0) {
    return { status: 'error', message: 'Please upload a split sheet file.' };
  }

  // Limit file size to 5MB
  if (file.size > 5 * 1024 * 1024) {
    return { status: 'error', message: 'File size must be less than 5MB.' };
  }

  try {
    const fileBuffer = await file.arrayBuffer();
    const base64String = Buffer.from(fileBuffer).toString('base64');
    const dataUri = `data:${file.type};base64,${base64String}`;
    
    const result = await rightsConflictDetection({ splitSheetDataUri: dataUri });
    
    return {
      status: 'success',
      message: 'Analysis complete.',
      data: result,
    };
  } catch (error) {
    console.error('Error in rights conflict detection:', error);
    return {
      status: 'error',
      message: 'An unexpected error occurred during analysis. The provided document may not be in a supported format.',
    };
  }
}

// ✅ FIRESTORE ACTIONS - USING ADMIN SDK SYNTAX

export async function createAgreement(userId: string, agreementData: Omit<Agreement, 'id' | 'createdAt' | 'status' | 'userId'>) {
    if (!userId) {
        throw new Error('User not authenticated');
    }
    
    const newAgreement = {
        ...agreementData,
        userId: userId,
        createdAt: new Date().toISOString(),
        status: 'Draft',
    };
    
    // ✅ ADMIN SDK SYNTAX
    const docRef = await db.collection('agreements').add(newAgreement);
    
    revalidatePath('/dashboard');
    return { ...newAgreement, id: docRef.id };
}

export async function getAgreements(): Promise<Agreement[]> {
    const user = await getAuthenticatedUser();
    if (!user) {
        console.warn('No authenticated user found, returning empty list.');
        return [];
    }
    
    const q = db.collection('agreements').where("userId", "==", user.uid);
    const querySnapshot = await q.get();
    const agreements: Agreement[] = [];
    
    querySnapshot.forEach((doc) => {
        const data = doc.data();

        const serializedComposers = (data.composers || []).map((composer: any) => ({
            ...composer,
            signedAt: composer.signedAt?.toDate ? composer.signedAt.toDate().toISOString() : composer.signedAt,
        }));
        
        agreements.push({ 
            id: doc.id, 
            ...data,
            composers: serializedComposers,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
            publicationDate: data.publicationDate?.toDate ? data.publicationDate.toDate().toISOString() : data.publicationDate,
        } as Agreement);
    });
    
    return agreements;
}

export async function getAgreement(id: string): Promise<Agreement | null> {
    const docRef = db.collection('agreements').doc(id);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
        const data = docSnap.data()!;

        const serializedComposers = (data.composers || []).map((composer: any) => ({
            ...composer,
            signedAt: composer.signedAt?.toDate ? composer.signedAt.toDate().toISOString() : composer.signedAt,
        }));

        return {
            id: docSnap.id,
            ...data,
            composers: serializedComposers,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
            publicationDate: data.publicationDate?.toDate ? data.publicationDate.toDate().toISOString() : data.publicationDate,
        } as Agreement;
    } else {
        console.log("No such document!");
        return null;
    }
}

export async function updateAgreement(id: string, updates: Partial<Omit<Agreement, 'id'>>) {
    const docRef = db.collection('agreements').doc(id);
    const firestoreUpdates = { ...updates };
    
    if (updates.publicationDate && typeof updates.publicationDate === 'string') {
        firestoreUpdates.publicationDate = new Date(updates.publicationDate).toISOString();
    }
    
    await docRef.update(firestoreUpdates);
    revalidatePath('/dashboard');
    revalidatePath(`/dashboard/agreements/${id}/edit`);
    revalidatePath(`/dashboard/agreements/${id}/sign`);
    revalidatePath(`/sign/${id}`);
}

export async function updateAgreementStatus(id: string, status: Agreement['status']) {
    const docRef = db.collection("agreements").doc(id);
    await docRef.update({ status });
    revalidatePath("/dashboard");
}

export async function updateComposerSignature(agreementId: string, composerId: string, signature: string) {
    const agreement = await getAgreement(agreementId);
    if (!agreement) {
        throw new Error("Agreement not found");
    }

    const composerIndex = agreement.composers.findIndex(c => c.id === composerId);
    if (composerIndex === -1) {
        throw new Error("Composer not found");
    }
    
    const updatedComposers = [...agreement.composers];
    updatedComposers[composerIndex] = {
        ...updatedComposers[composerIndex],
        signature,
        signedAt: new Date().toISOString(),
    };

    const allSigned = updatedComposers.every(c => c.signature);
    const newStatus = allSigned ? 'Signed' : 'Partial';

    await updateAgreement(agreementId, { composers: updatedComposers, status: newStatus });
}

export async function generatePdfAction(agreementId: string): Promise<{ data: string } | { error: string }> {
  const agreement = await getAgreement(agreementId);

  if (!agreement) {
    return { error: 'Agreement not found' };
  }

  try {
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    const de = {
      title: "Acuerdo de División de Compositores",
      songTitle: "Título de la Canción",
      composers: "Compositores",
      share: "Porcentaje",
      publisher: "Editora",
      signature: "Firma",
      date: "Fecha",
      generatedOn: "Generado el",
      draftWatermark: "BORRADOR"
    };

    const en = {
      title: "Songwriter Split Agreement",
      songTitle: "Song Title",
      composers: "Composers",
      share: "Share",
      publisher: "Publisher",
      signature: "Signature",
      date: "Date",
      generatedOn: "Generated on",
      draftWatermark: "DRAFT"
    };
    
    let y = height - 50;

    const drawText = (text: string, x: number, yPos: number, options?: { font?: any, size?: number, color?: any }) => {
      page.drawText(text, {
        x,
        y: yPos,
        font: options?.font || font,
        size: options?.size || 12,
        color: options?.color || rgb(0, 0, 0),
      });
    };

    // --- Bilingual Header ---
    drawText(`${en.title} / ${de.title}`, 50, y, { font: boldFont, size: 18 });
    y -= 30;

    // --- Song Details ---
    drawText(`${en.songTitle} / ${de.songTitle}: ${agreement.songTitle}`, 50, y, { font: boldFont });
    y -= 20;
    
    // --- Composers Table ---
    const tableTop = y;
    const tableLeft = 50;
    const rowHeight = 40;
    const headerY = tableTop - 15;

    drawText(`${en.composers} / ${de.composers}`, tableLeft, headerY, { font: boldFont });
    drawText(`${en.publisher} / ${de.publisher}`, tableLeft + 150, headerY, { font: boldFont });
    drawText(`${en.share} / ${de.share}`, tableLeft + 300, headerY, { font: boldFont });
    drawText(`${en.signature} / ${de.signature}`, tableLeft + 380, headerY, { font: boldFont });
    drawText(`${en.date} / ${de.date}`, tableLeft + 480, headerY, { font: boldFont });
    
    y -= rowHeight;
    
    for (const composer of agreement.composers) {
      if (y < 100) {
          // Add a new page if content overflows
          page = pdfDoc.addPage();
          y = page.getHeight() - 50;
      }
      
      drawText(composer.name, tableLeft, y);
      drawText(composer.publisher, tableLeft + 150, y);
      drawText(`${composer.share}%`, tableLeft + 300, y);

      if(composer.signature){
        const pngImage = await pdfDoc.embedPng(composer.signature);
        page.drawImage(pngImage, {
            x: tableLeft + 380,
            y: y - 10,
            width: 80,
            height: 30,
        });
      } else {
         page.drawLine({ start: { x: tableLeft + 380, y: y-5 }, end: { x: tableLeft + 460, y: y-5 } })
      }
      
      if(composer.signedAt){
        drawText(new Date(composer.signedAt).toLocaleDateString(), tableLeft + 480, y);
      } else {
        page.drawLine({ start: { x: tableLeft + 480, y: y-5 }, end: { x: tableLeft + 550, y: y-5 } })
      }
      
      y -= rowHeight;
    }
    
    // --- Footer ---
    const generationDate = `${en.generatedOn} / ${de.generatedOn}: ${format(new Date(), 'PPP')}`;
    drawText(generationDate, 50, 50, { size: 8, color: rgb(0.5, 0.5, 0.5) });

    // --- Draft Watermark ---
    if (agreement.status !== 'Signed') {
      const watermarkText = `${en.draftWatermark} / ${de.draftWatermark}`;
      page.drawText(watermarkText, {
        x: width / 2 - 120,
        y: height / 2,
        font: boldFont,
        size: 80,
        color: rgb(0.85, 0.85, 0.85),
        opacity: 0.5,
        rotate: degrees(-45),
      });
    }

    const pdfBytes = await pdfDoc.save();
    const base64String = Buffer.from(pdfBytes).toString('base64');
    
    return { data: base64String };

  } catch (error) {
    console.error('PDF Generation Error:', error);
    return { error: 'Failed to generate PDF.' };
  }
}

export async function getUserProfileAction() {
    const user = await getAuthenticatedUser();
    if (!user?.uid) {
        return { status: 'error', message: 'User not authenticated' };
    }
    
    const userDocRef = db.collection('users').doc(user.uid);
    const docSnap = await userDocRef.get();

    if (docSnap.exists) {
        return { status: 'success', data: docSnap.data() };
    } else {
        return { status: 'error', message: 'User profile not found.' };
    }
}