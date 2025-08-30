'use server';

import { ServiceContainer } from '@/services';
import { adminDb } from "@/lib/firebase-server";
import { revalidatePath } from 'next/cache';
import { UserProfile } from "@/hooks/useUserProfile"; // <-- RUTA CORREGIDA

interface ActionResult {
  status: 'success' | 'error';
  message: string;
  data?: any;
}

/**
 * Updates the user's profile data in Firestore.
 * @param profileData The user profile data to update.
 */
export async function updateUserProfile(profileData: Partial<UserProfile>) {
  // Aquí debes obtener el ID del usuario autenticado de forma segura.
  // Por ahora, usamos un marcador de posición.
  const userId = "DlmjCU2RtJZ6pmbRNwDCTwkD3Dn1"; // <-- REEMPLAZAR CON EL ID REAL DEL USUARIO

  try {
    const userRef = adminDb.collection('users').doc(userId);
    await userRef.update(profileData);
    
    // Revalida la ruta para que la interfaz de usuario se actualice
    revalidatePath('/dashboard/account/profile');
    
    return { success: true, message: 'Perfil actualizado exitosamente.' };
  } catch (error) {
    console.error("Failed to update user profile:", error);
    return { success: false, message: 'Error al actualizar el perfil.' };
  }
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
