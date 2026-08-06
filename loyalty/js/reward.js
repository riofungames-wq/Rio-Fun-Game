// =========================================================
// RIO MAGGI POINT
// REWARD.JS
// FINAL CLEAN PRODUCTION VERSION
// PART 1/3
// =========================================================


// =========================================================
// FIREBASE IMPORT
// =========================================================

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
    runTransaction,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";



// =========================================================
// CONFIG
// =========================================================

const REQUIRED_STAMPS = 6;

const CYCLE_DAYS = 40;



// =========================================================
// GLOBAL STATE
// =========================================================

window.rewardCustomer = null;

let rewardInitialized = false;



// =========================================================
// DEFAULT LOYALTY STATE
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
            "Date conversion error",
            error
        );


        return null;

    }

}



// =========================================================
// CHECK 40 DAY EXPIRY
// =========================================================

function isCycleExpired(dateValue){


    const startDate =
        convertDate(dateValue);



    if(!startDate){

        return false;

    }



    const daysPassed =
        (
            Date.now()
            -
            startDate.getTime()
        )
        /
        (
            1000 *
            60 *
            60 *
            24
        );



    return daysPassed >= CYCLE_DAYS;


}



// =========================================================
// LOAD CUSTOMER REWARD DATA
// =========================================================

async function loadRewardData(uid){


    try{


        const customerRef =
            doc(
                db,
                "customers",
                uid
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
            "Reward data loading error:",
            error
        );


        return getInitialState();

    }


}
// =========================================================
// CHECK REWARD ELIGIBILITY
// =========================================================

function isRewardAvailable(data){


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
// UPDATE REWARD PAGE UI
// =========================================================

async function updateRewardUI(uid){


    const data =
        await loadRewardData(
            uid
        );



    window.rewardCustomer =
        data;



    const stampCount =
        Number(
            data.stamps || 0
        );



    const unlocked =
        isRewardAvailable(
            data
        );



    // ==============================
    // STAMP COUNT
    // ==============================

    const stampCountElement =
        document.getElementById(
            "rewardStampCount"
        );



    if(stampCountElement){

        stampCountElement.textContent =
            `${stampCount}/${REQUIRED_STAMPS}`;

    }



    // ==============================
    // PROGRESS BAR
    // ==============================

    const progressBar =
        document.getElementById(
            "rewardProgressBar"
        );



    if(progressBar){


        const percentage =
            (
                stampCount /
                REQUIRED_STAMPS
            )
            *
            100;



        progressBar.style.width =
            `${percentage}%`;

    }




    // ==============================
    // PROGRESS TEXT
    // ==============================

    const progressText =
        document.getElementById(
            "rewardProgressText"
        );



    if(progressText){


        progressText.textContent =
        `${stampCount} of ${REQUIRED_STAMPS} valid stamps collected`;


    }




    // ==============================
    // STAMP BOX UI
    // ==============================

    const stampBoxes =
        document.querySelectorAll(
            ".reward-stamp-box"
        );



    stampBoxes.forEach(
        box=>{


            const number =
                Number(
                    box.dataset.stamp
                );



            const active =
                number <= stampCount;



            box.classList.toggle(
                "active",
                active
            );



            box.classList.toggle(
                "collected",
                active
            );


        }
    );





    // ==============================
    // STATUS BOX
    // ==============================

    const statusBox =
        document.getElementById(
            "rewardStatus"
        );



    const statusTitle =
        statusBox?.querySelector(
            "strong"
        );



    const statusText =
        statusBox?.querySelector(
            "span"
        );



    if(statusBox){


        statusBox.classList.toggle(
            "reward-unlocked",
            unlocked
        );


    }




    if(unlocked){


        if(statusTitle){

            statusTitle.textContent =
                "Reward Unlocked!";

        }



        if(statusText){

            statusText.textContent =
            "Your FREE Veg Maggi is ready to claim.";

        }


    }

    else{


        const remaining =
            REQUIRED_STAMPS -
            stampCount;



        if(statusTitle){

            statusTitle.textContent =
                "Reward Locked";

        }



        if(statusText){

            statusText.textContent =
            `Collect ${remaining} more valid stamp${remaining===1?"":"s"} within 40 days.`;

        }


    }




    // ==============================
    // CLAIM BUTTON
    // ==============================

    const claimButton =
        document.getElementById(
            "claimRewardBtn"
        );



    if(claimButton){


        claimButton.disabled =
            !unlocked;



        if(unlocked){


            claimButton.className =
            "premium-action-btn reward-unlocked-btn";



            claimButton.innerHTML =
            `
            <i class="fa-solid fa-gift"></i>
            <span>
            Claim FREE Veg Maggi
            </span>
            `;


        }

        else{


            claimButton.className =
            "premium-action-btn reward-locked-btn";



            claimButton.innerHTML =
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



// =========================================================
// CLAIM REWARD TRANSACTION
// =========================================================

async function claimReward(uid){


    try{


        const customerRef =
            doc(
                db,
                "customers",
                uid
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



                const data =
                    snapshot.data();



                if(
                    !isRewardAvailable(
                        data
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
                error.message ||
                "Reward claim failed"

        };


    }


}



// =========================================================
// AUTH INITIALIZATION
// =========================================================

onAuthStateChanged(

    auth,

    async(user)=>{


        if(
            rewardInitialized
        ){

            return;

        }


        rewardInitialized = true;



        if(!user){


            window.location.replace(
                "login.html"
            );


            return;


        }



        window.currentRioUser =
            user;



        await updateRewardUI(
            user.uid
        );


        hideLoader();


    }

);



// =========================================================
// CLAIM BUTTON CONNECT
// =========================================================

document.addEventListener(

    "DOMContentLoaded",

    ()=>{


        const claimButton =
            document.getElementById(
                "claimRewardBtn"
            );



        if(!claimButton){

            return;

        }



        claimButton.addEventListener(

            "click",

            async()=>{


                const user =
                    window.currentRioUser;



                if(!user){


                    alert(
                        "Please login again."
                    );


                    return;

                }



                const result =
                    await claimReward(
                        user.uid
                    );



                alert(
                    result.message
                );



                if(
                    result.success
                ){


                    window.location.href =
                        "card.html";


                }


            },

            {
                once:false
            }

        );


    }

);



// =========================================================
// PAGE LOADER
// =========================================================

function hideLoader(){


    const loader =
        document.getElementById(
            "pageLoader"
        );



    if(loader){


        loader.classList.add(
            "hidden"
        );


        loader.setAttribute(
            "aria-hidden",
            "true"
        );


    }


}



// =========================================================
// EXPORT
// =========================================================

window.claimRioReward =
claimReward;



console.log(
"🍜 Rio Maggi Point Reward.js Final Loaded Successfully"
);
