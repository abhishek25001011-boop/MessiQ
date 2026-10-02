import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC4uyeDaryU8NmDW-JM4rsq_e8DOWHrktc",
  authDomain: "messiq-3b7d2.firebaseapp.com",
  projectId: "messiq-3b7d2",
  storageBucket: "messiq-3b7d2.firebasestorage.app",
  messagingSenderId: "360798069166",
  appId: "1:360798069166:web:0050827aa10ab33d23e83f",
  measurementId: "G-02RX1SJ9LB",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
