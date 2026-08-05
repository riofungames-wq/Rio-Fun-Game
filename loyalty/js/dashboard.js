// ======================================
// RIO LOYALTY CLUB
// DASHBOARD
// FINAL FIXED VERSION
// ======================================


// ======================================
// FIREBASE AUTH IMPORT
// ======================================

import {
    auth
} from "./firebase-config.js";


import {
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";




// ======================================
// ELEMENTS
// ======================================

const customerName =
document.getElementById("customerName");


const memberId =
document.getElementById("memberId");


const customerAvatar =
document.getElementById("customerAvatar");


const infoName =
document.getElementById("infoName");


const infoEmail =
document.getElementById("infoEmail");


const infoMobile =
document.getElementById("infoMobile");


const infoGender =
document.getElementById("infoGender");


const infoStatus =
document.getElementById("infoStatus");


const rewardStatus =
document.getElementById("rewardStatus");


const logoutBtn =
document.getElementById("logoutBtn");




// ======================================
// STAMP BOXES
// ======================================

const stamps = [

    document.getElementById("stamp1"),
    document.getElementById("stamp2"),
    document.getElementById("stamp3"),
    document.getElementById("stamp4"),
    document.getElementById("stamp5"),
    document.getElementById("stamp6")

];




// ======================================
// LOAD CUSTOMER DATA
// ======================================

window.addEventListener(
"dashboard-ready",
()=>{


    const user =
    window.currentUser;


    if(!user)
        return;




    if(customerName){

        customerName.textContent =
        user.name || "Customer";

    }



    if(memberId){

        memberId.textContent =
        "Member ID : "
        +
        (
            user.memberId ||
            "RIO-000000"
        );

    }




    if(customerAvatar){

        customerAvatar.src =

        user.avatar
        ||
        user.photoURL
        ||
        "assets/avatars/default.png";

    }




    if(infoName){

        infoName.textContent =
        user.name || "-";

    }




    if(infoEmail){

        infoEmail.textContent =
        user.email || "-";

    }




    if(infoMobile){

        infoMobile.textContent =
        user.mobile
        ||
        user.phone
        ||
        "-";

    }




    if(infoGender){

        infoGender.textContent =
        user.gender || "-";

    }




    if(infoStatus){

        infoStatus.textContent =
        user.status
        ||
        "Active";

    }




    updateStamps(
        Number(user.stamps || 0)
    );


});




// ======================================
// STAMP UPDATE SYSTEM
// ======================================

function updateStamps(totalStamps){


    stamps.forEach(box=>{

        if(box){

            box.classList.remove(
                "active"
            );

        }

    });



    for(
        let i=0;
        i<totalStamps && i<6;
        i++
    ){

        if(stamps[i]){

            stamps[i].classList.add(
                "active"
            );

        }

    }




    if(!rewardStatus)
        return;



    if(totalStamps >= 6){


        rewardStatus.innerHTML = `

        🎉 <b>Congratulations!</b>

        <br><br>

        You earned

        <br>

        <b>1 FREE Veg Maggi 🍜</b>

        `;


    }
    else{


        const remaining =
        6-totalStamps;



        rewardStatus.innerHTML = `

        You have

        <b>${totalStamps}</b>

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
// LOGOUT
// ======================================

if(logoutBtn){


logoutBtn.addEventListener(
"click",
async()=>{


    const confirmLogout =
    confirm(
    "Are you sure you want to logout?"
    );


    if(!confirmLogout)
        return;



    try{


        await signOut(auth);



        window.currentUser = null;



        sessionStorage.removeItem(
            "rioLoggedIn"
        );



        window.location.replace(
            "login.html"
        );


    }
    catch(error){


        console.error(
            "Logout Error:",
            error
        );


        alert(
        "Logout failed. Please try again."
        );


    }


});


}




console.log(
"🍜 Rio Dashboard JS Loaded"
);
