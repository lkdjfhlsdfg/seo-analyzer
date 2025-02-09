import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDcLgY5VWCdVJqDhCQMnR0Q0AlGb0RDwy0",
  authDomain: "rankpulse-23008.firebaseapp.com",
  projectId: "rankpulse-23008",
  storageBucket: "rankpulse-23008.firebasestorage.app",
  messagingSenderId: "87352794907",
  appId: "1:87352794907:web:0feecf73fff68ab1747dbe"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage }; 