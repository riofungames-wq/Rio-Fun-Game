// =====================================================
// RIO MAGGI POINT
// QR.JS
// PREMIUM QR SYSTEM
// PART 1
// =====================================================


// ============================
// FIREBASE
// ============================

import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged
}
from
"https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    doc,
    getDoc
}
from
"https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// ============================
// ELEMENTS
// ============================

const customerPhoto =
document.getElementById("customerPhoto");

const customerName =
document.getElementById("customerName");

const memberId =
document.getElementById("memberId");

const qrBox =
document.getElementById("qrcode");

const qrStatus =
document.getElementById("qrStatus");

const downloadQR =
document.getElementById("downloadQR");

const shareQR =
document.getElementById("shareQR");


// ============================
// VARIABLES
// ============================

let currentCustomer = null;


// ============================
// DEFAULT CUSTOMER
// ============================

function resetCustomer(){

    if(customerName){
        customerName.textContent = "Customer";
    }

    if(memberId){
        memberId.textContent = "RIO-000000";
    }

    if(customerPhoto){
        customerPhoto.src = "assets/avatars/male.png";
    }

    if(qrStatus){
        qrStatus.textContent = "Loading...";
    }

    if(qrBox){
        qrBox.innerHTML = "";
    }

}


// ============================
// AVATAR
// ============================

function getAvatar(data){

    if(data.photoURL){
        return data.photoURL;
    }

    if(data.avatar){
        return data.avatar;
    }

    if(data.gender){

        const gender =
        data.gender.toLowerCase();

        if(gender==="female"){
            return "assets/avatars/female.png";
        }

    }

    return "assets/avatars/male.png";

}


// ============================
// LOAD CUSTOMER
// ============================

async function loadCustomer(user){

    try{

        const ref =
        doc(
            db,
            "customers",
            user.uid
        );

        const snap =
        await getDoc(ref);

        if(!snap.exists()){

            resetCustomer();

            if(qrStatus){
                qrStatus.textContent =
                "Customer not found";
            }

            return null;

        }

        const data =
        snap.data();

        currentCustomer = {

            uid:user.uid,

            memberId:
            data.memberId || "RIO-000000",

            name:
            data.name || "Customer",

            avatar:
            getAvatar(data)

        };

        customerName.textContent =
        currentCustomer.name;

        memberId.textContent =
        currentCustomer.memberId;

        customerPhoto.src =
        currentCustomer.avatar;

        return currentCustomer;

    }

    catch(error){

        console.error(
            "QR Load Error:",
            error
        );

        resetCustomer();

        return null;

    }

}
// =====================================================
// QR GENERATOR
// PART 2
// =====================================================

function generateQR(customer){

    if(!qrBox){
        return;
    }

    qrBox.innerHTML = "";

    const qrData = {

        type:"RIO_MAGGI_POINT",

        uid:customer.uid,

        memberId:customer.memberId,

        customerName:customer.name

    };

    new QRCode(

        qrBox,

        {

            text:JSON.stringify(qrData),

            width:220,

            height:220,

            colorDark:"#111111",

            colorLight:"#ffffff",

            correctLevel:QRCode.CorrectLevel.H

        }

    );

    if(qrStatus){

        qrStatus.textContent =
        "QR Ready To Scan";

    }

}


// ============================
// DOWNLOAD QR
// ============================

if(downloadQR){

    downloadQR.addEventListener(

        "click",

        ()=>{

            const canvas =
            qrBox.querySelector("canvas");

            if(!canvas){

                alert("QR Not Ready");

                return;

            }

            const link =
            document.createElement("a");

            link.download =
            "Rio-Maggi-Point-QR.png";

            link.href =
            canvas.toDataURL("image/png");

            link.click();

        }

    );

}


// ============================
// SHARE QR
// ============================

if(shareQR){

    shareQR.addEventListener(

        "click",

        async()=>{

            const canvas =
            qrBox.querySelector("canvas");

            if(!canvas){

                alert("QR Not Ready");

                return;

            }

            try{

                const blob =
                await new Promise(resolve=>

                    canvas.toBlob(resolve,"image/png")

                );

                const file =
                new File(

                    [blob],

                    "Rio-Maggi-QR.png",

                    {

                        type:"image/png"

                    }

                );

                if(

                    navigator.canShare &&

                    navigator.canShare({

                        files:[file]

                    })

                ){

                    await navigator.share({

                        title:"Rio Maggi Point",

                        text:"My Rio Maggi Point Loyalty QR",

                        files:[file]

                    });

                }

                else{

                    alert(

                        "Sharing is not supported on this device."

                    );

                }

            }

            catch(error){

                console.error(

                    "Share Error:",

                    error

                );

            }

        }

    );

}
// =====================================================
// AUTH START
// PART 3
// =====================================================

onAuthStateChanged(

    auth,

    async(user)=>{

        if(!user){

            window.location.href =
            "login.html";

            return;

        }

        const customer =
        await loadCustomer(user);

        if(customer){

            generateQR(customer);

        }
        else{

            if(qrStatus){

                qrStatus.textContent =
                "Unable To Generate QR";

            }

        }

        console.log(
            "================================"
        );

        console.log(
            "🍜 Rio Maggi Point"
        );

        console.log(
            "Premium QR Loaded Successfully"
        );

        console.log(
            "================================"
        );

    }

);


// =====================================================
// PAGE READY
// =====================================================

console.log(

    "QR JS Ready"

);
