// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
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
const db = getFirestore(app);
const storage = getStorage(app);

// Enable offline persistence
if (typeof window !== 'undefined') {
  try {
    enableIndexedDbPersistence(db);
  } catch (err: any) {
    if (err.code === 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab at a time.
      console.warn('Firebase persistence failed: multiple tabs open.');
    } else if (err.code === 'unimplemented') {
      // The current browser does not support all of the features required to enable persistence
      console.warn('Firebase persistence not available in this browser.');
    }
  }
}


export { app, db, storage };
