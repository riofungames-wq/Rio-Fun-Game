// =====================================================
// RIO MAGGI POINT
// PREMIUM ADMIN LOGIN
// FIREBASE READY
// PART 1
// =====================================================


import { auth } from "./firebase-config.js";


import {

signInWithEmailAndPassword

}

from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";



// =====================================================
// ELEMENTS
// =====================================================


const loginForm =

document.getElementById("adminLoginForm");



const emailInput =

document.getElementById("adminEmail");



const passwordInput =

document.getElementById("adminPassword");



const loginBtn =

document.getElementById("loginBtn");



const togglePassword =

document.getElementById("togglePassword");



const loginError =

document.getElementById("loginError");



// =====================================================
// PASSWORD SHOW / HIDE
// =====================================================


togglePassword?.addEventListener("click",()=>{


if(passwordInput.type==="password"){


passwordInput.type="text";


togglePassword.innerHTML=

`<i class="fa-solid fa-eye-slash"></i>`;


}

else{


passwordInput.type="password";


togglePassword.innerHTML=

`<i class="fa-solid fa-eye"></i>`;


}


});



// =====================================================
// ERROR MESSAGE
// =====================================================


function showError(message){


loginError.textContent=message;


loginError.style.display="block";


}



function hideError(){


loginError.textContent="";


loginError.style.display="none";


}



// =====================================================
// LOGIN SUBMIT
// =====================================================


loginForm?.addEventListener("submit",async(e)=>{


e.preventDefault();


hideError();


const email =

emailInput.value.trim();



const password =

passwordInput.value;



if(!email || !password){


showError(

"Please enter email and password"

);


return;


}



loginBtn.disabled=true;


loginBtn.innerHTML=

`

<i class="fa-solid fa-spinner fa-spin"></i>

Checking...

`;



try{


await signInWithEmailAndPassword(

auth,

email,

password

);


console.log(

"Admin Login Successful"

);



location.href=

"admin-dashboard.html";



}

catch(error){


console.error(error);



showError(

"Invalid Email or Password"

);



loginBtn.disabled=false;



loginBtn.innerHTML=

`

<i class="fa-solid fa-right-to-bracket"></i>

Login Dashboard

`;



}


});
// =====================================================
// AUTH SESSION CHECK
// =====================================================


auth.onAuthStateChanged?.((user)=>{


if(user){


console.log(
"Admin Session Active:",
user.email
);


}


});



// =====================================================
// ENTER KEY SUPPORT
// =====================================================


passwordInput?.addEventListener(

"keypress",

(e)=>{


if(e.key==="Enter"){


loginForm.requestSubmit();


}


}

);



// =====================================================
// PAGE READY
// =====================================================


console.log("================================");

console.log("🍜 Rio Maggi Point");

console.log("Premium Admin Login Ready");

console.log("Firebase Authentication Connected");

console.log("================================");
