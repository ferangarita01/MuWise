// src/lib/firebase-server.ts
import { initializeApp, getApps, cert, getApp, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

console.log('🔥 Initializing Firebase Admin...');
console.log('Environment:', process.env.NODE_ENV);
console.log('Existing apps:', getApps().length);

let adminApp: App;

try {
  if (getApps().length === 0) {
    console.log('📦 No existing Firebase apps, creating new one...');

    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };
    
    console.log('🔑 Service Account Info:');
    console.log('- Project ID:', serviceAccount.projectId ? '✅ SET' : '❌ MISSING');
    console.log('- Client Email:', serviceAccount.clientEmail ? '✅ SET' : '❌ MISSING');
    console.log('- Private Key:', serviceAccount.privateKey ? '✅ SET' : '❌ MISSING');

    if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
      console.log('🚀 Missing credentials - using default (this will fail in local dev)');
      throw new Error('Missing Firebase credentials');
    }

    const firebaseAdminConfig = {
      credential: cert(serviceAccount),
      storageBucket: `${serviceAccount.projectId}.appspot.com`,
    };

    adminApp = initializeApp(firebaseAdminConfig);
    console.log('✅ Firebase Admin initialized with custom credentials');
  } else {
    adminApp = getApp();
    console.log('♻️ Using existing Firebase app');
  }
} catch (error) {
  console.error('❌ Firebase Admin initialization failed:', error);
  throw error;
}

// Exportar instancias
export const adminDb = getFirestore(adminApp);
export const adminAuth = getAuth(adminApp);
export const adminStorage = getStorage(adminApp);

console.log('🎯 Firebase services initialized');
