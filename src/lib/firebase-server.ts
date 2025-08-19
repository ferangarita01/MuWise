
'use server';

import { initializeApp, getApps, App, getApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

let adminApp: App;

// This logic ensures that we only initialize the app once,
// which is the recommended practice.
if (getApps().length === 0) {
  // In a Google Cloud environment like App Hosting, the SDK will automatically
  // find the service account credentials.
  adminApp = initializeApp();
  console.log('✅ Firebase Admin initialized successfully using Application Default Credentials.');
} else {
  adminApp = getApp();
  console.log('♻️ Using existing Firebase Admin app.');
}

export const adminDb = getFirestore(adminApp);
export const adminAuth = getAuth(adminApp);
export const adminStorage = getStorage(adminApp);
