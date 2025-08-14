
import * as admin from 'firebase-admin';

const firebaseConfig = {
  projectId: "new-prototype-rmkd6",
  storageBucket: "new-prototype-rmkd6.appspot.com",
};

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    // Use application default credentials on the server
    credential: admin.credential.applicationDefault(),
    storageBucket: firebaseConfig.storageBucket,
  });
}

const db = admin.firestore();
const getStorage = () => admin.storage();

export { db, getStorage };
