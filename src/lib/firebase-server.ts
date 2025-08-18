// src/lib/firebase-server.ts
import { initializeApp, getApps, cert, getApp, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import type { ServiceAccount } from 'firebase-admin'; // ✅ corrección: importar el type desde "firebase-admin" (no desde lib interno)
import { getStorage } from 'firebase-admin/storage';

console.log('🔥 Initializing Firebase Admin...');

let adminApp: App;

/**
 * ✅ Helper para dar formato correcto a la private key
 * - Quita comillas extra si existen (algunas veces se ponen en .env por error).
 * - Convierte "\n" literales en saltos de línea reales.
 */
function formatPrivateKey(key?: string): string | undefined {
  if (!key) {
    return undefined;
  }
  // This handles keys that are passed in with surrounding quotes and literal `\n` characters.
  return key.replace(/\\n/g, '\n').replace(/"/g, '');
}

if (!getApps().length) {
  try {
    console.log('📦 No existing Firebase apps, creating new one...');

    const serviceAccount: ServiceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID!,   // ✅ debe existir en tu .env
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!, // ✅ debe existir en tu .env
      privateKey: formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY), // ✅ se formatea automáticamente
    };

    // 🔧 Corrección 3: chequeo extra para evitar inicializar sin credenciales válidas
    if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
      throw new Error('Firebase server credentials not found in environment variables.');
    }

    adminApp = initializeApp({
      credential: cert(serviceAccount),
      storageBucket: `${serviceAccount.projectId}.appspot.com`,
    });

    console.log('✅ Firebase Admin initialized successfully.');
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error);
    throw error; // detener ejecución si falla
  }
} else {
  console.log('♻️ Using existing Firebase app.');
  adminApp = getApp();
}

export const adminDb = getFirestore(adminApp);
export const adminAuth = getAuth(adminApp);
export const adminStorage = getStorage(adminApp);

console.log('🎯 Firebase services are ready.');
