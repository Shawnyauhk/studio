// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import { getFirestore, initializeFirestore, persistentLocalCache, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// --- Firebase App Initialization ---
// Ensures the app is initialized only once.
const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// --- Firestore and Storage Initialization ---
// These services are now initialized using the recommended modular functions.
let db: Firestore;
let storage: FirebaseStorage;

try {
  // Use initializeFirestore for advanced settings like offline persistence.
  // This is the modern, recommended way for Firebase v9+ and helps prevent race conditions.
  db = initializeFirestore(app, {
    cache: persistentLocalCache(/* tabManager: */{}),
  });
  storage = getStorage(app);
} catch (e) {
  // Fallback for environments where persistence might fail (e.g., certain server-side contexts)
  console.error("Firebase persistence initialization failed, falling back to default.", e);
  db = getFirestore(app);
  storage = getStorage(app);
}

// Asynchronous getter to ensure services are ready before use.
// While initialization is now more robust, this pattern remains a good practice.
export const getFirebase = async () => {
  return { app, db, storage };
};
