// =====================================================
// RIO MAGGI POINT
// PREMIUM QR SYSTEM
// PART 1
// =====================================================

import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// =====================================================
// ELEMENTS
// =====================================================

const qrBox =
document.getElementById("qrcode");

const qrStatus =
document.getElementById("qrStatus");

const customerPhoto =
document.getElementById("customerPhoto");

const customerName =
document.getElementById("customerName");

const memberId =
document.getElementById("memberId");

const qrCard =
document.getElementById("qrCard");

const downloadQR =
document.getElementById("downloadQR");

const shareQR =
document.getElementById("shareQR");

let qrCode = null;

let qrValue = "";

// =====================================================
// AUTH
// =====================================================

onAuthStateChanged(auth, async(user)=>{

    if(!user){

        location.href="login.html";

        return;

    }

    try{

        const customerRef =
        doc(db,"customers",user.uid);

        const customerSnap =
        await getDoc(customerRef);

        if(!customerSnap.exists()){

            alert("Customer not found.");

            return;

        }

        const customer =
        customerSnap.data();

        loadCustomer(customer);

    }

    catch(error){

        console.error(error);

        alert("Unable to load QR.");

    }

});

// =====================================================
// LOAD CUSTOMER
// =====================================================

function loadCustomer(customer){

    customerName.textContent =
    customer.name || "Customer";

    memberId.textContent =
    customer.memberId || "RIO-000000";

    if(customer.photoURL){

        customerPhoto.src =
        customer.photoURL;

    }

    if(
        customer.gender &&
        customer.gender.toLowerCase()=="female"
    ){

        qrCard.classList.remove("theme-male");

        qrCard.classList.add("theme-female");

    }

    else{

        qrCard.classList.remove("theme-female");

        qrCard.classList.add("theme-male");

    }

    // Permanent QR Format

    qrValue =
    `RIO-MAGGI::${customer.memberId}`;

    generateQR();

}
// =====================================================
// GENERATE QR
// =====================================================

function generateQR() {

    qrBox.innerHTML = "";

    qrCode = new QRCode(qrBox, {

        text: qrValue,

        width: 260,

        height: 260,

        colorDark: "#111111",

        colorLight: "#ffffff",

        correctLevel: QRCode.CorrectLevel.H

    });

    qrStatus.textContent =
    "✅ Permanent Secure QR Ready";

}

// =====================================================
// DOWNLOAD QR
// =====================================================

downloadQR.addEventListener("click", () => {

    const img =
    qrBox.querySelector("img");

    const canvas =
    qrBox.querySelector("canvas");

    let image = "";

    if (img) {

        image = img.src;

    }

    else if (canvas) {

        image = canvas.toDataURL("image/png");

    }

    else {

        alert("QR Not Ready");

        return;

    }

    const link =
    document.createElement("a");

    link.href = image;

    link.download =
    "Rio-Maggi-QR.png";

    link.click();

});

// =====================================================
// SHARE QR
// =====================================================

shareQR.addEventListener("click", async () => {

    const canvas =
    qrBox.querySelector("canvas");

    if (!canvas) {

        alert("QR Not Ready");

        return;

    }

    try {

        const blob =
        await new Promise(resolve =>
            canvas.toBlob(resolve));

        const file =
        new File(

            [blob],

            "Rio-Maggi-QR.png",

            {

                type: "image/png"

            }

        );

        if (

            navigator.canShare &&

            navigator.canShare({

                files: [file]

            })

        ) {

            await navigator.share({

                title: "Rio Maggi Point",

                text: "My Rio Maggi Loyalty QR",

                files: [file]

            });

        }

        else {

            alert("Sharing is not supported on this device.");

        }

    }

    catch (error) {

        console.error(error);

    }

});

// =====================================================
// READY
// =====================================================

console.log("✅ Rio Permanent QR Loaded");
