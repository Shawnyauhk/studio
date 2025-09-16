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

if (!getApps().length) {
  try {
    app = initializeApp(firebaseConfig);
    db = initializeFirestore(app, {
      cache: persistentLocalCache({}),
    });
    storage = getStorage(app);
    auth = getAuth(app);
  } catch (e) {
    console.error("Firebase initialization failed:", e);
    // Fallback to simpler initialization if advanced features fail
    app = initializeApp(firebaseConfig);
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


export const getFirebase = async () => {
  return { app, db, storage, auth };
};

export { app, db, storage, auth };
