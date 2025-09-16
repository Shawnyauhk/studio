// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import { getFirestore, initializeFirestore, persistentLocalCache, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyDBp4ux24hmjr-5nP9u5RGV-m4h2oLkZoY",
  authDomain: "studio-697601028-76b1c.firebaseapp.com",
  projectId: "studio-697601028-76b1c",
  storageBucket: "studio-697601028-76b1c.appspot.com",
  messagingSenderId: "60808022828",
  appId: "1:60808022828:web:9cd0358fa9c9cca4e27a89"
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
