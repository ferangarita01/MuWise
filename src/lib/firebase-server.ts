
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

let adminApp: App;

// Lee el bucket de almacenamiento desde las variables de entorno.
// Intenta múltiples variables para máxima compatibilidad
const storageBucket = process.env.FIREBASE_STORAGE_BUCKET || 
                     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
                     'new-prototype-rmkd6.firebasestorage.app'; // Fallback

console.log('Storage bucket configured:', storageBucket);

if (!storageBucket) {
  console.error('FIREBASE_STORAGE_BUCKET environment variable is not configured!');
  throw new Error('Firebase Storage bucket name is not configured in environment variables.');
}

if (!getApps().length) {
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  const appConfig: { credential?: any, storageBucket: string } = {
    // Proporciona el bucket de almacenamiento al inicializar la app.
    storageBucket: storageBucket,
  };

  if (serviceAccountKey) {
    try {
      const serviceAccount = JSON.parse(serviceAccountKey);
      appConfig.credential = cert(serviceAccount);
      adminApp = initializeApp(appConfig);
      console.log('Firebase Admin SDK initialized with service account key');
    } catch (e) {
      console.error('Failed to initialize Firebase Admin SDK from service account key, falling back to default.', e);
      // Fallback for environments like Google Cloud Run with Application Default Credentials
      delete appConfig.credential;
      adminApp = initializeApp(appConfig);
      console.log('Firebase Admin SDK initialized with Application Default Credentials');
    }
  } else {
    console.log('Initializing Firebase Admin SDK with Application Default Credentials...');
    adminApp = initializeApp(appConfig);
  }
} else {
  adminApp = getApps()[0];
}

export const adminDb = getFirestore(adminApp);
export const adminAuth = getAuth(adminApp);
export const adminStorage = getStorage(adminApp);
// Exporta el adminApp para poder acceder a la configuración del bucket en otros servicios.
export { adminApp };
