// ======================================
// RIO MAGGI POINT
// CENTRAL FIREBASE INITIALIZATION
// FIREBASE.JS
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
// FIREBASE CONFIG
// ======================================

import {
    firebaseConfig
} from "./firebase-config.js";


// ======================================
// INITIALIZE FIREBASE APP
// PREVENT DUPLICATE INITIALIZATION
// ======================================

const app = getApps().length > 0
    ? getApp()
    : initializeApp(firebaseConfig);


// ======================================
// INITIALIZE AUTH
// ======================================

const auth = getAuth(app);


// ======================================
// INITIALIZE FIRESTORE
// ======================================

const db = getFirestore(app);


// ======================================
// EXPORT
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
    "RIO MAGGI POINT - FIREBASE APP READY"
);

console.log(
    "Firebase Auth Ready"
);

console.log(
    "Firebase Firestore Ready"
);


// ======================================
// END OF FIREBASE.JS
// ======================================
