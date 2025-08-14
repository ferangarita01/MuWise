import admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      storageBucket: "new-prototype-rmkd6.appspot.com",
    });
    console.log('Firebase Admin SDK initialized successfully.');
  } catch (error) {
    console.error('Firebase Admin SDK initialization error:', error);
    // In a real production app, you might want to handle this more gracefully
    // For now, we log the error to help with debugging.
  }
}

const db = admin.firestore();
const getStorage = () => admin.storage();

export { db, getStorage, admin };
