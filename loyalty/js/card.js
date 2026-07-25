// ==========================================
// RIO MAGGI POINT
// PREMIUM LOYALTY CARD
// card.js
// ==========================================

import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// ==========================================
// HTML ELEMENTS
// ==========================================

const loyaltyCard =
document.getElementById("loyaltyCard");

const customerPhoto =
document.getElementById("customerPhoto");

const customerName =
document.getElementById("customerName");

const memberId =
document.getElementById("memberId");

const ownerName =
document.querySelector(".owner-name");

const ownerNumber =
document.getElementById("ownerNumber");

const countdown =
document.getElementById("countdown");

const rewardStamp =
document.querySelector(".reward-stamp");

const playBtn =
document.getElementById("playGameBtn");

// ==========================================
// LOGIN
// ==========================================

onAuthStateChanged(auth, async(user)=>{

    if(!user){

        window.location.href="login.html";

        return;

    }

    await loadCustomer(user.uid);

});

// ==========================================
// LOAD CUSTOMER
// ==========================================

async function loadCustomer(uid){

    try{

        const ref=
        doc(db,"customers",uid);

        const snap=
        await getDoc(ref);

        if(!snap.exists()){

            console.log("Customer Not Found");

            return;

        }

        const data=
        snap.data();

        // ==================================
        // OWNER NAME
        // ==================================

        if(ownerName){

            ownerName.textContent=
            data.name || "Member";

        }

        // ==================================
        // CUSTOMER NAME
        // ==================================

        customerName.textContent=
        data.name || "Customer";

        // ==================================
        // MEMBER ID
        // ==================================

        memberId.textContent=
        "ID : " +
        (data.memberId || "------");

        // ==================================
        // MOBILE
        // ==================================

        ownerNumber.textContent=
        data.mobile || "";

        // ==================================
        // CARD THEME
        // ==================================

        loyaltyCard.classList.remove(

            "theme-male",
            "theme-female"

        );

        if(data.gender==="female"){

            loyaltyCard.classList.add(

                "theme-female"

            );

        }

        else{

            loyaltyCard.classList.add(

                "theme-male"

            );

        }

        // ==================================
        // CUSTOMER PHOTO
        // ==================================

        if(

            data.photoURL &&
            data.photoURL!=="" 

        ){

            customerPhoto.src=
            data.photoURL;

        }

        else{

            if(data.gender==="female"){

                customerPhoto.src=
                "assets/avatars/female.png";

            }

            else{

                customerPhoto.src=
                "assets/avatars/male.png";

            }

        }
              // ==================================
        // STAMP DATES
        // ==================================

        for(let i=1;i<=6;i++){

            const el=
            document.getElementById("date"+i);

            if(el){

                el.textContent=
                data["stamp"+i] || "";

            }

        }

        // ==================================
        // TOTAL STAMP
        // ==================================

        const totalStamp=
        Number(data.totalStamp || 0);

        if(rewardStamp){

            if(totalStamp>=6){

                rewardStamp.style.opacity="1";

                rewardStamp.style.filter=
                "drop-shadow(0 0 8px gold)";

            }

            else{

                rewardStamp.style.opacity=".45";

                rewardStamp.style.filter="none";

            }

        }

        // ==================================
        // COUNTDOWN
        // ==================================

        if(countdown){

            countdown.textContent=
            data.countdown ?? "--";

        }

    }

    catch(err){

        console.error(

            "Customer Load Error :",

            err

        );

    }

}

// ==========================================
// PLAY GAME
// ==========================================

if(playBtn){

    playBtn.addEventListener("click",()=>{

        window.location.href=

        "https://riofungames-wq.github.io/Rio-Fun-Game/";

    });

}

// ==========================================
// CARD READY
// ==========================================

console.log(

"=================================="

);

console.log(

"RIO MAGGI POINT"

);

console.log(

"Premium Loyalty Card Loaded"

);

console.log(

"=================================="

);
