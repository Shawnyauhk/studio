// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getFirestore, initializeFirestore, persistentLocalCache } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyDBp4ux24hmjr-5nP9u5RGV-m4h2oLkZoY",
  authDomain: "studio-697601028-76b1c.firebaseapp.com",
  projectId: "studio-697601028-76b1c",
  storageBucket: "studio-697601028-76b1c.appspot.com",
  messagingSenderId: "60808022828",
  appId: "1:60808022828:web:9cd0358fa9c9cca4e27a89"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with offline persistence
// This is the recommended way for web apps.
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({})
});

const storage = getStorage(app);

export { app, db, storage };
