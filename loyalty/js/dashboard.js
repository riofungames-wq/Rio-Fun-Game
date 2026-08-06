/* =====================================================
   RIO MAGGI POINT
   CUSTOMER DASHBOARD.JS
   NEW CLEAN BUILD
   PART 1/3

   UI + LOYALTY DISPLAY SYSTEM
===================================================== */



// =========================
// CONSTANTS
// =========================


const STAMP_LIMIT = 6;





// =========================
// DOM ELEMENTS
// =========================



const customerName =
document.getElementById("customerName");



const memberId =
document.getElementById("memberId");



const customerAvatar =
document.getElementById("customerAvatar");



const infoName =
document.getElementById("infoName");



const infoEmail =
document.getElementById("infoEmail");



const infoMobile =
document.getElementById("infoMobile");



const infoGender =
document.getElementById("infoGender");



const infoStatus =
document.getElementById("infoStatus");



const rewardStatus =
document.getElementById("rewardStatus");



const stamps = [

document.getElementById("stamp1"),

document.getElementById("stamp2"),

document.getElementById("stamp3"),

document.getElementById("stamp4"),

document.getElementById("stamp5"),

document.getElementById("stamp6")

];





const logoutBtn =
document.getElementById("logoutBtn");







// =========================
// CUSTOMER RENDER
// =========================



function renderCustomer(customer){


    if(!customer)

        return;




    if(customerName){

        customerName.textContent =
        customer.name ||
        "Premium Member";

    }




    if(memberId){

        memberId.textContent =
        "Member ID : " +
        (
            customer.memberId ||
            "RIO-000000"
        );

    }





    if(customerAvatar){


        customerAvatar.src =

        customer.avatar ||

        customer.photoURL ||

        "assets/avatars/default.png";


    }







    if(infoName){

        infoName.textContent =
        customer.name || "-";

    }





    if(infoEmail){

        infoEmail.textContent =
        customer.email || "-";

    }






    if(infoMobile){

        infoMobile.textContent =

        customer.mobile ||

        customer.phone ||

        "-";

    }






    if(infoGender){

        infoGender.textContent =

        customer.gender ||

        "-";

    }






    if(infoStatus){

        infoStatus.textContent =

        customer.status ||

        "Active";

    }





    updateStamps(

        Number(customer.stamps || 0),

        customer.rewardClaimed === true

    );



}









// =========================
// STAMP UPDATE
// =========================



function updateStamps(

count,

rewardClaimed=false

){



    let total = Number(count) || 0;



    total = Math.max(

        0,

        Math.min(

            total,

            STAMP_LIMIT

        )

    );






    stamps.forEach(box=>{


        if(box){


            box.classList.remove(
                "active"
            );


        }


    });







    for(

        let i=0;

        i<total;

        i++

    ){


        if(stamps[i]){


            stamps[i].classList.add(
                "active"
            );


        }


    }






    updateRewardStatus(

        total,

        rewardClaimed

    );



}







// =========================
// REWARD STATUS
// =========================



function updateRewardStatus(

stampCount,

rewardClaimed

){



    if(!rewardStatus)

        return;







    if(rewardClaimed){



        rewardStatus.innerHTML = `

        🎉 Reward Used

        <br><br>

        Start collecting stamps again

        🍜

        `;



        return;


    }







    if(stampCount >= STAMP_LIMIT){



        rewardStatus.innerHTML = `


        🎉 Congratulations!


        <br><br>


        FREE Veg Maggi Unlocked 🍜


        `;



        return;


    }







    const remaining =

    STAMP_LIMIT - stampCount;






    rewardStatus.innerHTML = `


    You have

    <strong>

    ${stampCount}

    </strong>

    valid stamps


    <br><br>


    Collect

    <strong>

    ${remaining}

    </strong>


    more stamps


    to unlock FREE Veg Maggi 🍜


    `;



}
/* =====================================================
   RIO MAGGI POINT
   CUSTOMER DASHBOARD.JS
   NEW CLEAN BUILD
   PART 2/3

   EVENT + INTEGRATION + LOGOUT
===================================================== */



// =========================
// DASHBOARD READY EVENT
// =========================



window.addEventListener(

"dashboard-ready",

()=>{


    const customer =

    window.currentUser;



    if(!customer){

        console.warn(
            "Customer data not available"
        );

        return;

    }



    renderCustomer(customer);



}

);









// =========================
// GLOBAL DASHBOARD UPDATE
// =========================



window.updateCustomerDashboard =

function(customer){



    if(!customer)

        return;



    window.currentUser = customer;



    renderCustomer(customer);



};








// =========================
// LOGOUT SYSTEM
// =========================



if(logoutBtn){



logoutBtn.addEventListener(

"click",

async()=>{



    const confirmLogout =

    confirm(

    "Are you sure you want to logout?"

    );




    if(!confirmLogout)

        return;





    try{



        /*
          Firebase logout will be handled
          by dashboard-firebase.js
        */


        sessionStorage.clear();



        localStorage.removeItem(
            "rioCustomer"
        );



        window.currentUser = null;



        window.location.replace(
            "login.html"
        );




    }

    catch(error){



        console.error(

        "Logout Error:",

        error

        );



        alert(
            "Logout failed"
        );


    }



}

);



}








// =========================
// INITIAL FALLBACK CHECK
// =========================



document.addEventListener(

"DOMContentLoaded",

()=>{



    if(window.currentUser){


        renderCustomer(
            window.currentUser
        );


    }



}

);








console.log(

"🍜 Dashboard UI Controller Loaded"

);
/* =====================================================
   RIO MAGGI POINT
   CUSTOMER DASHBOARD.JS
   NEW CLEAN BUILD
   PART 3/3

   FINAL SYNC + EXPORT
===================================================== */



// =========================
// STAMP SYNC FROM EXTERNAL
// =========================



window.syncDashboardStamps = function(

count,

rewardClaimed = false

){



    updateStamps(

        count,

        rewardClaimed

    );


};







// =========================
// REWARD REFRESH
// =========================



window.refreshRewardStatus = function(

stampCount

){



    updateRewardStatus(

        Number(stampCount) || 0,

        false

    );


};








// =========================
// CUSTOMER REFRESH
// =========================



window.refreshCustomerDashboard = function(

customer

){



    if(!customer)

        return;



    window.currentUser = customer;



    renderCustomer(customer);



};








// =========================
// AUTO UPDATE WHEN DATA CHANGES
// =========================



window.addEventListener(

"customer-updated",

(event)=>{



    const customer =

    event.detail;



    if(customer){


        renderCustomer(customer);


    }



}

);








// =========================
// CLEAN INIT
// =========================



function initDashboard(){



    if(window.currentUser){



        renderCustomer(

            window.currentUser

        );


    }



}





initDashboard();







// =========================
// EXPORT DEBUG
// =========================



window.RioDashboard = {


    renderCustomer,

    updateStamps,

    updateRewardStatus


};







console.log(

"🍜 Rio Maggi Point Dashboard.js Completed"

);
