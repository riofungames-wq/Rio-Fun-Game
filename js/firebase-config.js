import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyS5ZmPaMW17YnUOvd48QhHXwS8it6XDB70",
    authDomain: "rio-maggi-point.firebaseapp.com",
    projectId: "rio-maggi-point",
    storageBucket: "rio-maggi-point.firebasestorage.app",
    messagingSenderId: "472858143171",
    appId: "1:472858143171:web:15cfb0b8de9cd25b957576"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
