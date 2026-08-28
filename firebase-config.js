// firebase-config.js

// 1. Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, serverTimestamp, query, orderBy } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// 2. Your web app's Firebase configuration
// IMPORTANT: Replace this configuration object with your actual Firebase Project config!
const firebaseConfig = {
  apiKey: "AIzaSyA0q32DGf9guFwl0HTTKf1A8g1VJ5-Qz_g",
  authDomain: "feedbackform-22c52.firebaseapp.com",
  projectId: "feedbackform-22c52",
  storageBucket: "feedbackform-22c52.firebasestorage.app",
  messagingSenderId: "931033145288",
  appId: "1:931033145288:web:c224330a9a459fbfcaeafd",
  measurementId: "G-J62H6CCGPZ"
};

// 3. Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Export instances and modular functions to be used across the app
export {
  auth,
  db,
  signInAnonymously,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  query,
  orderBy
};
