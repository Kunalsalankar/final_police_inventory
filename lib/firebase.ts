import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';

// Centralized Firebase initialization
const firebaseConfig = {
  apiKey: "AIzaSyBZYvwt5dOL2jr7C7E0T7kHmy1wrVpvsCQ",
  authDomain: "omkar-bcfd4.firebaseapp.com",
  projectId: "omkar-bcfd4",
  storageBucket: "omkar-bcfd4.firebasestorage.app",
  messagingSenderId: "865551458358",
  appId: "1:865551458358:web:28e626110e592a7582f897",
  measurementId: "G-5SQD2GPRNB"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Export initialized services for reuse across the app
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const rtdb = getDatabase(app);


