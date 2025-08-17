// src/lib/firebase-server.ts
import { initializeApp, getApps, cert, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

const isEmulator = process.env.NODE_ENV === 'development';

const app = getApps().length
  ? getApp()
  : initializeApp({
      credential:
        !isEmulator && serviceAccount.privateKey
          ? cert(serviceAccount)
          : undefined,
      storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`,
    });

export const db = getFirestore(app);
export const storage = getStorage(app);
