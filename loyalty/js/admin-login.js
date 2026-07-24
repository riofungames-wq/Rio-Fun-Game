// ======================================
// RIO LOYALTY CLUB
// ADMIN LOGIN
// PART 1
// ======================================

// ---------- Elements ----------

const adminForm = document.getElementById("adminLoginForm");

const adminEmail = document.getElementById("adminEmail");

const adminPassword = document.getElementById("adminPassword");

const loginBtn = document.getElementById("loginBtn");

const loginError = document.getElementById("loginError");

const togglePassword = document.getElementById("togglePassword");

// ======================================
// PASSWORD SHOW / HIDE
// ======================================

togglePassword.addEventListener("click", () => {

    if (adminPassword.type === "password") {

        adminPassword.type = "text";

        togglePassword.innerHTML =
        '<i class="fa-solid fa-eye-slash"></i>';

    } else {

        adminPassword.type = "password";

        togglePassword.innerHTML =
        '<i class="fa-solid fa-eye"></i>';

    }

});

// ======================================
// RESET ERROR
// ======================================

function hideError(){

    loginError.style.display = "none";

    loginError.textContent = "";

}
// ======================================
// PART 2
// FORM VALIDATION
// ======================================

adminForm.addEventListener("submit", (event) => {

    event.preventDefault();

    hideError();

    const email = adminEmail.value.trim();

    const password = adminPassword.value.trim();

    if (email === "" || password === "") {

        loginError.style.display = "block";

        loginError.textContent =
        "Please enter Email and Password.";

        return;

    }

    // Disable Login Button

    loginBtn.disabled = true;

    loginBtn.innerHTML =
    '<i class="fa-solid fa-spinner fa-spin"></i> Logging In...';

    // Send Data to Firebase

    window.adminLoginData = {

        email: email,

        password: password

    };

    document.dispatchEvent(

        new CustomEvent("admin-login-ready")

    );

});

// ======================================
// ENABLE LOGIN BUTTON
// ======================================

function enableLoginButton(){

    loginBtn.disabled = false;

    loginBtn.innerHTML =
    '<i class="fa-solid fa-lock"></i> Admin Login';

}
// ======================================
// PART 3
// LOGIN RESULT HELPERS
// ======================================

// Show Error

function showError(message){

    loginError.style.display = "block";

    loginError.textContent = message;

    enableLoginButton();

}

// Login Success

function loginSuccess(){

    loginBtn.innerHTML =
    '<i class="fa-solid fa-circle-check"></i> Login Successful';

}

// Make Functions Global
// Firebase File इन्हें Use करेगी

window.showAdminError = showError;

window.enableAdminLoginButton = enableLoginButton;

window.adminLoginSuccess = loginSuccess;

// ======================================
// END OF FILE
// ======================================
