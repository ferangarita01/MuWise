
// src/lib/firebase-server.ts
import { initializeApp, getApps, getApp, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

console.log('🔥 Initializing Firebase Admin...');

let adminApp: App;

if (!getApps().length) {
  try {
    console.log('📦 No existing Firebase apps, creating new one using default credentials...');
    
    // When running on Google Cloud (like App Hosting), initializeApp() with no arguments
    // automatically uses the service account associated with the runtime environment.
    // This is the recommended approach for production.
    adminApp = initializeApp();
    
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
