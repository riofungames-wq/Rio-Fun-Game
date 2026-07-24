/* ==========================================
   RIO MAGGI POINT
   HISTORY PAGE JAVASCRIPT
   PART 1
========================================== */


import { 
    auth,
    db
} from "./firebase-config.js";


import { 
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


import {
    doc,
    getDoc,
    collection,
    getDocs,
    query,
    orderBy
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";



const customerName =
document.getElementById("customerName");


const memberId =
document.getElementById("memberId");


const totalStamps =
document.getElementById("totalStamps");


const totalRewards =
document.getElementById("totalRewards");


const historyContainer =
document.getElementById("historyContainer");


const rewardHistoryContainer =
document.getElementById("rewardHistoryContainer");



/* ==========================================
   AUTH CHECK
========================================== */


onAuthStateChanged(auth, async(user)=>{


    if(!user){

        window.location.href="login.html";

        return;

    }


    loadCustomerHistory(user.uid);


});



/* ==========================================
   LOAD CUSTOMER DATA
========================================== */


async function loadCustomerHistory(uid){


    try{


        const customerRef =
        doc(db,"customers",uid);


        const customerSnap =
        await getDoc(customerRef);



        if(customerSnap.exists()){


            const data =
            customerSnap.data();



            customerName.innerText =
            data.name || "Rio Customer";



            memberId.innerText =
            "Member ID : " + 
            (data.memberId || "N/A");



            totalStamps.innerText =
            data.stamps || 0;



            totalRewards.innerText =
            data.rewards || 0;



        }


        loadStampHistory(uid);


        loadRewardHistory(uid);



    }

    catch(error){


        console.log(
            "History Load Error:",
            error
        );


    }


}
/* ==========================================
   STAMP HISTORY LOAD
========================================== */


async function loadStampHistory(uid){


    try{


        const historyRef =
        collection(
            db,
            "customers",
            uid,
            "history"
        );


        const q =
        query(
            historyRef,
            orderBy(
                "createdAt",
                "desc"
            )
        );


        const snapshot =
        await getDocs(q);



        historyContainer.innerHTML = "";



        if(snapshot.empty){


            historyContainer.innerHTML = `

                <div class="history-item">

                    <div class="history-icon stamp">
                        ⭐
                    </div>


                    <div class="history-details">

                        <h3>
                            No Stamp History
                        </h3>

                        <p>
                            Your stamp activity will appear here.
                        </p>

                    </div>

                </div>

            `;


            return;

        }



        snapshot.forEach((item)=>{


            const data =
            item.data();



            historyContainer.innerHTML += `

                <div class="history-item">


                    <div class="history-icon stamp">

                        ⭐

                    </div>


                    <div class="history-details">


                        <h3>

                            ${data.title || "Stamp Added"}

                        </h3>


                        <p>

                            ${data.description || "Stamp activity"}

                        </p>


                        <span>

                            ${formatDate(data.createdAt)}

                        </span>


                    </div>


                </div>

            `;


        });



    }

    catch(error){


        console.log(
            "Stamp History Error:",
            error
        );


    }


}




/* ==========================================
   REWARD HISTORY LOAD
========================================== */


async function loadRewardHistory(uid){


    try{


        const rewardRef =
        collection(
            db,
            "customers",
            uid,
            "rewards"
        );



        const snapshot =
        await getDocs(rewardRef);



        rewardHistoryContainer.innerHTML = "";



        if(snapshot.empty){


            rewardHistoryContainer.innerHTML = `


                <div class="history-item">


                    <div class="history-icon reward">

                        🎁

                    </div>


                    <div class="history-details">


                        <h3>

                            No Rewards Yet

                        </h3>


                        <p>

                            Complete 6 stamps to unlock reward.

                        </p>


                    </div>


                </div>


            `;


            return;


        }



        snapshot.forEach((item)=>{


            const data =
            item.data();



            rewardHistoryContainer.innerHTML += `


                <div class="history-item">


                    <div class="history-icon reward">

                        🎁

                    </div>


                    <div class="history-details">


                        <h3>

                            ${data.reward || "Reward Unlocked"}

                        </h3>


                        <p>

                            ${data.status || "Available"}

                        </p>


                        <span>

                            ${formatDate(data.createdAt)}

                        </span>


                    </div>


                </div>


            `;


        });



    }

    catch(error){


        console.log(
            "Reward History Error:",
            error
        );


    }


}
/* ==========================================
   DATE FORMAT FUNCTION
========================================== */


function formatDate(timestamp){


    if(!timestamp){

        return "Date unavailable";

    }



    try{


        let date;



        if(timestamp.toDate){

            date = timestamp.toDate();

        }
        else{

            date = new Date(timestamp);

        }



        return date.toLocaleString();



    }

    catch(error){


        return "Invalid Date";


    }


}



/* ==========================================
   PAGE REFRESH SUPPORT
========================================== */


window.refreshHistory = function(){


    if(auth.currentUser){


        loadCustomerHistory(
            auth.currentUser.uid
        );


    }


};



/* ==========================================
   LOADING MESSAGE HANDLER
========================================== */


window.addEventListener(
"load",
()=>{


    if(historyContainer){


        if(historyContainer.innerHTML.trim()===""){


            historyContainer.innerHTML = `

                <div class="history-item">

                    <div class="history-icon stamp">
                        ⏳
                    </div>

                    <div class="history-details">

                        <h3>
                            Loading History...
                        </h3>

                        <p>
                            Please wait.
                        </p>

                    </div>

                </div>

            `;


        }


    }


});
