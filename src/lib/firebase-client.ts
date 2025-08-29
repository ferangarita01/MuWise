
// src/lib/firebase-client.ts
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// ⚡ Configuración de tu proyecto Firebase
// Estas variables de entorno se definen en .env.local y son cargadas por Next.js
const firebaseConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "new-prototype-rmkd6",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:816776193251:web:926ceb34d4fd82acf5d1d6",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "new-prototype-rmkd6.firebasestorage.app",
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDjIm9EAXcH0jRti-kL0xIffASG-XTJNQE",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "new-prototype-rmkd6.firebaseapp.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "816776193251",
};


// Inicializar Firebase solo una vez
const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Inicializar servicios
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app); // No es necesario pasar el bucket aquí si está en firebaseConfig

if (typeof window !== 'undefined' && window.location.hostname === "localhost") {
  console.log("Connecting to Firebase Auth Emulator");
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
}

// Exportar
export { app, auth, db, storage };
