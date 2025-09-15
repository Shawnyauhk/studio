// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyDBp4ux24hmjr-5nP9u5RGV-m4h2oLkZoY",
  authDomain: "gourmet-ai-yfnzg.firebaseapp.com",
  projectId: "gourmet-ai-yfnzg",
  storageBucket: "gourmet-ai-yfnzg.appspot.com",
  messagingSenderId: "60808022828",
  appId: "1:60808022828:web:9cd0358fa9c9cca4e27a89"
};

// --- Firebase App Initialization ---
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const db = getFirestore(app);
const storage = getStorage(app);

export { app, db, storage };
