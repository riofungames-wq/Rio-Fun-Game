// ======================================
// RIO MAGGI POINT
// DASHBOARD.JS
// FINAL FIXED LOYALTY VERSION
// ======================================


// ======================================
// IMPORTS
// ======================================

import {
    auth
} from "./firebase-config.js";


import {
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";



// ======================================
// CONSTANTS
// ======================================

const REWARD_STAMP_LIMIT = 6;



// ======================================
// DOM ELEMENTS
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



const stamps = [

    document.getElementById("stamp1"),
    document.getElementById("stamp2"),
    document.getElementById("stamp3"),
    document.getElementById("stamp4"),
    document.getElementById("stamp5"),
    document.getElementById("stamp6")

];




// ======================================
// RENDER CUSTOMER DATA
// ======================================

function renderCustomer(customer){


    if(!customer)

        return;



    if(customerName)

        customerName.textContent =
        customer.name || "Customer";



    if(memberId)

        memberId.textContent =
        "Member ID : " +
        (
            customer.memberId ||
            "RIO-000000"
        );



    if(customerAvatar)

        customerAvatar.src =
        customer.avatar ||
        customer.photoURL ||
        "assets/avatars/default.png";



    if(infoName)

        infoName.textContent =
        customer.name || "-";



    if(infoEmail)

        infoEmail.textContent =
        customer.email || "-";



    if(infoMobile)

        infoMobile.textContent =
        customer.mobile ||
        customer.phone ||
        "-";



    if(infoGender)

        infoGender.textContent =
        customer.gender || "-";



    if(infoStatus)

        infoStatus.textContent =
        customer.status ||
        "Active";



    // 40 DAY RESET CHECK
    const stampCount =
    customer.cycleReset
    ? 0
    : Number(customer.stamps || 0);



    updateStamps(
        stampCount,
        customer.rewardClaimed === true
    );

}



// ======================================
// UPDATE STAMP DISPLAY
// ======================================

function updateStamps(
    count,
    rewardClaimed = false
){


    const total = Math.min(

        Math.max(
            Number(count) || 0,
            0
        ),

        REWARD_STAMP_LIMIT

    );



    stamps.forEach(
        box=>{

            if(box)

                box.classList.remove(
                    "active"
                );

        }
    );



    for(
        let i = 0;
        i < total;
        i++
    ){

        if(stamps[i])

            stamps[i].classList.add(
                "active"
            );

    }



    updateRewardStatus(
        total,
        rewardClaimed
    );

}



// ======================================
// REWARD STATUS
// ======================================

function updateRewardStatus(
    stampCount,
    rewardClaimed
){


    if(!rewardStatus)

        return;



    // Reward already consumed

    if(rewardClaimed){


        rewardStatus.innerHTML = `

        Reward already claimed.

        <br><br>

        Start collecting stamps again

        🍜

        `;


        return;

    }




    if(
        stampCount >= REWARD_STAMP_LIMIT
    ){


        rewardStatus.innerHTML = `

        🎉 Congratulations!

        <br><br>

        Your reward is unlocked.

        <br>

        <strong>
        FREE Veg Maggi 🍜
        </strong>

        `;


        return;

    }



    const remaining =
    REWARD_STAMP_LIMIT - stampCount;



    rewardStatus.innerHTML = `

    You have

    <strong>
    ${stampCount}
    </strong>

    stamp${stampCount === 1 ? "" : "s"}

    <br><br>

    Collect

    <strong>
    ${remaining}
    </strong>

    more stamp${remaining === 1 ? "" : "s"}

    to get

    <strong>
    FREE Veg Maggi 🍜
    </strong>

    `;


}





// ======================================
// DASHBOARD DATA EVENT
// ======================================

window.addEventListener(

"dashboard-ready",

()=>{


    const customer =
    window.currentUser;



    if(!customer)

        return;



    renderCustomer(customer);


}

);




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



            sessionStorage.clear();



            window.currentUser =
            null;



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




// ======================================
// EXPORT
// ======================================

window.updateDashboardStamps =
updateStamps;



console.log(
"🍜 Rio Dashboard.js Final Loyalty Loaded"
);
