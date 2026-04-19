// 1 fil - 1 funktion
// src/lib/firebase.ts – Firebase opsætning til Min Økonomi Coach

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Din Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDxrM8EGHFPVg-5OD489iLDcwbOCh9ugoc",
  authDomain: "min-oekonomi-coach.firebaseapp.com",
  projectId: "min-oekonomi-coach",
  storageBucket: "min-oekonomi-coach.firebasestorage.app",
  messagingSenderId: "875312716454",
  appId: "1:875312716454:web:2c99d49a5fad98ac2c7267",
  measurementId: "G-87ZHZ6RY96"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Eksportér det vi skal bruge
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;