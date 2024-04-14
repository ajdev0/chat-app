// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "react-chat-0.firebaseapp.com",
  projectId: "react-chat-0",
  storageBucket: "react-chat-0.appspot.com",
  messagingSenderId: "209326593641",
  appId: "1:209326593641:web:b5d565838f59eea8d8f4f8",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth();
export const db = getFirestore();
export const storage = getStorage();
