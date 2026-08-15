import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCSwNiOHDC0m6zoBx_BeAGyaE33Zmhuvi4",
    authDomain: "hazoma-60ed2.firebaseapp.com",
    projectId: "hazoma-60ed2",
    storageBucket: "hazoma-60ed2.firebasestorage.app",
    messagingSenderId: "962438384604",
    appId: "1:962438384604:web:52db16e5723a8f6d3bdd19"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
