// ======================================
// RIO LOYALTY CLUB
// DASHBOARD
// PART 1
// ======================================

// ---------- Elements ----------

const customerName = document.getElementById("customerName");

const memberId = document.getElementById("memberId");

const customerAvatar = document.getElementById("customerAvatar");

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
// Load User Data
// ======================================

window.addEventListener("load",()=>{

const user = window.currentUser;

if(!user){

alert("Please login first.");

window.location.href="login.html";

return;

}

customerName.textContent=user.name;

memberId.textContent="Member ID : " + user.memberId;

if(user.avatar){

customerAvatar.src=user.avatar;

}

updateStamps(user.stamps || 0);

});
// ======================================
// PART 2
// STAMP SYSTEM
// ======================================

function updateStamps(totalStamps){

// Reset

stamps.forEach(box=>{

box.classList.remove("active");

});

// Fill Stamps

for(let i=0;i<totalStamps && i<6;i++){

stamps[i].classList.add("active");

}

// Reward Status

if(totalStamps>=6){

rewardStatus.innerHTML=

"🎉 Congratulations!<br><strong>You have earned 1 FREE Veg Maggi.</strong>";

}else{

rewardStatus.innerHTML=

`You have <strong>${totalStamps}</strong> stamp${totalStamps===1?"":"s"}.

<br>

Collect <strong>${6-totalStamps}</strong> more to get

<strong>1 FREE Veg Maggi</strong>.`;

}

}
// ======================================
// PART 3
// LOGOUT
// ======================================

logoutBtn.addEventListener("click", async () => {

    const confirmLogout = confirm("Are you sure you want to logout?");

    if (!confirmLogout) return;

    try {

        // Firebase Auth Logout
        const { getAuth, signOut } = await import(
            "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js"
        );

        const auth = getAuth();

        await signOut(auth);

        // Clear Session
        sessionStorage.removeItem("rioLoggedIn");
        window.currentUser = null;

        // Redirect
        window.location.href = "login.html";

    } catch (error) {

        console.error("Logout Error:", error);

        alert("Logout failed. Please try again.");

    }

});

// ======================================
// END OF FILE
// ======================================

