
// src/lib/firebase-server.ts
import 'dotenv/config'; // Load environment variables first
import { initializeApp, getApps, cert, getApp, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import type { ServiceAccount } from 'firebase-admin';
import { getStorage } from 'firebase-admin/storage';

console.log('🔥 Initializing Firebase Admin...');

let adminApp: App;

/**
 * Helper to correctly format the private key from environment variables.
 * It replaces escaped newlines (\\n) with actual newlines (\n).
 */
function formatPrivateKey(key?: string): string | undefined {
  if (!key) {
    return undefined;
  }
  // When stored in environment variables, newlines might be escaped.
  // This replaces the literal '\\n' with an actual newline character.
  return key.replace(/\\n/g, '\n');
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
  } catch (error: any) {
    console.error('❌ Firebase Admin initialization failed:', error);
    // Throw a more specific error to aid debugging
    throw new Error(`Failed to initialize Firebase Admin: ${error.message}`);
  }
} else {
  console.log('♻️ Using existing Firebase app.');
  adminApp = getApp();
}

export const adminDb = getFirestore(adminApp);
export const adminAuth = getAuth(adminApp);
export const adminStorage = getStorage(adminApp);

console.log('🎯 Firebase services are ready.');
