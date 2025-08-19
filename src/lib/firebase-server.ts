
// src/lib/firebase-server.ts
import { initializeApp, getApps, cert, getApp, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import type { ServiceAccount } from 'firebase-admin';
import { getStorage } from 'firebase-admin/storage';

console.log('🔥 Initializing Firebase Admin...');

let adminApp: App;

if (!getApps().length) {
  try {
    console.log('📦 No existing Firebase apps, creating new one...');
    
    // In a production environment (like App Hosting), the service account key
    // is expected to be in the FIREBASE_CONFIG environment variable as a JSON string.
    const serviceAccountString = process.env.FIREBASE_CONFIG;
    
    if (!serviceAccountString) {
      throw new Error('Firebase server credentials not found in FIREBASE_CONFIG environment variable.');
    }

    const serviceAccount: ServiceAccount = JSON.parse(serviceAccountString);

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
