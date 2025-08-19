
'use server';
import 'dotenv/config';
import { initializeApp, getApps, App, getApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

let adminApp: App;

if (!getApps().length) {
    console.log('🔥 Initializing Firebase Admin...');
    try {
        const firebaseConfigEnv = process.env.FIREBASE_CONFIG;
        if (!firebaseConfigEnv) {
            throw new Error('FIREBASE_CONFIG environment variable not found.');
        }

        const serviceAccount = JSON.parse(firebaseConfigEnv);
        
        // Ensure private_key has correct newline characters
        if (serviceAccount.privateKey) {
             serviceAccount.privateKey = serviceAccount.privateKey.replace(/\\n/g, '\n');
        }

        adminApp = initializeApp({
            credential: cert(serviceAccount)
        });
        console.log('✅ Firebase Admin initialized successfully using provided config.');

    } catch (error: any) {
        console.error('❌ Firebase Admin initialization failed:', error.message);
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
