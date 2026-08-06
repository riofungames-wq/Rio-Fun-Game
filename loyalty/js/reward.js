// =========================================================
// RIO MAGGI POINT
// REWARD.JS
// FINAL FIXED LOYALTY SYSTEM
// PART 1/2
// =========================================================


// =========================================================
// FIREBASE IMPORT
// =========================================================

import {
    db
} from "./firebase-config.js";


import {
    doc,
    getDoc,
    runTransaction,
    serverTimestamp,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";



// =========================================================
// LOYALTY CONFIG
// =========================================================

const REQUIRED_STAMPS = 6;

const CYCLE_DAYS = 40;



// =========================================================
// INITIAL STATE
// =========================================================

function getInitialLoyaltyState(){

    return {

        stamps: 0,

        rewardUnlocked: false,

        rewardClaimed: false,

        cycleStartedAt: null,

        lastStampDate: null,

        lastRewardClaimDate: null

    };

}



// =========================================================
// DATE CONVERTER
// =========================================================

function convertDate(value){

    if(!value) return null;


    try{

        if(
            typeof value.toDate === "function"
        ){

            return value.toDate();

        }


        if(
            value.seconds !== undefined
        ){

            return new Date(
                value.seconds * 1000
            );

        }


        return new Date(value);


    }
    catch(error){

        console.error(
            "Date convert error:",
            error
        );

        return null;

    }

}




// =========================================================
// CHECK SAME DAY STAMP
// =========================================================

function isSameCalendarDay(value){

    const lastDate =
        convertDate(value);


    if(!lastDate){

        return false;

    }


    const today =
        new Date();



    return (

        lastDate.getFullYear()
        ===
        today.getFullYear()

        &&

        lastDate.getMonth()
        ===
        today.getMonth()

        &&

        lastDate.getDate()
        ===
        today.getDate()

    );

}




// =========================================================
// CHECK 40 DAYS EXPIRY
// =========================================================

function isCycleExpired(value){

    const startDate =
        convertDate(value);


    if(!startDate){

        return false;

    }


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


    return days >= CYCLE_DAYS;

}




// =========================================================
// LOAD CUSTOMER REWARD DATA
// =========================================================

export async function loadReward(customerId){


    try{


        const customerRef =
            doc(
                db,
                "customers",
                customerId
            );


        const snapshot =
            await getDoc(
                customerRef
            );



        if(
            !snapshot.exists()
        ){

            return getInitialLoyaltyState();

        }



        const data =
            snapshot.data();



        let stamps =
            Number(
                data.stamps || 0
            );



        let rewardUnlocked =
            stamps >= REQUIRED_STAMPS;



        // 40 DAYS CHECK

        if(
            isCycleExpired(
                data.cycleStartedAt
            )

            &&

            stamps < REQUIRED_STAMPS

            &&

            data.rewardClaimed !== true

        ){

            await updateDoc(
                customerRef,
                {

                    stamps:0,

                    rewardUnlocked:false,

                    rewardClaimed:false,

                    lastStampDate:null,

                    cycleStartedAt:
                        serverTimestamp(),

                    updatedAt:
                        serverTimestamp()

                }
            );



            stamps = 0;

            rewardUnlocked = false;

        }



        return {

            ...data,

            stamps,

            rewardUnlocked

        };


    }
    catch(error){


        console.error(
            "Load reward error:",
            error
        );


        return getInitialLoyaltyState();


    }


}
// =========================================================
// RIO MAGGI POINT
// REWARD.JS
// FINAL FIXED LOYALTY SYSTEM
// PART 2/2
// =========================================================



// =========================================================
// UPDATE REWARD UI
// =========================================================

export async function updateRewardUI(customerId){


    try{


        const data =
            await loadReward(
                customerId
            );



        const stampCount =
            Number(
                data.stamps || 0
            );



        const rewardCount =
            document.getElementById(
                "rewardStampCount"
            );



        const rewardStatus =
            document.getElementById(
                "rewardStatus"
            );



        const claimButton =
            document.getElementById(
                "claimRewardBtn"
            );



        if(rewardCount){

            rewardCount.textContent =
                `${stampCount}/${REQUIRED_STAMPS}`;

        }



        if(rewardStatus){


            if(
                data.rewardUnlocked
            ){

                rewardStatus.textContent =
                    "FREE Veg Maggi Reward Unlocked! 🎉";


            }
            else{


                const remaining =
                    REQUIRED_STAMPS -
                    stampCount;


                rewardStatus.textContent =
                    `${remaining} more valid stamp${remaining === 1 ? "" : "s"} required`;

            }

        }




        if(claimButton){


            const unlocked =
                data.rewardUnlocked === true
                &&
                data.rewardClaimed !== true;



            claimButton.disabled =
                !unlocked;



            claimButton.classList.toggle(
                "reward-unlocked-btn",
                unlocked
            );



            claimButton.classList.toggle(
                "reward-locked-btn",
                !unlocked
            );


        }



        return data;


    }
    catch(error){


        console.error(
            "Reward UI update error:",
            error
        );


    }


}





// =========================================================
// CLAIM CUSTOMER REWARD
// =========================================================

export async function claimCustomerReward(customerId){


    try{


        const customerRef =
            doc(
                db,
                "customers",
                customerId
            );



        await runTransaction(
            db,
            async(transaction)=>{


                const snapshot =
                    await transaction.get(
                        customerRef
                    );



                if(
                    !snapshot.exists()
                ){

                    throw new Error(
                        "Customer not found"
                    );

                }



                const customer =
                    snapshot.data();



                const stamps =
                    Number(
                        customer.stamps || 0
                    );



                if(
                    stamps < REQUIRED_STAMPS
                ){

                    throw new Error(
                        "Reward not unlocked"
                    );

                }



                if(
                    customer.rewardClaimed === true
                ){

                    throw new Error(
                        "Reward already claimed"
                    );

                }




                transaction.update(
                    customerRef,
                    {

                        stamps:0,

                        rewardUnlocked:false,

                        rewardClaimed:true,


                        lastStampDate:null,


                        cycleStartedAt:null,


                        lastRewardClaimDate:
                            serverTimestamp(),


                        updatedAt:
                            serverTimestamp()

                    }
                );



            }
        );



        await updateRewardUI(
            customerId
        );



        return {

            success:true,

            message:
            "FREE Veg Maggi claimed successfully!"

        };


    }
    catch(error){


        console.error(
            "Reward claim error:",
            error
        );



        return {

            success:false,

            message:
            error.message

        };


    }

}





// =========================================================
// INITIALIZE REWARD PAGE
// =========================================================

export async function initializeRewardPage(
    customerId
){

    await updateRewardUI(
        customerId
    );

}





// =========================================================
// EXPORT HELPERS
// =========================================================

window.RioReward = {

    loadReward,

    updateRewardUI,

    claimCustomerReward

};





console.log(
    "🍜 Rio Maggi Point Reward System Loaded Successfully"
);
