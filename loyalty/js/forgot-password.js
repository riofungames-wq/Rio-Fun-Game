// =====================================================
// RIO MAGGI POINT
// FORGOT PASSWORD
// PART 1
// =====================================================

import { auth } from "./firebase-config.js";

import {
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

// =====================================================
// ELEMENTS
// =====================================================

const forgotForm =
document.getElementById("forgotForm");

const resetEmail =
document.getElementById("resetEmail");

const resetBtn =
document.getElementById("resetBtn");

const successBox =
document.getElementById("successBox");

const backLoginBtn =
document.getElementById("backLoginBtn");

// =====================================================
// SEND RESET EMAIL
// =====================================================

forgotForm.addEventListener("submit", async(e)=>{

    e.preventDefault();

    const email =
    resetEmail.value.trim();

    if(!email){

        alert("Please Enter Your Email");

        return;

    }

    resetBtn.disabled = true;

    resetBtn.innerHTML =
    "Sending...";

    try{

        await sendPasswordResetEmail(

            auth,

            email

        );

        forgotForm.style.display =
        "none";

        successBox.style.display =
        "block";

    }

    catch(error){

        console.error(error);

        let message =
        "Unable To Send Reset Email";

        switch(error.code){

            case "auth/user-not-found":

                message =
                "No Account Found With This Email";

                break;

            case "auth/invalid-email":

                message =
                "Invalid Email Address";

                break;

            case "auth/too-many-requests":

                message =
                "Too Many Requests. Try Again Later.";

                break;

        }

        alert(message);

    }

    finally{

        resetBtn.disabled = false;

        resetBtn.innerHTML =
        "Send Reset Link";

    }

});
// =====================================================
// BACK TO LOGIN
// =====================================================

backLoginBtn.addEventListener("click",()=>{

    window.location.href="login.html";

});

// =====================================================
// READY
// =====================================================

console.log("================================");

console.log("🍜 Rio Maggi Point");

console.log("Forgot Password Ready");

console.log("================================");
