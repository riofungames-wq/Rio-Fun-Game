// =====================================================
// RIO MAGGI POINT
// ADMIN REWARD MANAGER
// PRODUCTION SECURITY PATCH PART 1
// =====================================================


import { auth, db } from "./firebase-config.js";


import {
    collection,
    getDocs,
    getDoc,
    doc,
    runTransaction,
    serverTimestamp
} 
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


import {
    onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";



// =====================================================
// CONFIGURATION
// =====================================================


const REWARD_STAMP_LIMIT = 6;

const RESET_CYCLE_DAYS = 40;

const CUSTOMER_COLLECTION = "customers";

const HISTORY_COLLECTION = "reward-history";

const ADMIN_COLLECTION = "admins";


const DEFAULT_MALE_AVATAR =
"assets/avatars/male.png";


const DEFAULT_FEMALE_AVATAR =
"assets/avatars/female.png";


const DEFAULT_MEMBER_ID =
"RIO-000000000";



// =====================================================
// ADMIN SECURITY CHECK
// =====================================================


async function verifyAdmin(uid){

    try{

        const adminRef =
        doc(
            db,
            ADMIN_COLLECTION,
            uid
        );


        const adminSnap =
        await getDoc(adminRef);



        if(
            !adminSnap.exists()
        ){

            throw new Error(
                "Admin permission denied"
            );

        }



        const adminData =
        adminSnap.data();



        if(
            adminData.role !== "admin"
        ){

            throw new Error(
                "Unauthorized access"
            );

        }


        return true;


    }
    catch(error){

        console.error(
            "Admin verification failed:",
            error
        );


        throw error;

    }

}



// =====================================================
// 40 DAY CYCLE VALIDATION
// =====================================================


function isCycleExpired(customer){


    if(
        !customer ||
        !customer.cycleStartedAt
    ){

        return false;

    }



    try{


        const startDate =
        customer.cycleStartedAt.toDate
        ?
        customer.cycleStartedAt.toDate()
        :
        new Date(
            customer.cycleStartedAt
        );



        const difference =
        Date.now()
        -
        startDate.getTime();



        const days =
        difference /
        (
            1000 *
            60 *
            60 *
            24
        );



        return days > RESET_CYCLE_DAYS;



    }
    catch(error){

        console.error(
            "Cycle date error:",
            error
        );


        return false;

    }

}



// =====================================================
// AUTH INITIALIZATION (SECURED)
// =====================================================


onAuthStateChanged(
auth,
async(user)=>{


    if(!user){

        window.location.href =
        "admin-login.html";

        return;

    }



    try{


        await verifyAdmin(
            user.uid
        );


        await loadRewards();



    }
    catch(error){


        showToast(
            "Unauthorized admin access",
            "error"
        );


        setTimeout(()=>{

            window.location.href =
            "admin-login.html";

        },1500);


    }


});
// =====================================================
// REDEEM REWARD LOGIC
// SECURE ATOMIC TRANSACTION VERSION
// =====================================================


elements.redeemRewardBtn?.addEventListener(
"click",
async()=>{


    if(!selectedCustomer){

        showToast(
            "Please select a customer first.",
            "warning"
        );

        return;

    }



    if(
        elements.redeemRewardBtn.disabled
    ){

        return;

    }



    const adminUser =
    auth.currentUser;



    if(!adminUser){

        showToast(
            "Admin session expired.",
            "error"
        );

        return;

    }



    const originalText =
    elements.redeemRewardBtn.textContent;



    try{


        elements.redeemRewardBtn.disabled =
        true;


        elements.redeemRewardBtn.textContent =
        "Redeeming...";



        const customerId =
        selectedCustomer.uid;



        const customerRef =
        doc(
            db,
            CUSTOMER_COLLECTION,
            customerId
        );



        const historyRef =
        doc(
            collection(
                db,
                HISTORY_COLLECTION
            )
        );



        await runTransaction(
        db,
        async(transaction)=>{


            const customerSnap =
            await transaction.get(
                customerRef
            );



            if(
                !customerSnap.exists()
            ){

                throw new Error(
                    "Customer record not found."
                );

            }



            const customerData =
            customerSnap.data();





            // ---------------------------------
            // SECURITY VALIDATIONS
            // ---------------------------------


            if(
                customerData.rewardUnlocked !== true
            ){

                throw new Error(
                    "Reward is not available."
                );

            }



            if(
                customerData.rewardClaimed === true
            ){

                throw new Error(
                    "Reward already claimed."
                );

            }




            const stamps =
            Number(
                customerData.stamps || 0
            );



            if(
                stamps < REWARD_STAMP_LIMIT
            ){

                throw new Error(
                    "Customer has incomplete stamps."
                );

            }





            // ---------------------------------
            // 40 DAY CYCLE CHECK
            // ---------------------------------


            if(
                isCycleExpired(
                    customerData
                )
            ){

                throw new Error(
                    "Reward cycle expired."
                );

            }





            // ---------------------------------
            // UPDATE CUSTOMER
            // ---------------------------------


            transaction.update(
                customerRef,
                {


                    rewardUnlocked:false,


                    rewardClaimed:true,


                    stamps:0,


                    lastStampDate:null,


                    cycleStartedAt:
                    serverTimestamp(),


                    cycleDaysLimit:
                    RESET_CYCLE_DAYS,


                    rewardClaimedAt:
                    serverTimestamp(),


                    updatedAt:
                    serverTimestamp()


                }
            );






            // ---------------------------------
            // CREATE HISTORY RECORD
            // ---------------------------------


            transaction.set(
                historyRef,
                {


                    customerId,


                    name:
                    customerData.name
                    ||
                    "Unknown",



                    memberId:
                    customerData.memberId
                    ||
                    DEFAULT_MEMBER_ID,



                    mobile:
                    customerData.mobile
                    ||
                    "",



                    rewardName:
                    "Free Veg Maggi",



                    rewardType:
                    "food_reward",



                    cycleId:
                    `RMP-${Date.now()}`,



                    claimedAt:
                    serverTimestamp(),



                    createdAt:
                    serverTimestamp(),



                    claimedBy:
                    adminUser.uid,



                    claimedByEmail:
                    adminUser.email
                    ||
                    "unknown"

                }

            );



        });



        // =====================================================
        // UPDATE LOCAL STATE AFTER SUCCESS
        // =====================================================


        const now =
        new Date();



        const index =
        customers.findIndex(
            c =>
            c.uid === customerId
        );



        if(index !== -1){


            customers[index] = {


                ...customers[index],


                rewardUnlocked:false,


                rewardClaimed:true,


                stamps:0,


                lastStampDate:null,


                rewardClaimedAt:now


            };



            selectedCustomer =
            customers[index];


        }






        rewardHistories.unshift(
        {


            customerId,


            name:
            selectedCustomer.name,


            memberId:
            selectedCustomer.memberId,


            mobile:
            selectedCustomer.mobile,


            rewardName:
            "Free Veg Maggi",


            claimedAt:
            now


        });



        showToast(
            "🎉 Reward redeemed successfully!",
            "success"
        );



        updateRewardStats();


        renderRewardTable();


        renderRewardHistory();


        previewCustomer(
            selectedCustomer
        );



    }
    catch(error){


        console.error(
            "Reward redemption failed:",
            error
        );


        showToast(
            error.message ||
            "Reward redemption failed.",
            "error"
        );


    }
    finally{


        elements.redeemRewardBtn.textContent =
        originalText;



        // Keep disabled after claim
        if(
            selectedCustomer &&
            selectedCustomer.rewardUnlocked !== true
        ){

            elements.redeemRewardBtn.disabled =
            true;

        }
        else{

            elements.redeemRewardBtn.disabled =
            false;

        }


    }


});
// =====================================================
// DATA LOADING (OPTIMIZED)
// =====================================================


async function loadRewards(){

    if(isLoading) return;


    isLoading = true;


    setLoadingState(true);



    try{


        const [
            customerSnapshot,
            historySnapshot
        ] = await Promise.all([


            getDocs(
                collection(
                    db,
                    CUSTOMER_COLLECTION
                )
            ),


            getDocs(
                collection(
                    db,
                    HISTORY_COLLECTION
                )
            )
            .catch(()=>null)

        ]);




        customers = [];



        customerSnapshot.forEach(
        customerDoc=>{


            customers.push({

                uid:
                customerDoc.id,


                ...customerDoc.data()

            });


        });





        rewardHistories = [];



        if(historySnapshot){


            historySnapshot.forEach(
            historyDoc=>{


                rewardHistories.push({

                    id:
                    historyDoc.id,


                    ...historyDoc.data()

                });


            });



            rewardHistories.sort(
            (a,b)=>{


                const first =
                a.claimedAt?.toMillis
                ?
                a.claimedAt.toMillis()
                :
                0;



                const second =
                b.claimedAt?.toMillis
                ?
                b.claimedAt.toMillis()
                :
                0;



                return second-first;


            });


        }




        updateRewardStats();


        renderRewardTable();


        renderRewardHistory();


        restoreSelectedCustomer();


        updateLastRefresh();



    }
    catch(error){


        console.error(
            "Loading rewards failed:",
            error
        );


        showToast(
            "Unable to load rewards.",
            "error"
        );


    }
    finally{


        isLoading=false;


        setLoadingState(false);


    }


}
