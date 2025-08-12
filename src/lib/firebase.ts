
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  "projectId": "new-prototype-rmkd6",
  "appId": "1:816776193251:web:926ceb34d4fd82acf5d1d6",
  "storageBucket": "new-prototype-rmkd6.firebasestorage.app",
  "apiKey": "AIzaSyDjIm9EAXcH0jRti-kL0xIffASG-XTJNQE",
  "authDomain": "new-prototype-rmkd6.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "816776193251"
};

// Initialize Firebase
const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
