// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import { getFirestore, initializeFirestore, persistentLocalCache, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { getAuth, type Auth } from 'firebase/auth';

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp;
let db: Firestore;
let storage: FirebaseStorage;
let auth: Auth;

// This function can be called multiple times, but will only initialize Firebase once.
function initializeFirebase() {
  if (getApps().length === 0) {
    try {
      app = initializeApp(firebaseConfig);
      // Use initializeFirestore for enabling persistence if it's a key feature.
      // Note: This might have implications in server environments.
      if (typeof window !== 'undefined') {
        db = initializeFirestore(app, {
          cache: persistentLocalCache({}),
        });
      } else {
        db = getFirestore(app);
      }
      storage = getStorage(app);
      auth = getAuth(app);
    } catch (e) {
      console.error("Firebase initialization failed:", e);
      // Fallback for environments where persistence might fail
      if (!getApps().length) {
         app = initializeApp(firebaseConfig);
      } else {
         app = getApp();
      }
      db = getFirestore(app);
      storage = getStorage(app);
      auth = getAuth(app);
    }
  } else {
    app = getApp();
    db = getFirestore(app);
    storage = getStorage(app);
    auth = getAuth(app);
  }
}

// Initialize Firebase on module load.
initializeFirebase();


export const getFirebase = async () => {
  // The instances are already initialized, just return them.
  return { app, db, storage, auth };
};

// Export the initialized instances for direct use.
export { app, db, storage, auth };
