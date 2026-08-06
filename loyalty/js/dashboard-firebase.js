// ======================================
// RIO MAGGI POINT
// DASHBOARD-FIREBASE.JS
// FINAL FIXED LOYALTY VERSION
// ======================================


// ======================================
// IMPORTS
// ======================================

import {
    auth,
    db
} from "./firebase-config.js";


import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


import {
    doc,
    getDoc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";



// ======================================
// CONSTANTS
// ======================================

const STAMP_LIMIT = 6;

const CYCLE_DAYS = 40;



// ======================================
// CHECK CYCLE EXPIRY
// ======================================

function isCycleExpired(customer) {

    if (
        !customer ||
        !customer.cycleStartedAt
    ) {
        return false;
    }


    try {

        const startDate =
            customer.cycleStartedAt.toDate
            ? customer.cycleStartedAt.toDate()
            : new Date(customer.cycleStartedAt);



        const difference =
            Date.now() - startDate.getTime();



        const days =
            difference /
            (1000 * 60 * 60 * 24);



        return days > CYCLE_DAYS;


    } catch(error) {

        console.error(
            "Cycle expiry check error:",
            error
        );

        return false;

    }

}




// ======================================
// AUTO RESET EXPIRED CYCLE
// ======================================

async function resetExpiredCycle(
    customerRef,
    customer
){

    const stamps =
        Number(
            customer.stamps || 0
        );


    if(

        !isCycleExpired(customer)

        ||

        stamps >= STAMP_LIMIT

        ||

        customer.rewardClaimed === true

    ){

        return customer;

    }



    const resetData = {


        stamps:0,


        rewardUnlocked:false,


        rewardClaimed:false,


        lastStampDate:null,


        cycleStartedAt:
            serverTimestamp(),


        updatedAt:
            serverTimestamp()

    };




    try {


        await updateDoc(
            customerRef,
            resetData
        );



        return {


            ...customer,


            stamps:0,


            rewardUnlocked:false,


            rewardClaimed:false,


            lastStampDate:null,


            cycleReset:true


        };



    } catch(error){


        console.error(
            "Cycle reset error:",
            error
        );


        return customer;


    }

}




// ======================================
// LOAD CUSTOMER DATA
// ======================================

onAuthStateChanged(
auth,
async(user)=>{


    if(!user){


        window.location.replace(
            "login.html"
        );


        return;

    }



    try{


        const customerRef =
            doc(
                db,
                "customers",
                user.uid
            );



        const snapshot =
            await getDoc(
                customerRef
            );



        if(
            !snapshot.exists()
        ){


            alert(
                "Customer profile not found."
            );


            return;

        }



        let customer = {


            uid:
                user.uid,


            ...snapshot.data()


        };



        // 40 DAYS AUTO RESET

        customer =
            await resetExpiredCycle(
                customerRef,
                customer
            );




        window.currentUser =
            customer;




        window.dispatchEvent(

            new CustomEvent(
                "dashboard-ready"
            )

        );



    }
    catch(error){


        console.error(
            "Dashboard Firebase Error:",
            error
        );


        alert(
            "Unable to load dashboard."
        );


    }



});





console.log(
"🍜 Dashboard Firebase Loyalty System Loaded"
);
