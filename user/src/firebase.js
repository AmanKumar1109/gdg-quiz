import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAwfX3eOCmwRJEJ1Bnhok8m4RE0Z4YYdNU",
  authDomain: "defest-quiz.firebaseapp.com",
  projectId: "defest-quiz",
  storageBucket: "defest-quiz.firebasestorage.app",
  messagingSenderId: "157516705562",
  appId: "1:157516705562:web:e14e0bbc63fc364ad846a3",
  measurementId: "G-TE1E22YTHQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);