// ======================================
// RIO MAGGI POINT
// FIREBASE CONFIG
// FIREBASE-CONFIG.JS
// CENTRAL FIREBASE INITIALIZATION
// ======================================


// ======================================
// FIREBASE SDK IMPORTS
// ======================================

import {
    initializeApp,
    getApps,
    getApp
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";

import {
    getAuth
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";


// ======================================
// FIREBASE CONFIGURATION
// ======================================

const firebaseConfig = {

    apiKey:
        "AIzaSyB5ZmPaMW17YnUod48QhHXwS8it6XDB70",

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
// FIREBASE APP INITIALIZATION
// ======================================
// Prevent duplicate Firebase initialization.
// This file is the single central Firebase
// initialization point for the entire website.
// ======================================

const app = getApps().length > 0
    ? getApp()
    : initializeApp(firebaseConfig);


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
// EXPORTS
// ======================================
// All pages should import Firebase services
// from this file instead of initializing Firebase
// again.
// ======================================

export {

    app,

    auth,

    db,

    firebaseConfig

};


// ======================================
// FIREBASE CONFIG READY
// ======================================

console.log(
    "✅ RIO MAGGI POINT - FIREBASE CONFIG READY"
);

console.log(
    "✅ Firebase App Ready"
);

console.log(
    "✅ Firebase Auth Ready"
);

console.log(
    "✅ Firestore Database Ready"
);


// ======================================
// END OF FIREBASE-CONFIG.JS
// ======================================
