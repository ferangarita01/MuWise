
// src/lib/firebase-server.ts
import { initializeApp, getApps, cert, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { getAuth } from 'firebase-admin/auth';

// Verify that the environment variables are configured
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

// Initialize Firebase Admin only if it hasn't been initialized yet
function getAdminApp() {
  if (getApps().length > 0) {
    return getApp();
  }
  console.log('Initializing Firebase Admin SDK...');
  return initializeApp(firebaseAdminConfig);
}

const adminApp = getAdminApp();

export const db = getFirestore(adminApp);
export const storage = getStorage(adminApp);
export const authAdmin = getAuth(adminApp);
