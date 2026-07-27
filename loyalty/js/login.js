// =====================================================
// RIO MAGGI POINT
// LOGIN.JS
// PART 1
// =====================================================

import { auth, db } from "./firebase-config.js";

import {
    signInWithEmailAndPassword,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// =====================================================
// ELEMENTS
// =====================================================

const loginForm =
document.getElementById("loginForm");

const email =
document.getElementById("email");

const password =
document.getElementById("password");

const loginBtn =
document.getElementById("loginBtn");

// =====================================================
// AUTO LOGIN
// =====================================================

onAuthStateChanged(auth, async(user)=>{

    if(!user) return;

    try{

        const customerRef =
        doc(db,"customers",user.uid);

        const customerSnap =
        await getDoc(customerRef);

        if(customerSnap.exists()){

            window.location.href =
            "card.html";

        }

    }

    catch(error){

        console.error(error);

    }

});

// =====================================================
// LOGIN
// =====================================================

loginForm.addEventListener("submit", async(e)=>{

    e.preventDefault();

    const userEmail =
    email.value.trim();

    const userPassword =
    password.value;

    if(!userEmail || !userPassword){

        alert("Please Fill All Fields");

        return;

    }

    loginBtn.disabled = true;

    loginBtn.innerHTML = "Signing In...";
      try{

        const credential =

        await signInWithEmailAndPassword(

            auth,

            userEmail,

            userPassword

        );

        const uid = credential.user.uid;

        const customerRef =

        doc(db,"customers",uid);

        const customerSnap =

        await getDoc(customerRef);

        if(!customerSnap.exists()){

            alert("Customer Record Not Found");

            loginBtn.disabled = false;

            loginBtn.innerHTML = "Login";

            return;

        }

        const customer =

        customerSnap.data();

        // =====================================
        // OPTIONAL ACCOUNT CHECK
        // =====================================

        if(customer.status === "blocked"){

            alert("Your Account Has Been Blocked.");

            loginBtn.disabled = false;

            loginBtn.innerHTML = "Login";

            return;

        }

        // =====================================
        // SUCCESS
        // =====================================

        alert(

            `Welcome ${customer.name}!`

        );

        window.location.href =

        "card.html";

    }

    catch(error){

        console.error(error);

        let message =

        "Login Failed";

        switch(error.code){

            case "auth/invalid-credential":

                message =

                "Invalid Email Or Password";

                break;

            case "auth/user-disabled":

                message =

                "Account Disabled";

                break;

            case "auth/too-many-requests":

                message =

                "Too Many Attempts. Try Again Later.";

                break;

        }

        alert(message);
          finally{

        loginBtn.disabled = false;

        loginBtn.innerHTML = "Login";

    }

});

// =====================================================
// PASSWORD SHOW / HIDE
// =====================================================

const togglePassword =
document.getElementById("togglePassword");

if(togglePassword){

    togglePassword.addEventListener("click",()=>{

        if(password.type==="password"){

            password.type="text";

            togglePassword.classList.remove("fa-eye");

            togglePassword.classList.add("fa-eye-slash");

        }

        else{

            password.type="password";

            togglePassword.classList.remove("fa-eye-slash");

            togglePassword.classList.add("fa-eye");

        }

    });

}

// =====================================================
// FORGOT PASSWORD
// =====================================================

const forgotPassword =
document.getElementById("forgotPassword");

if(forgotPassword){

    forgotPassword.addEventListener("click",(e)=>{

        e.preventDefault();

        window.location.href="forgot-password.html";

    });

}

// =====================================================
// READY
// =====================================================

console.log("================================");

console.log("🍜 Rio Maggi Point");

console.log("Login Ready");

console.log("================================");
