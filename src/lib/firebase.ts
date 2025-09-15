// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getFirestore, initializeFirestore, memoryLocalCache, persistentLocalCache } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig: FirebaseOptions = {
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

// Initialize Firestore with offline persistence
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: 'browser-tabs'
  })
});

const storage = getStorage(app);

export { app, db, storage };
