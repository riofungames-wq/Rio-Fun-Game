/* =====================================================
   RIO MAGGI POINT
   DASHBOARD-FIREBASE.JS
   NEW CLEAN BUILD
   PART 1/3

   FIREBASE AUTH + CUSTOMER DATA LOAD
===================================================== */



// =========================
// IMPORTS
// =========================



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







// =========================
// CONSTANTS
// =========================



const STAMP_LIMIT = 6;


const CYCLE_LIMIT_DAYS = 40;








// =========================
// DATE CONVERTER
// =========================



function convertDate(value){



    if(!value)

        return null;




    try{



        if(value.toDate){

            return value.toDate();

        }



        return new Date(value);



    }

    catch(error){



        console.error(

            "Date conversion error",

            error

        );



        return null;


    }


}








// =========================
// CHECK CYCLE EXPIRY
// =========================



function checkCycleExpired(customer){



    if(

        !customer ||

        !customer.cycleStartedAt

    ){

        return false;

    }





    const startDate =

    convertDate(

        customer.cycleStartedAt

    );





    if(!startDate)

        return false;





    const difference =

    Date.now() -

    startDate.getTime();





    const days =

    difference /

    (1000 * 60 * 60 * 24);





    return days > CYCLE_LIMIT_DAYS;



}








// =========================
// RESET EXPIRED CYCLE
// =========================



async function resetExpiredCycle(

customerRef,

customer

){



    const stamps =

    Number(

        customer.stamps || 0

    );





    if(



        !checkCycleExpired(customer)



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



            cycleReset:true



        };




    }

    catch(error){



        console.error(

            "Cycle reset failed",

            error

        );



        return customer;


    }



}








// =========================
// LOAD CUSTOMER
// =========================



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







        if(!snapshot.exists()){



            alert(

            "Customer profile not found"

            );


            return;


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





        window.currentUser = customer;





        window.dispatchEvent(

            new CustomEvent(

                "dashboard-ready"

            )

        );







    }

    catch(error){



        console.error(

        "Dashboard Firebase Error",

        error

        );



        alert(

        "Unable to load dashboard"

        );



    }





});







console.log(

"🍜 Dashboard Firebase Loader Part 1 Loaded"

);
/* =====================================================
   RIO MAGGI POINT
   DASHBOARD-FIREBASE.JS
   NEW CLEAN BUILD
   PART 2/3

   CUSTOMER SYNC + STAMP VALIDATION
===================================================== */



// =========================
// CUSTOMER DATA REFRESH
// =========================



async function refreshCustomerData(){



    const user = auth.currentUser;



    if(!user)

        return null;





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







        if(!snapshot.exists())

            return null;







        let customer = {



            uid:user.uid,

            ...snapshot.data()



        };








        customer =

        await resetExpiredCycle(

            customerRef,

            customer

        );







        window.currentUser = customer;







        window.dispatchEvent(



            new CustomEvent(

                "customer-updated",

                {

                    detail:customer

                }

            )



        );







        return customer;







    }

    catch(error){



        console.error(

            "Customer refresh error",

            error

        );



        return null;



    }



}








// =========================
// STAMP VALIDATION
// =========================



function validateStampCount(value){



    let stamps =

    Number(value) || 0;





    if(stamps < 0)

        stamps = 0;





    if(stamps > STAMP_LIMIT)

        stamps = STAMP_LIMIT;





    return stamps;



}








// =========================
// UPDATE LOCAL STAMP VIEW
// =========================



window.updateCustomerStamps = function(

stampCount,

rewardClaimed=false

){



    const validCount =

    validateStampCount(

        stampCount

    );





    window.dispatchEvent(

        new CustomEvent(

            "customer-updated",

            {

                detail:{

                    ...window.currentUser,

                    stamps:validCount,

                    rewardClaimed

                }

            }

        )

    );



};








// =========================
// CUSTOMER REFRESH BUTTON HOOK
// =========================



window.reloadCustomerDashboard =

async function(){



    await refreshCustomerData();



};








// =========================
// INITIAL DATA CHECK
// =========================



window.addEventListener(

"request-customer-refresh",

()=>{



    refreshCustomerData();



}

);








console.log(

"🍜 Dashboard Firebase Sync Part 2 Loaded"

);
/* =====================================================
   RIO MAGGI POINT
   DASHBOARD-FIREBASE.JS
   NEW CLEAN BUILD
   PART 3/3

   FINAL EXPORT + CLEANUP
===================================================== */



// =========================
// FIREBASE LOGOUT FUNCTION
// =========================



import {

    signOut

} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";








window.logoutCustomer = async function(){



    try{



        await signOut(auth);





        sessionStorage.clear();



        localStorage.removeItem(
            "rioCustomer"
        );





        window.currentUser = null;





        window.location.replace(

            "login.html"

        );





    }

    catch(error){



        console.error(

            "Logout Error",

            error

        );



        alert(

            "Logout failed. Try again."

        );



    }



};








// =========================
// GLOBAL FIREBASE STATUS
// =========================



window.RioFirebaseDashboard = {



    refreshCustomerData,

    validateStampCount,

    resetExpiredCycle,

    checkCycleExpired



};








// =========================
// PREVENT DUPLICATE LOAD
// =========================



if(window.__RIO_DASHBOARD_FIREBASE_LOADED){



    console.warn(

        "Dashboard Firebase already loaded"

    );



}

else{



    window.__RIO_DASHBOARD_FIREBASE_LOADED = true;



}








console.log(

"🍜 Dashboard Firebase Completed Successfully"

);
