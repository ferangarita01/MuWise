
import { initializeApp, getApps, App, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

let adminApp: App;

if (!getApps().length) {
  try {
    // La forma más robusta en entornos administrados es no pasar nada.
    // Si las variables de entorno están configuradas (lo cual es el caso en App Hosting),
    // se usarán automáticamente.
    console.log('Initializing Firebase Admin SDK with Application Default Credentials...');
    adminApp = initializeApp();
    console.log('✅ Firebase Admin SDK initialized successfully.');
  } catch (error: any) {
    console.error('❌ Default Firebase Admin initialization failed:', error.message);
    // Como plan B, si lo anterior falla (por ejemplo, en un entorno local mal configurado),
    // intentamos usar la variable de entorno explícita.
    console.log('Attempting to initialize with FIREBASE_SERVICE_ACCOUNT_KEY...');
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (serviceAccountKey) {
        try {
            const serviceAccount = JSON.parse(serviceAccountKey);
            adminApp = initializeApp({
                credential: cert(serviceAccount),
            });
            console.log('✅ Firebase Admin SDK initialized successfully from environment variable.');
        } catch (e: any) {
             console.error('❌ Failed to parse or use FIREBASE_SERVICE_ACCOUNT_KEY:', e.message);
             throw new Error('Could not initialize Firebase Admin SDK. Ensure credentials are set correctly.');
        }
    } else {
        console.error('❌ FIREBASE_SERVICE_ACCOUNT_KEY environment variable not found.');
        throw new Error('Could not initialize Firebase Admin SDK. Credentials not found.');
    }
  }
} else {
  adminApp = getApps()[0];
}

export const adminDb = getFirestore(adminApp);
export const adminAuth = getAuth(adminApp);
export const adminStorage = getStorage(adminApp);
