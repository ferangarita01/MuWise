
// src/lib/firebase-server.ts
import { initializeApp, getApps, cert, getApp, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import type { ServiceAccount } from 'firebase-admin';
import { getStorage } from 'firebase-admin/storage';

console.log('🔥 Initializing Firebase Admin...');

let adminApp: App;

/**
 * Helper to correctly format the private key.
 * - Removes extra quotes if they exist.
 * - Converts literal "\\n" into actual newlines.
 */
function formatPrivateKey(key?: string): string | undefined {
  if (!key) {
    return undefined;
  }
  // This handles keys that are passed in with surrounding quotes and literal `\n` characters.
  return key.replace(/\\n/g, '\n').replace(/"/g, '');
}

if (!getApps().length) {
  try {
    console.log('📦 No existing Firebase apps, creating new one...');

    const serviceAccount: ServiceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      privateKey: formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY),
    };
    
    if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
      throw new Error('Firebase server credentials not found or incomplete in environment variables.');
    }

    adminApp = initializeApp({
      credential: cert(serviceAccount),
      storageBucket: `${serviceAccount.projectId}.appspot.com`,
    });

    console.log('✅ Firebase Admin initialized successfully.');
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error);
    throw error;
  }
} else {
  console.log('♻️ Using existing Firebase app.');
  adminApp = getApp();
}

export const adminDb = getFirestore(adminApp);
export const adminAuth = getAuth(adminApp);
export const adminStorage = getStorage(adminApp);

console.log('🎯 Firebase services are ready.');
