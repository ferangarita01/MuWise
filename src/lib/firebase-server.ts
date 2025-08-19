
import { initializeApp, getApps, App, getApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';
import 'dotenv/config';

let adminApp: App;

if (!getApps().length) {
  try {
    console.log('🔥 Initializing Firebase Admin...');

    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      adminApp = initializeApp({
        credential: cert(serviceAccount),
      });
      console.log('✅ Firebase Admin initialized successfully using service account key.');
    } else if (process.env.GCP_PROJECT) {
      // Fallback for environments like Cloud Run with default credentials
      adminApp = initializeApp();
      console.log('✅ Firebase Admin initialized successfully using application default credentials.');
    } else {
      throw new Error('Firebase server credentials not found. Set FIREBASE_SERVICE_ACCOUNT_KEY or run in a GCP environment.');
    }
  } catch (error: any) {
    console.error('❌ Firebase Admin initialization failed:', error);
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
