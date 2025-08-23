
'use server';

import { adminStorage } from '@/lib/firebase-server';
import { revalidatePath } from 'next/cache';

interface ActionResult {
    status: 'success' | 'error';
    message: string;
    data?: any;
}

export async function uploadProfilePhotoAction(formData: FormData): Promise<ActionResult> {
    const file = formData.get('profilePhoto') as File;
    const userId = formData.get('userId') as string;

    if (!file || !userId) {
        return { status: 'error', message: 'No file or user ID provided.' };
    }

    try {
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        const bucket = adminStorage.bucket();
        const filePath = `profile-photos/${userId}/${file.name}`;
        const fileUpload = bucket.file(filePath);

        await fileUpload.save(fileBuffer, {
            metadata: {
                contentType: file.type,
            },
        });
        
        await fileUpload.makePublic();
        const downloadURL = fileUpload.publicUrl();

        revalidatePath('/dashboard/profile');

        return { 
            status: 'success', 
            message: 'Photo uploaded successfully.',
            data: { downloadURL } 
        };
    } catch (error: any) {
        console.error('Upload failed:', error);
        return { status: 'error', message: `Upload failed: ${error.message}` };
    }
}

    