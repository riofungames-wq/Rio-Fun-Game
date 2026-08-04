// ======================================
// RIO MAGGI POINT
// CENTRAL FIREBASE INITIALIZATION
// FIREBASE.JS - FINAL
// ======================================


// ======================================
// FIREBASE APP
// ======================================

import {
    initializeApp,
    getApps,
    getApp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";


// ======================================
// FIREBASE AUTH
// ======================================

import {
    getAuth
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


// ======================================
// FIREBASE FIRESTORE
// ======================================

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ======================================
// CENTRAL FIREBASE CONFIG
// ======================================

import {
    firebaseConfig
} from "./firebase-config.js";


// ======================================
// FIREBASE APP INITIALIZATION
// PREVENT DUPLICATE INITIALIZATION
// ======================================

const app = getApps().length
    ? getApp()
    : initializeApp(firebaseConfig);


// ======================================
// FIREBASE AUTH INITIALIZATION
// ======================================

const auth = getAuth(app);


// ======================================
// FIRESTORE INITIALIZATION
// ======================================

const db = getFirestore(app);


// ======================================
// CENTRAL EXPORTS
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
    "RIO MAGGI POINT - FIREBASE READY"
);


// ======================================
// END OF FIREBASE.JS
// ======================================
