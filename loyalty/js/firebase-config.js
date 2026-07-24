// ======================================
// RIO LOYALTY CLUB
// FIREBASE CONFIG
// CENTRAL FIREBASE INITIALIZATION
// ======================================

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
    getAuth
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// ======================================
// FIREBASE CONFIG
// ======================================

const firebaseConfig = {

    apiKey:
        "AIzaSyB5ZmPaMW17YnUOvd48qHxhW8sIt6XDB70",

    authDomain:
        "rio-maggi-point.firebaseapp.com",

    projectId:
        "rio-maggi-point",

    storageBucket:
        "rio-maggi-point.firebasestorage.app",

    messagingSenderId:
        "472858143171",

    appId:
        "1:472858143171:web:15cfb0b8de9cd25b957576"

};


// ======================================
// INITIALIZE FIREBASE
// ======================================

const app =
    initializeApp(firebaseConfig);


// ======================================
// FIREBASE AUTH
// ======================================

const auth =
    getAuth(app);


// ======================================
// FIRESTORE DATABASE
// ======================================

const db =
    getFirestore(app);


// ======================================
// EXPORT
// ======================================

export {
    app,
    auth,
    db
};


// ======================================
// STARTUP LOG
// ======================================

console.log(
    "==================================="
);

console.log(
    "RIO MAGGI POINT"
);

console.log(
    "FIREBASE INITIALIZED SUCCESSFULLY"
);

console.log(
    "AUTH READY"
);

console.log(
    "FIRESTORE READY"
);

console.log(
    "==================================="
);
