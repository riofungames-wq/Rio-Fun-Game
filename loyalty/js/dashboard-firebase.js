// ======================================
// RIO LOYALTY CLUB
// DASHBOARD FIREBASE
// FINAL FIXED
// ======================================


// ======================================
// FIREBASE CONFIG IMPORT
// ======================================

import {
    auth,
    db
} from "./firebase-config.js";


// ======================================
// FIREBASE IMPORTS
// ======================================

import {

    onAuthStateChanged

} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


import {

    doc,
    getDoc

} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";




// ======================================
// LOAD CURRENT USER
// ======================================

onAuthStateChanged(auth, async (user)=>{


    if(!user){

        window.location.href =
        "login.html";

        return;

    }



    try{


        const userRef =
        doc(
            db,
            "customers",
            user.uid
        );



        const userSnap =
        await getDoc(userRef);



        if(!userSnap.exists()){


            alert(
            "Customer record not found."
            );


            return;

        }



        const customer = {


            uid:user.uid,

            ...userSnap.data()


        };



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
        "Unable to load profile."
        );


    }


});




// ======================================
// DASHBOARD DATA UPDATE
// ======================================


window.addEventListener(
"dashboard-ready",
()=>{


    const customer =
    window.currentUser;



    if(!customer)
        return;




    const name =
    document.getElementById(
        "customerName"
    );


    if(name){

        name.textContent =
        customer.name || "Customer";

    }




    const member =
    document.getElementById(
        "memberId"
    );


    if(member){

        member.textContent =
        "Member ID : "
        +
        (
            customer.memberId
            ||
            "RIO-000000"
        );

    }





    const avatar =
    document.getElementById(
        "customerAvatar"
    );


    if(avatar){

        avatar.src =

        customer.avatar
        ||
        customer.photoURL
        ||
        "assets/avatars/default.png";

    }




    const infoName =
    document.getElementById(
        "infoName"
    );


    if(infoName){

        infoName.textContent =
        customer.name || "-";

    }





    const infoEmail =
    document.getElementById(
        "infoEmail"
    );


    if(infoEmail){

        infoEmail.textContent =
        customer.email || "-";

    }





    const infoMobile =
    document.getElementById(
        "infoMobile"
    );


    if(infoMobile){

        infoMobile.textContent =
        customer.mobile
        ||
        customer.phone
        ||
        "-";

    }





    const infoGender =
    document.getElementById(
        "infoGender"
    );


    if(infoGender){

        infoGender.textContent =
        customer.gender || "-";

    }





    if(
        typeof updateStamps === "function"
    ){

        updateStamps(
            customer.stamps || 0
        );

    }




});


console.log(
"🍜 Rio Dashboard Firebase Loaded"
);
