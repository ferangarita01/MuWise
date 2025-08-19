import { initializeApp, getApps, App, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

let adminApp: App;

if (!getApps().length) {
  console.log('🔥 Initializing Firebase Admin...');
  try {
    // When deployed to a Google Cloud environment, the SDK will automatically
    // detect the service account credentials and initialize.
    adminApp = initializeApp();
    console.log('✅ Firebase Admin initialized successfully using application default credentials.');
  } catch (error: any) {
    console.error('❌ Firebase Admin initialization failed:', error.message);
    // Provide a more descriptive error for common issues.
    if (error.code === 'GOOGLE_APPLICATION_CREDENTIALS_NOT_SET') {
      throw new Error('Google Application Credentials are not set. Ensure you are in a configured server environment.');
    }
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
