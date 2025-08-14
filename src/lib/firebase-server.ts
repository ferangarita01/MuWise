// src/lib/firebase-server.ts
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

// Función para validar variables de entorno
function validateEnvVars() {
  const required = ['FIREBASE_PROJECT_ID', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env.local file'
    );
  }
}

// Validar antes de inicializar
validateEnvVars();

const firebaseAdminConfig = {
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID!,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
    privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
  }),
  storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`,
};

// Initialize only once
const app = getApps().length === 0 
  ? initializeApp(firebaseAdminConfig) 
  : getApps()[0];

export const db = getFirestore(app);
export const storage = getStorage(app);