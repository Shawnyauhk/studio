// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
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
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);

// Asynchronous getter for Firebase services to ensure initialization is complete.
// Although initialization is synchronous here, this pattern can be useful for more complex setups.
export const getFirebase = async () => {
  return { app, db, storage };
};
