'use server';

import { rightsConflictDetection } from '@/ai/flows/rights-conflict-detection';
import type { RightsConflictDetectionOutput } from '@/ai/flows/rights-conflict-detection';

export type ActionState = {
  status: 'idle' | 'success' | 'error';
  message: string;
  data?: RightsConflictDetectionOutput;
};

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
    // This could be a more specific error message based on the error type
    return {
      status: 'error',
      message: 'An unexpected error occurred during analysis. The provided document may not be in a supported format.',
    };
  }
}
