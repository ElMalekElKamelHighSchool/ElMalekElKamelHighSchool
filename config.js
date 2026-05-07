import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getAuth, setPersistence, browserLocalPersistence, onAuthStateChanged, sendEmailVerification, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, addDoc, query, where, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCSwNiOHDC0m6zoBx_BeAGyaE33Zmhuvi4",
  authDomain: "hazoma-60ed2.firebaseapp.com",
  databaseURL: "https://hazoma-60ed2-default-rtdb.firebaseio.com",
  projectId: "hazoma-60ed2",
  storageBucket: "hazoma-60ed2.firebasestorage.app",
  messagingSenderId: "962438384604",
  appId: "1:962438384604:web:52db16e5723a8f6d3bdd19",
  measurementId: "G-BWQ5CZR50F"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// حفظ الدخول الدائم
setPersistence(auth, browserLocalPersistence);

// وظيفة تحويل الأرقام للهندية (١ ٢ ٣)
const toArabicNum = (n) => n.toString().replace(/\d/g, d => "٠١٢٣٤٥٦٧٨٩"[d]);

export { auth, db, doc, setDoc, getDoc, updateDoc, collection, addDoc, query, where, getDocs, serverTimestamp, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, onAuthStateChanged, toArabicNum };
