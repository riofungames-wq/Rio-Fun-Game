import {
    auth,
    db,
    redirectIfLoggedIn
} from "../app.js";

import {
    signInWithEmailAndPassword,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const togglePassword = document.getElementById("togglePassword");
const forgotPassword = document.getElementById("forgotPassword");

function setLoading(loading) {
    if (!loginBtn) return;

    loginBtn.disabled = loading;

    loginBtn.innerHTML = loading
        ? `<i class="fa-solid fa-spinner fa-spin"></i>&nbsp; Signing In...`
        : `<i class="fa-solid fa-right-to-bracket"></i>&nbsp; Login`;
}


// AUTO LOGIN
redirectIfLoggedIn("card.html");


// LOGIN
loginForm?.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email = emailInput?.value.trim();
    const password = passwordInput?.value;

    if (!email || !password) {
        alert("Please enter Email and Password.");
        return;
    }

    setLoading(true);

    try {

        const credential =
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

        const user = credential.user;

        const customerRef =
            doc(db, "customers", user.uid);

        const customerSnap =
            await getDoc(customerRef);

        if (!customerSnap.exists()) {
            alert(
                "Customer record not found. Please contact Rio Maggi Point."
            );

            return;
        }

        const customer = customerSnap.data();

        if (customer.status === "blocked") {
            alert("Your account has been blocked.");
            return;
        }

        if (customer.status === "suspended") {
            alert("Your account has been suspended.");
            return;
        }

        window.currentUser = customer;
        window.currentRioUser = user;

        window.location.href = "card.html";

    } catch (error) {

        console.error("Login Error:", error);

        const messages = {
            "auth/invalid-credential":
                "Invalid Email or Password.",

            "auth/user-not-found":
                "No account found with this email.",

            "auth/wrong-password":
                "Invalid Email or Password.",

            "auth/user-disabled":
                "This account has been disabled.",

            "auth/too-many-requests":
                "Too many login attempts. Please try again later.",

            "auth/network-request-failed":
                "No Internet Connection.",

            "auth/invalid-email":
                "Invalid Email Address."
        };

        alert(
            messages[error.code] ||
            "Login Failed. Please try again."
        );

    } finally {

        setLoading(false);

    }

});


// PASSWORD SHOW / HIDE
togglePassword?.addEventListener("click", () => {

    const isPassword =
        passwordInput.type === "password";

    passwordInput.type =
        isPassword ? "text" : "password";

    togglePassword.innerHTML =
        isPassword
            ? `<i class="fa-solid fa-eye-slash"></i>`
            : `<i class="fa-solid fa-eye"></i>`;

});


// FORGOT PASSWORD
forgotPassword?.addEventListener("click", async (e) => {

    e.preventDefault();

    const email = emailInput?.value.trim();

    if (!email) {
        alert("Please enter your email address first.");
        emailInput?.focus();
        return;
    }

    try {

        await sendPasswordResetEmail(
            auth,
            email
        );

        alert(
            "Password reset email sent. Please check your inbox."
        );

    } catch (error) {

        console.error(
            "Password Reset Error:",
            error
        );

        alert(
            error.code === "auth/user-not-found"
                ? "No account found with this email."
                : "Unable to send password reset email."
        );

    }

});


console.log(
    "Rio Maggi Point - Login Ready"
);
