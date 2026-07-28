import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";



// ===============================
// ELEMENTS
// ===============================


const customerName =
document.getElementById("customerName");


const customerPhoto =
document.getElementById("customerPhoto");


const memberId =
document.getElementById("memberId");



const loyaltyCard =
document.getElementById("loyaltyCard");



// ===============================
// AUTH CHECK
// ===============================


onAuthStateChanged(auth, async (user)=>{


    if(!user){

        window.location.href="login.html";

        return;

    }



    await loadCustomerData(user.uid);



});




// ===============================
// LOAD CUSTOMER DATA
// ===============================


async function loadCustomerData(uid){


    try{


        const userRef =
        doc(db,"customers",uid);



        const userSnap =
        await getDoc(userRef);



        if(!userSnap.exists()){


            console.log(
                "Customer data not found"
            );


            return;


        }



        const customer =
        userSnap.data();



        updateCustomerUI(customer);



    }

    catch(error){


        console.error(
            "Card Load Error:",
            error
        );


    }



}
// ===============================
// UPDATE CUSTOMER UI
// ===============================


function updateCustomerUI(customer){



    // NAME


    if(customerName){


        customerName.textContent =
        customer.name || "Customer";


    }





    // ID


    if(memberId){


        memberId.textContent =

        customer.id ||

        customer.uid ||

        "RIO-000000";


    }







    // AVATAR


    if(customerPhoto){



        if(customer.photoURL){


            customerPhoto.src =
            customer.photoURL;


        }

        else if(customer.avatar){


            customerPhoto.src =
            customer.avatar;


        }

        else{


            customerPhoto.src =
            "assets/avatars/default.png";


        }



    }








    // GENDER THEME


    if(loyaltyCard){



        loyaltyCard.classList.remove(

            "male-theme",

            "female-theme"

        );




        if(customer.gender === "female"){



            loyaltyCard.classList.add(

                "female-theme"

            );


        }

        else{


            loyaltyCard.classList.add(

                "male-theme"

            );


        }



    }







    // LOAD STAMPS


    loadStamps(customer);



}
// ===============================
// STAMP SYSTEM
// ===============================


function loadStamps(customer){



    const stamps = customer.stamps || 0;



    const stampDates =
    customer.stampDates || [];





    // FIRST 6 STAMPS


    for(let i = 1; i <= 6; i++){



        const stamp =
        document.getElementById(
            "stamp" + i
        );



        const date =
        document.getElementById(
            "date" + i
        );





        if(stamp){



            if(i <= stamps){



                stamp.classList.add(
                    "active"
                );



                // Male default crown

                if(customer.gender === "female"){


                    stamp.innerHTML =
                    "💖";


                }

                else{


                    stamp.innerHTML =
                    "👑";


                }



            }

            else{


                stamp.classList.remove(
                    "active"
                );


                stamp.innerHTML =
                i;


            }



        }






        if(date){



            if(stampDates[i-1]){


                date.textContent =
                formatDate(
                    stampDates[i-1]
                );


            }

            else{


                date.textContent =
                "--";


            }



        }



    }








    // ===============================
    // FREE VEG MAGGI STAMP
    // ===============================



    const rewardStamp =
    document.querySelector(
        ".reward-stamp"
    );



    if(rewardStamp){



        if(stamps >= 6){



            rewardStamp.classList.add(
                "active"
            );



        }



    }








    // ===============================
    // HAPPY MASCOT
    // ===============================



    const mascot =
    document.getElementById(
        "happyMascot"
    );



    if(mascot){



        if(customer.gender === "female"){



            mascot.src =
            "assets/mascot/rio-happy-female.png";



        }

        else{


            mascot.src =
            "assets/mascot/rio-happy.png";


        }



    }



}






// ===============================
// DATE FORMAT
// ===============================


function formatDate(date){


    try{


        const d =
        new Date(date);



        return (

            d.getDate()
            +
            "/"
            +
            (d.getMonth()+1)
            +
            "/"
            +
            d.getFullYear()

        );


    }

    catch{


        return "--";


    }



}
// ===============================
// REWARD UNLOCK MESSAGE
// ===============================


const rewardMessage =
document.querySelector(
    ".reward-message"
);



if(rewardMessage){



    const currentStampCount =
    document.querySelectorAll(
        ".stamp-circle.active"
    ).length;



    if(currentStampCount >= 6){



        rewardMessage.innerHTML =

        `🏆 Congratulations! 
        Your FREE VEG MAGGI is Unlocked`;



    }

    else{



        rewardMessage.innerHTML =

        `Collect ${6-currentStampCount} more Stamps • 
        Unlock 1 FREE Veg Maggi`;



    }



}






// ===============================
// CLICK FREE GAME
// ===============================


const gameButton =
document.getElementById(
    "gameLink"
);



if(gameButton){



    gameButton.addEventListener(
        "click",
        ()=>{


            console.log(
                "Opening Rio Free Game"
            );


        }
    );



}






// ===============================
// MAP BUTTON
// ===============================


const mapBtn =
document.getElementById(
    "mapBtn"
);



if(mapBtn){



    mapBtn.addEventListener(
        "click",
        ()=>{


            window.open(

            "https://maps.google.com",

            "_blank"

            );


        }
    );


}






// ===============================
// PROFILE AVATAR SUPPORT
// ===============================


const profileBtn =
document.querySelector(
    'a[href="profile.html"]'
);



if(profileBtn){



    profileBtn.addEventListener(
        "click",
        ()=>{


            console.log(
                "Opening Profile"
            );


        }
    );


}




console.log(
"Rio Maggi Point Card Loaded Successfully"
);
