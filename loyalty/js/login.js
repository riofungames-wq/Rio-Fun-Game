// ======================================
// RIO LOYALTY CLUB
// LOGIN
// PART 1
// ======================================

// ---------- Elements ----------

const loginForm = document.getElementById("loginForm");

const email = document.getElementById("email");

const password = document.getElementById("password");

const rememberMe = document.getElementById("rememberMe");

const togglePassword = document.getElementById("togglePassword");

// ======================================
// Show / Hide Password
// ======================================

togglePassword.addEventListener("click",()=>{

if(password.type==="password"){

password.type="text";

togglePassword.innerHTML=
'<i class="fa-solid fa-eye-slash"></i>';

}else{

password.type="password";

togglePassword.innerHTML=
'<i class="fa-solid fa-eye"></i>';

}

});

// ======================================
// Remember Me
// ======================================

window.addEventListener("load",()=>{

const savedEmail=localStorage.getItem("rioRememberEmail");

if(savedEmail){

email.value=savedEmail;

rememberMe.checked=true;

}

});
// ======================================
// PART 2
// LOGIN VALIDATION
// ======================================

loginForm.addEventListener("submit",(event)=>{

event.preventDefault();

// ---------- Validation ----------

const userEmail=email.value.trim();

const userPassword=password.value.trim();

if(userEmail===""){

alert("Please enter your email.");

return;

}

if(userPassword===""){

alert("Please enter your password.");

return;

}

// ---------- Remember Me ----------

if(rememberMe.checked){

localStorage.setItem(

"rioRememberEmail",

userEmail

);

}else{

localStorage.removeItem(

"rioRememberEmail"

);

}

// ---------- Send Data To Firebase ----------

window.loginData={

email:userEmail,

password:userPassword

};

// Trigger Firebase Login

document.dispatchEvent(

new CustomEvent("login-ready")

);

});
// ======================================
// PART 3
// FORGOT PASSWORD + AUTO LOGIN
// ======================================

// ---------- Forgot Password ----------

const forgotPassword = document.getElementById("forgotPassword");

forgotPassword.addEventListener("click",(event)=>{

event.preventDefault();

alert("Forgot Password feature will be added in the next update.");

});

// ======================================
// AUTO LOGIN CHECK
// ======================================

window.addEventListener("load",()=>{

const loggedIn = sessionStorage.getItem("rioLoggedIn");

if(loggedIn==="true"){

window.location.href="dashboard.html";

}

});

// ======================================
// LOGIN SUCCESS
// (Called by login-firebase.js)
// ======================================

window.loginSuccess=function(){

sessionStorage.setItem(

"rioLoggedIn",

"true"

);

window.location.href="dashboard.html";

};
