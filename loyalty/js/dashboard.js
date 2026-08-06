// ======================================
// RIO MAGGI POINT
// DASHBOARD.JS
// CLEAN CUSTOMER UI CONTROLLER
// ======================================


import { auth } from "./firebase-config.js";

import {
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";



// ======================================
// CONSTANT
// ======================================

const STAMP_LIMIT = 6;



// ======================================
// DOM
// ======================================

const $ = (id)=>document.getElementById(id);



const customerName = $("customerName");
const memberId = $("memberId");
const customerAvatar = $("customerAvatar");

const infoName = $("infoName");
const infoEmail = $("infoEmail");
const infoMobile = $("infoMobile");
const infoGender = $("infoGender");
const infoStatus = $("infoStatus");

const rewardStatus = $("rewardStatus");

const logoutBtn = $("logoutBtn");



const stampBoxes = [

    $("stamp1"),
    $("stamp2"),
    $("stamp3"),
    $("stamp4"),
    $("stamp5"),
    $("stamp6")

];




// ======================================
// LOAD CUSTOMER UI
// ======================================


function loadCustomer(customer){

    if(!customer) return;



    setText(
        customerName,
        customer.name || "Rio Member"
    );


    setText(
        memberId,
        `Member ID : ${customer.memberId || "RIO-000000"}`
    );



    if(customerAvatar){

        customerAvatar.src =
        customer.avatar ||
        customer.photoURL ||
        "assets/avatars/default.png";

    }



    setText(
        infoName,
        customer.name || "-"
    );


    setText(
        infoEmail,
        customer.email || "-"
    );


    setText(
        infoMobile,
        customer.mobile ||
        customer.phone ||
        "-"
    );


    setText(
        infoGender,
        customer.gender || "-"
    );


    setText(
        infoStatus,
        customer.status || "Active"
    );



    const stamps =
    customer.cycleReset
    ? 0
    : Number(customer.stamps || 0);



    updateStampUI(
        stamps,
        customer.rewardClaimed
    );

}





// ======================================
// TEXT HELPER
// ======================================


function setText(element,value){

    if(element){

        element.textContent = value;

    }

}



// ======================================
// STAMP UI
// ======================================


function updateStampUI(
    count = 0,
    rewardClaimed = false
){


    let total = Math.min(
        Math.max(
            Number(count) || 0,
            0
        ),
        STAMP_LIMIT
    );



    stampBoxes.forEach(
        box=>{

            if(box){

                box.classList.remove(
                    "active",
                    "reward"
                );

            }

        }
    );



    for(
        let i=0;
        i<total;
        i++
    ){

        if(stampBoxes[i]){

            stampBoxes[i]
            .classList
            .add("active");

        }

    }



    if(
        total >= STAMP_LIMIT &&
        stampBoxes[5]
    ){

        stampBoxes[5]
        .classList
        .add("reward");

    }



    updateReward(
        total,
        rewardClaimed
    );

}





// ======================================
// REWARD MESSAGE
// ======================================


function updateReward(
    stamps,
    claimed
){


    if(!rewardStatus)
        return;



    if(claimed){


        rewardStatus.innerHTML =

        `
        Reward Claimed 🍜
        <br>
        Start collecting again.
        `;


        return;

    }



    if(stamps >= STAMP_LIMIT){


        rewardStatus.innerHTML =

        `
        🎉 Reward Unlocked
        <br>
        <strong>
        FREE Veg Maggi 🍜
        </strong>
        `;


        return;

    }



    const remaining =
    STAMP_LIMIT - stamps;



    rewardStatus.innerHTML =

    `
    Collect 
    <strong>
    ${remaining}
    </strong>
    more stamps
    <br>
    to get
    <strong>
    FREE Veg Maggi 🍜
    </strong>
    `;


}




// ======================================
// DASHBOARD EVENT
// ======================================


window.addEventListener(
    "dashboard-ready",
    ()=>{

        loadCustomer(
            window.currentUser
        );

    }
);





// ======================================
// LOGOUT
// ======================================


if(logoutBtn){


    logoutBtn.addEventListener(
        "click",
        async()=>{


            const ok =
            confirm(
            "Logout from Rio Maggi Point?"
            );


            if(!ok)
                return;



            try{


                await signOut(auth);


                sessionStorage.clear();


                window.currentUser=null;


                location.href="login.html";


            }
            catch(error){


                console.error(
                    "Logout Error",
                    error
                );


                alert(
                "Logout failed"
                );


            }


        }
    );


}





// ======================================
// GLOBAL ACCESS
// ======================================


window.updateDashboardStamps =
updateStampUI;



console.log(
"🍜 Rio Dashboard UI Loaded"
);
