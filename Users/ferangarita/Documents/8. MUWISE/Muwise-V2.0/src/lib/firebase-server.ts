import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

let adminApp: App;

if (!getApps().length) {
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (serviceAccountKey) {
    try {
      console.log('Initializing Firebase Admin SDK from environment variable...');
      const serviceAccount = JSON.parse(serviceAccountKey);
      adminApp = initializeApp({
        credential: cert(serviceAccount),
      });
      console.log('✅ Firebase Admin SDK initialized successfully from environment variable.');
    } catch (e: any) {
      console.error('❌ Failed to parse or use FIREBASE_SERVICE_ACCOUNT_KEY:', e.message);
      // Fallback to default credentials if parsing fails
      console.log('Attempting to initialize with Application Default Credentials as a fallback...');
      try {
        adminApp = initializeApp();
        console.log('✅ Firebase Admin SDK initialized successfully with Application Default Credentials.');
      } catch (defaultError: any) => {
        console.error('❌ Default Firebase Admin initialization also failed:', defaultError.message);
        throw new Error('Could not initialize Firebase Admin SDK. Ensure credentials are set correctly in FIREBASE_SERVICE_ACCOUNT_KEY or in the execution environment.');
      }
    }
  } else {
    // This path is for production environments like Google App Hosting
    console.log('Initializing Firebase Admin SDK with Application Default Credentials...');
    try {
      adminApp = initializeApp();
      console.log('✅ Firebase Admin SDK initialized successfully with Application Default Credentials.');
    } catch (error: any) {
      console.error('❌ Default Firebase Admin initialization failed:', error.message);
      throw new Error('Could not initialize Firebase Admin SDK. Credentials not found.');
    }
  }
} else {
  adminApp = getApps()[0];
}

export const adminDb = getFirestore(adminApp);
export const adminAuth = getAuth(adminApp);
export const adminStorage = getStorage(adminApp);
