// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyC2810n43Lz_l50_MBg2AexFh-a9L9tqNc",
  authDomain: "bizcard-portfolio-5a025.firebaseapp.com",
  projectId: "bizcard-portfolio-5a025",
  storageBucket: "bizcard-portfolio-5a025.appspot.com",
  messagingSenderId: "367011986503",
  appId: "1:367011986503:web:71e2b02e737c376174a72d",
  measurementId: "G-G64GEX84V6"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const storage = getStorage(app);

// Enable offline persistence
enableIndexedDbPersistence(db)
  .catch((err) => {
    if (err.code == 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled
      // in one tab at a time.
      console.warn('Firebase persistence failed: multiple tabs open.');
    } else if (err.code == 'unimplemented') {
      // The current browser does not support all of the
      // features required to enable persistence
      console.warn('Firebase persistence not available in this browser.');
    }
  });


export { app, db, storage };
