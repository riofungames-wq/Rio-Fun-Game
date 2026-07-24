// ======================================
// RIO LOYALTY CLUB
// DASHBOARD
// FINAL VERSION
// PART 1
// ======================================

// ---------- Elements ----------

const customerName = document.getElementById("customerName");
const memberId = document.getElementById("memberId");
const customerAvatar = document.getElementById("customerAvatar");

const infoName = document.getElementById("infoName");
const infoEmail = document.getElementById("infoEmail");
const infoMobile = document.getElementById("infoMobile");
const infoGender = document.getElementById("infoGender");
const infoStatus = document.getElementById("infoStatus");

const rewardStatus = document.getElementById("rewardStatus");

const logoutBtn = document.getElementById("logoutBtn");

// ---------- Stamp Boxes ----------

const stamps = [

document.getElementById("stamp1"),

document.getElementById("stamp2"),

document.getElementById("stamp3"),

document.getElementById("stamp4"),

document.getElementById("stamp5"),

document.getElementById("stamp6")

];

// ======================================
// WAIT FOR FIREBASE DATA
// ======================================

window.addEventListener("dashboard-ready", () => {

const user = window.currentUser;

if (!user) return;

// Header

customerName.textContent = user.name;

memberId.textContent = "Member ID : " + user.memberId;

// Profile

if (user.avatar) {

customerAvatar.src = user.avatar;

}

// Member Details

infoName.textContent = user.name;

infoEmail.textContent = user.email;

infoMobile.textContent = user.mobile;

infoGender.textContent = user.gender;

infoStatus.textContent = user.status || "Active";

// Stamp Update

updateStamps(user.stamps || 0);

});
// ======================================
// PART 2
// STAMP SYSTEM
// ======================================

function updateStamps(totalStamps){

// Reset All

stamps.forEach(box=>{

box.classList.remove("active");

});

// Fill Active Stamps

for(let i=0;i<totalStamps && i<6;i++){

stamps[i].classList.add("active");

}

// Reward Message

if(totalStamps>=6){

rewardStatus.innerHTML=

`
🎉 <b>Congratulations!</b><br>

You earned

<b>1 FREE Veg Maggi 🍜</b>

`;

}else{

const remaining = 6-totalStamps;

rewardStatus.innerHTML=

`
You have <b>${totalStamps}</b>
stamp${totalStamps===1?"":"s"}.

<br><br>

Collect

<b>${remaining}</b>

more stamp${remaining===1?"":"s"}

to get

<b>1 FREE Veg Maggi 🍜</b>

`;

}

}
// ======================================
// PART 3
// LOGOUT
// ======================================

logoutBtn.addEventListener("click", async () => {

    const confirmLogout = confirm(
        "Are you sure you want to logout?"
    );

    if (!confirmLogout) return;

    try {

        // Firebase Logout

        const {
            getAuth,
            signOut
        } = await import(
            "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js"
        );

        const auth = getAuth();

        await signOut(auth);

        // Clear Global Data

        window.currentUser = null;

        sessionStorage.removeItem("rioLoggedIn");

        // Redirect

        window.location.replace("login.html");

    }

    catch(error){

        console.error("Logout Error :", error);

        alert("Logout failed. Please try again.");

    }

});

// ======================================
// END OF FILE
// ======================================
