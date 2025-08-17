// src/lib/firebase-admin.ts
import { initializeApp, getApps, cert, getApp, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

// Verificar que las variables de entorno estén configuradas
if (!process.env.FIREBASE_PROJECT_ID) {
  throw new Error('FIREBASE_PROJECT_ID environment variable is not set');
}
if (!process.env.FIREBASE_CLIENT_EMAIL) {
  throw new Error('FIREBASE_CLIENT_EMAIL environment variable is not set');
}
if (!process.env.FIREBASE_PRIVATE_KEY) {
  throw new Error('FIREBASE_PRIVATE_KEY environment variable is not set');
}

const firebaseAdminConfig = {
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
  storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`,
};

// Inicializar Firebase Admin solo si no está ya inicializado
function createFirebaseAdminApp(): App {
  const existingApps = getApps();
  if (existingApps.length > 0) {
    return existingApps[0];
  }
  
  console.log('Initializing Firebase Admin SDK...');
  return initializeApp(firebaseAdminConfig);
}

const adminApp = createFirebaseAdminApp();

export const db = getFirestore(adminApp);
export const storage = getStorage(adminApp);
export const authAdmin = getAuth(adminApp);


// Función para verificar token de usuario
export async function verifyAuthToken(token: string) {
  try {
    const decodedToken = await authAdmin.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying auth token:', error);
    throw new Error('Invalid authentication token');
  }
}
