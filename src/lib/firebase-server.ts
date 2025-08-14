import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: "new-prototype-rmkd6",
    storageBucket: "new-prototype-rmkd6.appspot.com",
  });
}

export const db = admin.firestore();
export const getStorage = () => admin.storage();

    