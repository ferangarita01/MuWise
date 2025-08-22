
import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

let adminApp: App;

if (!getApps().length) {
  // En un entorno de Google Cloud (como App Hosting), 
  // initializeApp() detecta automáticamente las credenciales.
  // Esto evita conflictos con variables de entorno locales o incorrectas.
  try {
    console.log('Initializing Firebase Admin with Application Default Credentials.');
    adminApp = initializeApp();
    console.log('✅ Firebase Admin initialized successfully.');
  } catch (error: any) {
    console.error('❌ Firebase Admin initialization failed:', error.message);
    // Lanza un error para que el problema sea visible inmediatamente en los logs.
    throw new Error(`Failed to initialize Firebase Admin: ${error.message}`);
  }
} else {
  adminApp = getApps()[0];
}

export const adminDb = getFirestore(adminApp);
export const adminAuth = getAuth(adminApp);
export const adminStorage = getStorage(adminApp);
