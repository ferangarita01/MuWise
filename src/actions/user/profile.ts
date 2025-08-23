'use server';

import { ServiceContainer } from '@/services';
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
    const userService = ServiceContainer.getUserService();
    const result = await userService.uploadProfilePhoto(file, userId);

    revalidatePath('/dashboard/profile');

    return { 
      status: 'success', 
      message: 'Photo uploaded successfully.',
      data: result 
    };
  } catch (error: any) {
    console.error('Upload failed:', error);
    return { status: 'error', message: `Upload failed: ${error.message}` };
  }
}