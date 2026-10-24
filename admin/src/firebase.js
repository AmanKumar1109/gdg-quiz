import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";

export const firebaseConfig = {
  apiKey: "AIzaSyAwfX3eOCmwRJEJ1Bnhok8m4RE0Z4YYdNU",
  authDomain: "defest-quiz.firebaseapp.com",
  projectId: "defest-quiz",
  storageBucket: "defest-quiz.firebasestorage.app",
  messagingSenderId: "157516705562",
  appId: "1:157516705562:web:e14e0bbc63fc364ad846a3",
  measurementId: "G-TE1E22YTHQ"
};

// Initialize Main Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Cloud Firestore database
export const db = getFirestore(app);

// Firebase Authentication
export const auth = getAuth(app);

// Secondary Auth instance for creating manager accounts without signing out current admin
export const getSecondaryAuth = () => {
  const secondaryAppName = "DevFestManagerSecondaryAuth";
  const existingApp = getApps().find(a => a.name === secondaryAppName);
  const secondaryApp = existingApp || initializeApp(firebaseConfig, secondaryAppName);
  return getAuth(secondaryApp);
};

// Initialize Analytics safely
export let analytics = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {});
}