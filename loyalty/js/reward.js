/**
 * =========================================================
 * RIO MAGGI POINT - REWARD.JS v6.0
 * FINAL PRODUCTION LOYALTY SYSTEM
 * =========================================================
 */


import { db } from "./firebase.js";

import {
    doc,
    getDoc,
    runTransaction,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// =========================================================
// CONFIG
// =========================================================

const REQUIRED_STAMPS = 6;

const CYCLE_DAYS = 40;


// =========================================================
// INITIAL LOYALTY STATE
// =========================================================

function getInitialLoyaltyState(){

    return {

        stamps:0,

        rewardUnlocked:false,

        rewardClaimed:false,

        cycleStartDate:null,

        lastStampDate:null,

        lastRewardClaimDate:null

    };

}



// =========================================================
// DATE HELPERS
// =========================================================

function isSameCalendarDay(timestamp){

    if(!timestamp) return false;


    const lastDate =
        timestamp.toDate
        ? timestamp.toDate()
        : new Date(timestamp);


    const today = new Date();


    return (

        lastDate.getFullYear() === today.getFullYear()

        &&

        lastDate.getMonth() === today.getMonth()

        &&

        lastDate.getDate() === today.getDate()

    );

}



function isCycleExpired(startDate){


    if(!startDate) return false;


    const start =
        startDate.toDate
        ? startDate.toDate()
        : new Date(startDate);



    const diff =
        Date.now() - start.getTime();



    const days =
        diff /
        (1000 * 60 * 60 * 24);



    return days >= CYCLE_DAYS;

}



// =========================================================
// LOAD REWARD DATA
// =========================================================

export async function loadReward(customerId){


    const ref =
        doc(
            db,
            "customers",
            customerId
        );


    const snap =
        await getDoc(ref);



    if(!snap.exists()){

        return getInitialLoyaltyState();

    }


    return snap.data();

}



// =========================================================
// UPDATE REWARD UI
// =========================================================

export async function updateRewardUI(customerId){


    try{


        const data =
            await loadReward(customerId);



        const stamp =
            document.getElementById(
                "rewardStampCount"
            );


        const status =
            document.getElementById(
                "rewardStatus"
            );


        const button =
            document.getElementById(
                "claimRewardBtn"
            );



        if(stamp){

            stamp.textContent =
                `${data.stamps || 0}/${REQUIRED_STAMPS}`;

        }



        if(status){


            status.textContent =
                data.rewardUnlocked

                ?

                "FREE Veg Maggi Reward Unlocked!"

                :

                `${REQUIRED_STAMPS - (data.stamps || 0)} stamps left for reward`;

        }



        if(button){

            button.disabled =
                !data.rewardUnlocked ||
                data.rewardClaimed;

        }



        return data;


    }

    catch(error){

        console.error(
            "Reward UI Error:",
            error
        );

    }


}



// =========================================================
// CLAIM REWARD
// =========================================================

export async function claimCustomerReward(customerId){


    try{


        const ref =
            doc(
                db,
                "customers",
                customerId
            );



        const result =
            await runTransaction(
                db,
                async(transaction)=>{


                    const snap =
                        await transaction.get(ref);



                    if(!snap.exists()){

                        throw new Error(
                            "Customer not found"
                        );

                    }



                    const data =
                        snap.data();



                    if(
                        !data.rewardUnlocked ||
                        data.rewardClaimed
                    ){

                        throw new Error(
                            "Reward not available"
                        );

                    }



                    transaction.update(
                        ref,
                        {


                            rewardClaimed:true,


                            rewardUnlocked:false,


                            stamps:0,


                            cycleStartDate:null,


                            lastRewardClaimDate:
                                serverTimestamp()


                        }

                    );



                    return true;


                }

            );



        await updateRewardUI(customerId);



        return {

            success:true,

            message:
            "Reward claimed successfully!"

        };


    }


    catch(error){


        console.error(
            "Claim Error:",
            error
        );


        return {

            success:false,

            message:error.message

        };


    }


}



// =========================================================
// CUSTOMER REWARD PAGE INITIALIZER
// =========================================================

export async function initializeRewardPage(customerId){


    await updateRewardUI(
        customerId
    );


}
