
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage as getClientStorage } from 'firebase/storage';
import { getStorage as getAdminStorage } from 'firebase-admin/storage';
import * as admin from 'firebase-admin';

const firebaseConfig = {
  "projectId": "new-prototype-rmkd6",
  "appId": "1:816776193251:web:926ceb34d4fd82acf5d1d6",
  "storageBucket": "new-prototype-rmkd6.appspot.com",
  "apiKey": "AIzaSyDjIm9EAXcH0jRti-kL0xIffASG-XTJNQE",
  "authDomain": "new-prototype-rmkd6.firebaseapp.com",
  "messagingSenderId": "816776193251"
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    storageBucket: firebaseConfig.storageBucket,
  });
}

const db = admin.firestore();
const getStorage = () => admin.storage();


export { db, getStorage };
