// src/lib/firebase-server.ts
import { initializeApp, getApps, cert, getApp, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

// In production, App Hosting provides the credentials automatically.
// For local development, we use a service account key.
const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

const firebaseAdminConfig = {
  credential: cert(serviceAccount),
  storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`,
};

function createFirebaseAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
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
