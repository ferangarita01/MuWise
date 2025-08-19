
'use server';
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

let adminApp: App;

if (getApps().length === 0) {
  try {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountKey) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable not found.');
    }
    
    const serviceAccount = JSON.parse(serviceAccountKey);

    adminApp = initializeApp({
      credential: cert(serviceAccount),
      storageBucket: `${serviceAccount.project_id}.appspot.com`,
    });
    console.log('✅ Firebase Admin initialized successfully using service account key.');
    
  } catch (error: any) {
    console.error('❌ Firebase Admin initialization failed:', error.message);
    throw new Error(`Failed to initialize Firebase Admin: ${error.message}`);
  }
} else {
  adminApp = getApps()[0];
  console.log('♻️ Using existing Firebase Admin app.');
}

export const adminDb = getFirestore(adminApp);
export const adminAuth = getAuth(adminApp);
export const adminStorage = getStorage(adminApp);
