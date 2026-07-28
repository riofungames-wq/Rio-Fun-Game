// =====================================
// RIO MAGGI POINT
// QR PAGE
// PART 1
// =====================================


// ============================
// FIREBASE
// ============================

import { auth, db } from "./firebase-config.js";

import {
onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
doc,
getDoc
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// ============================
// HTML ELEMENTS
// ============================

const customerName =
document.getElementById("customerName");

const memberId =
document.getElementById("memberId");

const customerPhoto =
document.getElementById("customerPhoto");

const qrStatus =
document.getElementById("qrStatus");

const qrCard =
document.getElementById("qrCard");

const qrBox =
document.getElementById("qrcode");
// =====================================
// LOAD CUSTOMER
// PART 2
// =====================================

async function loadCustomerData(user){

    try{

        const customerRef =
        doc(db,"customers",user.uid);

        const customerSnap =
        await getDoc(customerRef);

        if(!customerSnap.exists()){

            qrStatus.textContent =
            "Customer not found.";

            return;

        }

        const data =
        customerSnap.data();

        // ==========================
        // NAME
        // ==========================

        customerName.textContent =
        data.name || "Customer";

        // ==========================
        // MEMBER ID
        // ==========================

        memberId.textContent =
        data.memberId || "RIO-000000";

        // ==========================
        // PHOTO
        // ==========================

        customerPhoto.src =
        data.avatar || "assets/avatars/male.png";

        // ==========================
        // THEME
        // ==========================

        if(data.gender === "female"){

            qrCard.classList.remove("theme-male");

            qrCard.classList.add("theme-female");

        }

        else{

            qrCard.classList.remove("theme-female");

            qrCard.classList.add("theme-male");

        }

        // अगले पार्ट में QR Generate होगा

        window.customerData = data;

    }

    catch(error){

        console.error(
            "QR Customer Error:",
            error
        );

        qrStatus.textContent =
        "Failed to load customer.";

    }

}
// =====================================
// QR GENERATE + DOWNLOAD + SHARE + AUTH
// PART 3
// =====================================


// ============================
// GENERATE QR
// ============================

function generateQR(data){

    qrBox.innerHTML = "";

    new QRCode(qrBox,{
        text: JSON.stringify({
            uid: data.uid,
            memberId: data.memberId
        }),
        width:220,
        height:220
    });

    qrStatus.textContent =
    "Secure QR Ready";

}



// ============================
// DOWNLOAD
// ============================

document.getElementById("downloadQR")
?.addEventListener("click",()=>{

    const img =
    qrBox.querySelector("img");

    if(!img) return;

    const a =
    document.createElement("a");

    a.href = img.src;

    a.download =
    "Rio-Maggi-QR.png";

    a.click();

});



// ============================
// SHARE
// ============================

document.getElementById("shareQR")
?.addEventListener("click",async()=>{

    const img =
    qrBox.querySelector("img");

    if(!img) return;

    if(navigator.share){

        try{

            await navigator.share({

                title:"Rio Maggi Point",

                text:"My Loyalty QR"

            });

        }

        catch(e){}

    }

    else{

        alert("Share is not supported on this device.");

    }

});



// ============================
// AUTH
// ============================

onAuthStateChanged(

auth,

async(user)=>{

    if(!user){

        window.location.href =
        "login.html";

        return;

    }

    await loadCustomerData(user);

    generateQR(window.customerData);

    console.log("QR Page Loaded");

});
