
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
    
    const firebaseAdminConfig = {
        credential: cert(serviceAccount),
        storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`,
    };

    if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
        console.log('🚀 Production mode (or missing local env vars) - using default credentials');
        adminApp = initializeApp();
    } else {
        console.log('🔧 Development mode - using service account from env');
        console.log('🔑 Service account email:', serviceAccount.clientEmail);
        console.log('🏗️ Project ID:', serviceAccount.projectId);
        adminApp = initializeApp(firebaseAdminConfig);
    }

    console.log('✅ Firebase Admin initialized successfully');
  } else {
    console.log('♻️ Using existing Firebase app');
    adminApp = getApps()[0];
  }
} catch (error) {
  console.error('💥 Firebase Admin initialization failed:', error);
  throw error;
}


export const db = getFirestore(adminApp);
export const storage = getStorage(adminApp);
export const authAdmin = getAuth(adminApp);

console.log('📊 Firestore instance created');
console.log('🔐 Auth instance created');


// Función para verificar token de usuario
export async function verifyAuthToken(token: string) {
  try {
    const decodedToken = await authAdmin.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying auth token:', error);
    throw new Error('Invalid authentication token');
  }
}
