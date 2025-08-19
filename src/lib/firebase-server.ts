
import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

let adminApp: App;

if (!getApps().length) {
  try {
    // In a Google Cloud environment like App Hosting, the SDK will automatically
    // find the service account credentials if no config is provided.
    adminApp = initializeApp();
    console.log('✅ Firebase Admin initialized successfully using Application Default Credentials.');
  } catch (error: any) {
    console.error('❌ Firebase Admin initialization failed:', error.message);
    // Throw an error to prevent the app from starting with a misconfigured admin client
    throw new Error(`Failed to initialize Firebase Admin: ${error.message}`);
  }
} else {
  adminApp = getApps()[0];
}

export const adminDb = getFirestore(adminApp);
export const adminAuth = getAuth(adminApp);
export const adminStorage = getStorage(adminApp);
