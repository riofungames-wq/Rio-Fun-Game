// ======================================
// RIO MAGGI POINT
// DASHBOARD-FIREBASE.JS
// CLEAN FIXED VERSION
// PART 1/3
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
// LOYALTY CONSTANTS
// ======================================

const STAMP_LIMIT = 6;

const CYCLE_VALIDITY_DAYS = 40;





// ======================================
// CHECK 40 DAYS CYCLE EXPIRY
// ======================================

function isCycleExpired(customer){


    if(
        !customer ||
        !customer.cycleStartedAt
    ){

        return false;

    }



    try{


        let startDate;



        if(
            customer.cycleStartedAt.toDate
        ){

            startDate =
            customer.cycleStartedAt.toDate();

        }
        else{


            startDate =
            new Date(
                customer.cycleStartedAt
            );

        }




        if(
            isNaN(
                startDate.getTime()
            )
        ){

            return false;

        }




        const difference =
        Date.now()
        -
        startDate.getTime();




        const daysPassed =
        difference /
        (
            1000 *
            60 *
            60 *
            24
        );




        return (
            daysPassed >
            CYCLE_VALIDITY_DAYS
        );



    }
    catch(error){


        console.error(
            "Cycle expiry check failed:",
            error
        );


        return false;


    }


}






// ======================================
// EXPORT FOR DEBUG
// ======================================

window.RioLoyalty = {

    STAMP_LIMIT,

    CYCLE_VALIDITY_DAYS,

    isCycleExpired

};


console.log(
"🍜 Dashboard Firebase Part 1 Loaded"
);
// ======================================
// RIO MAGGI POINT
// DASHBOARD-FIREBASE.JS
// CLEAN FIXED VERSION
// PART 2/3
// ======================================



// ======================================
// RESET EXPIRED LOYALTY CYCLE
// ======================================

async function resetExpiredCycle(
    customerRef,
    customer
){


    const currentStamps =
    Number(
        customer.stamps || 0
    );



    // Reset only when:
    // 1. Cycle expired
    // 2. Customer has incomplete stamps
    // 3. Reward not already claimed


    if(

        !isCycleExpired(customer)

        ||

        currentStamps <= 0

        ||

        currentStamps >= STAMP_LIMIT

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





    try{


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



    }
    catch(error){


        console.error(
            "Loyalty cycle reset error:",
            error
        );



        return customer;


    }


}





// ======================================
// LOAD CUSTOMER PROFILE
// ======================================

async function loadCustomerProfile(
    user
){


    if(!user){

        return null;

    }




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


        throw new Error(
            "Customer profile not found"
        );


    }




    let customer = {


        uid:user.uid,


        ...snapshot.data()


    };




    customer =
    await resetExpiredCycle(
        customerRef,
        customer
    );




    return customer;


}
// ======================================
// RIO MAGGI POINT
// DASHBOARD-FIREBASE.JS
// CLEAN FIXED VERSION
// PART 3/3 FINAL
// ======================================



// ======================================
// AUTH STATE LISTENER
// ======================================

let dashboardLoading = false;



onAuthStateChanged(

auth,

async(user)=>{


    if(
        dashboardLoading
    ){

        return;

    }



    dashboardLoading = true;



    try{


        // USER NOT LOGGED IN

        if(!user){


            window.location.replace(
                "login.html"
            );


            return;


        }





        const customer =
        await loadCustomerProfile(
            user
        );





        window.currentUser =
        customer;





        window.dispatchEvent(

            new CustomEvent(
                "dashboard-ready",
                {
                    detail:customer
                }
            )

        );




    }
    catch(error){


        console.error(

            "Dashboard Firebase Load Error:",
            error

        );



        alert(
            "Unable to load customer dashboard."
        );


    }
    finally{


        dashboardLoading = false;


    }


});





// ======================================
// DEBUG
// ======================================

console.log(
"🍜 Dashboard Firebase Loyalty System Loaded Successfully"
);
