// ======================================
// RIO MAGGI POINT
// FIREBASE CORE
// FIREBASE.JS - FINAL FIXED VERSION
// ======================================


// ======================================
// FIREBASE CONFIG
// ======================================

import { firebaseConfig } from "./firebase-config.js";


// ======================================
// FIREBASE APP
// ======================================

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";


// ======================================
// FIREBASE AUTH
// ======================================

import {
    getAuth
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";


// ======================================
// FIRESTORE
// ======================================

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";


// ======================================
// INITIALIZE FIREBASE
// ======================================

const app = initializeApp(
    firebaseConfig
);


// ======================================
// INITIALIZE AUTH
// ======================================

const auth = getAuth(
    app
);


// ======================================
// INITIALIZE FIRESTORE
// ======================================

const db = getFirestore(
    app
);


// ======================================
// GLOBAL FIREBASE REFERENCES
// ======================================

window.rioFirebaseApp = app;

window.rioFirebaseAuth = auth;

window.rioFirebaseDB = db;


// ======================================
// EXPORT FIREBASE REFERENCES
// ======================================

export {
    app,
    auth,
    db
};


// ======================================
// FIREBASE READY
// ======================================

console.log(
    "🔥 Rio Maggi Point Firebase initialized successfully."
);


// ======================================
// END OF FIREBASE.JS
// ======================================
