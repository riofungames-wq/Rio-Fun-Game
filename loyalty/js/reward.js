// =========================================================
// RIO MAGGI POINT
// REWARD.JS
// FINAL FIXED LOYALTY VERSION
// PART 1/3
// =========================================================


// =========================================================
// IMPORTS
// =========================================================

import {
    db
} from "./firebase-config.js";


import {
    doc,
    getDoc,
    runTransaction,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";



// =========================================================
// CONFIG
// =========================================================

const REQUIRED_STAMPS = 6;

const CYCLE_DAYS = 40;



// =========================================================
// INITIAL STATE
// =========================================================

function getInitialState(){

    return {

        stamps:0,

        rewardUnlocked:false,

        rewardClaimed:false,

        cycleStartedAt:null,

        lastStampDate:null,

        lastRewardClaimDate:null

    };

}



// =========================================================
// DATE CONVERTER
// =========================================================

function convertDate(value){

    if(!value){

        return null;

    }


    try{


        if(
            typeof value.toDate === "function"
        ){

            return value.toDate();

        }


        return new Date(value);


    }
    catch(error){

        console.error(
            "Date convert error",
            error
        );

        return null;

    }

}



// =========================================================
// CHECK 40 DAY CYCLE
// =========================================================

function isCycleExpired(startDate){


    const date =
        convertDate(startDate);



    if(!date){

        return false;

    }



    const difference =
        Date.now() -
        date.getTime();



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

            return getInitialState();

        }



        return {

            ...getInitialState(),

            ...snapshot.data()

        };


    }
    catch(error){


        console.error(
            "Load reward error:",
            error
        );


        return getInitialState();

    }


}
// =========================================================
// CHECK REWARD ELIGIBILITY
// =========================================================

function checkRewardEligibility(data){

    if(!data){

        return false;

    }



    const stamps =
        Number(
            data.stamps || 0
        );



    if(
        stamps < REQUIRED_STAMPS
    ){

        return false;

    }



    if(
        data.rewardClaimed === true
    ){

        return false;

    }



    return true;

}




// =========================================================
// UPDATE REWARD UI
// =========================================================

export async function updateRewardUI(customerId){


    try{


        const data =
            await loadReward(
                customerId
            );



        const stampElement =
            document.getElementById(
                "rewardStampCount"
            );



        const statusElement =
            document.getElementById(
                "rewardStatus"
            );



        const buttonElement =
            document.getElementById(
                "claimRewardBtn"
            );




        const stampCount =
            Number(
                data.stamps || 0
            );



        const unlocked =
            checkRewardEligibility(
                data
            );




        if(stampElement){


            stampElement.textContent =
                `${stampCount}/${REQUIRED_STAMPS}`;

        }





        if(statusElement){


            if(unlocked){


                statusElement.textContent =
                "🎉 FREE Veg Maggi Reward Unlocked!";


            }
            else{


                const remaining =
                    REQUIRED_STAMPS -
                    stampCount;



                statusElement.textContent =
                `Collect ${remaining} more valid stamp${remaining === 1 ? "" : "s"} within 40 days.`;

            }


        }





        if(buttonElement){


            buttonElement.disabled =
                !unlocked;



            if(unlocked){


                buttonElement.classList.remove(
                    "reward-locked-btn"
                );


                buttonElement.classList.add(
                    "reward-unlocked-btn"
                );


                buttonElement.innerHTML =
                `
                <i class="fa-solid fa-gift"></i>
                <span>
                    Claim FREE Veg Maggi
                </span>
                `;


            }
            else{


                buttonElement.classList.add(
                    "reward-locked-btn"
                );


                buttonElement.classList.remove(
                    "reward-unlocked-btn"
                );


                buttonElement.innerHTML =
                `
                <i class="fa-solid fa-lock"></i>
                <span>
                    Collect 6 Stamps to Unlock
                </span>
                `;


            }


        }




        return data;


    }
    catch(error){


        console.error(
            "Reward UI update error:",
            error
        );


        return null;


    }


}




// =========================================================
// CLAIM REWARD TRANSACTION
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




                if(
                    !checkRewardEligibility(
                        customer
                    )
                ){

                    throw new Error(
                        "Reward is not available"
                    );

                }
// =========================================================
// COMPLETE CLAIM TRANSACTION
// =========================================================

                transaction.update(

                    customerRef,

                    {

                        stamps:0,

                        rewardUnlocked:false,

                        rewardClaimed:true,


                        cycleStartedAt:null,


                        lastStampDate:null,


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
            "Claim reward error:",
            error
        );



        return {


            success:false,


            message:
            error.message ||
            "Reward claim failed"


        };


    }


}



// =========================================================
// REWARD PAGE INITIALIZER
// =========================================================

export async function initializeRewardPage(
    customerId
){


    await updateRewardUI(
        customerId
    );


}



// =========================================================
// AUTO CONNECT CLAIM BUTTON
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    ()=>{


        const claimButton =
            document.getElementById(
                "claimRewardBtn"
            );



        if(
            !claimButton
        ){

            return;

        }



        claimButton.addEventListener(
            "click",
            async()=>{


                const user =
                    window.currentRioUser;



                if(
                    !user
                ){

                    alert(
                        "Please login again."
                    );

                    return;

                }



                const result =
                    await claimCustomerReward(
                        user.uid
                    );



                alert(
                    result.message
                );



                if(
                    result.success
                ){

                    window.location.reload();

                }


            }
        );


    },
    {
        once:true
    }
);



// =========================================================
// FINAL READY
// =========================================================

console.log(
    "🍜 Rio Maggi Point Reward.js Loaded Successfully"
);
