// =====================================================
// RIO MAGGI POINT
// PROFILE.JS
// FINAL PREMIUM PROFILE EDIT SYSTEM
// PART 1 / 3
// =====================================================


import { auth, db } from "./firebase-config.js";


import {

onAuthStateChanged,

signOut

}

from

"https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";



import {

doc,

getDoc,

updateDoc

}

from

"https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";




// =====================================================
// ELEMENTS
// =====================================================


const profilePhoto =
document.getElementById("profilePhoto");


const profileName =
document.getElementById("profileName");


const profileMemberId =
document.getElementById("profileMemberId");


const profileMobile =
document.getElementById("profileMobile");


const profileEmail =
document.getElementById("profileEmail");


const profileDOB =
document.getElementById("profileDOB");


const profileAge =
document.getElementById("profileAge");


const profileCategory =
document.getElementById("profileCategory");


const profileStampCount =
document.getElementById("profileStampCount");


const profileReward =
document.getElementById("profileReward");


const profileMemberSince =
document.getElementById("profileMemberSince");




// EDIT ELEMENTS


const editProfileBtn =
document.getElementById("editProfileBtn");


const editModal =
document.getElementById("editModal");


const editName =
document.getElementById("editName");


const editDOB =
document.getElementById("editDOB");


const editAge =
document.getElementById("editAge");


const editGender =
document.getElementById("editGender");


const saveProfileBtn =
document.getElementById("saveProfileBtn");


const closeEditBtn =
document.getElementById("closeEditBtn");


const logoutBtn =
document.getElementById("logoutBtn");





// =====================================================
// VARIABLES
// =====================================================


let currentUID = null;


let currentCustomer = null;
// =====================================================
// AUTH + LOAD PROFILE
// PART 2 / 3
// =====================================================


onAuthStateChanged(

auth,

async(user)=>{


    if(!user){


        window.location.href = "login.html";


        return;


    }



    currentUID = user.uid;



    try{


        const customerRef =

        doc(

            db,

            "customers",

            user.uid

        );



        const customerSnap =

        await getDoc(customerRef);




        if(!customerSnap.exists()){


            alert(

                "Customer data not found"

            );


            return;


        }





        currentCustomer =

        customerSnap.data();





        loadProfile(currentCustomer);



    }


    catch(error){


        console.error(

            "Profile Load Error:",

            error

        );


        alert(

            "Unable to load profile"

        );


    }


}

);








// =====================================================
// DISPLAY PROFILE DATA
// =====================================================


function loadProfile(customer){



    // PHOTO


    profilePhoto.src =

    customer.avatar ||

    customer.photoURL ||

    "assets/avatars/male.png";






    profileName.textContent =

    customer.name || "Customer";





    profileMemberId.textContent =

    customer.memberId || "RIO-000000";





    profileMobile.textContent =

    customer.mobile || "--";





    profileEmail.textContent =

    customer.email || "--";





    profileDOB.textContent =

    customer.dob || "--";





    profileAge.textContent =

    customer.age || "--";





    profileCategory.textContent =

    customer.gender

    ?

    customer.gender.toUpperCase()

    :

    "PREMIUM MEMBER";







    const stamps =

    Number(customer.stamps || 0);





    profileStampCount.textContent =

    `${stamps} / 6`;






    if(

        customer.rewardUnlocked === true

        ||

        stamps >= 6

    ){


        profileReward.textContent =

        "FREE VEG MAGGI UNLOCKED";


    }

    else{


        profileReward.textContent =

        "Locked";


    }





    // MEMBER DATE


    if(customer.createdAt){



        try{


            const date =

            customer.createdAt.toDate

            ?

            customer.createdAt.toDate()

            :

            new Date(

            customer.createdAt.seconds * 1000

            );




            profileMemberSince.textContent =

            date.toLocaleDateString();



        }

        catch{


            profileMemberSince.textContent = "--";


        }



    }

    else{


        profileMemberSince.textContent = "--";


    }



}








// =====================================================
// OPEN EDIT PROFILE
// =====================================================


if(editProfileBtn){


editProfileBtn.addEventListener(

"click",

()=>{


    if(!currentCustomer) return;




    editName.value =

    currentCustomer.name || "";



    editDOB.value =

    currentCustomer.dob || "";



    editAge.value =

    currentCustomer.age || "";



    editGender.value =

    currentCustomer.gender || "";





    editModal.style.display =

    "flex";



}

);


}
// =====================================================
// SAVE PROFILE UPDATE
// PART 3 / 3
// =====================================================


if(saveProfileBtn){


saveProfileBtn.addEventListener(

"click",

async()=>{


    const newName =

    editName.value.trim();



    const newDOB =

    editDOB.value;



    const newAge =

    editAge.value;



    const newGender =

    editGender.value;





    if(!newName){


        alert(

            "Name required"

        );


        return;


    }






    try{


        saveProfileBtn.disabled = true;


        saveProfileBtn.innerHTML =

        "Saving...";





        let newAvatar =

        "assets/avatars/male.png";





        if(newGender === "female"){


            newAvatar =

            "assets/avatars/female.png";


        }


        else if(newGender === "male"){


            newAvatar =

            "assets/avatars/male.png";


        }







        const customerRef =

        doc(

            db,

            "customers",

            currentUID

        );





        await updateDoc(

            customerRef,

            {


                name:newName,


                dob:newDOB,


                age:newAge,


                gender:newGender,


                avatar:newAvatar


            }

        );






        // Update local data


        currentCustomer.name = newName;

        currentCustomer.dob = newDOB;

        currentCustomer.age = newAge;

        currentCustomer.gender = newGender;

        currentCustomer.avatar = newAvatar;





        loadProfile(currentCustomer);





        editModal.style.display =

        "none";





        alert(

            "Profile Updated Successfully"

        );



    }



    catch(error){


        console.error(

            "Update Error:",

            error

        );



        alert(

            "Profile Update Failed"

        );


    }



    finally{


        saveProfileBtn.disabled = false;


        saveProfileBtn.innerHTML =

        `<i class="fa-solid fa-check"></i> Save`;


    }



}

);


}







// =====================================================
// CLOSE EDIT
// =====================================================


if(closeEditBtn){


closeEditBtn.addEventListener(

"click",

()=>{


    editModal.style.display =

    "none";


}

);


}








// =====================================================
// LOGOUT
// =====================================================


if(logoutBtn){


logoutBtn.addEventListener(

"click",

async()=>{



    const confirmLogout =

    confirm(

    "Do you want to logout?"

    );





    if(!confirmLogout){

        return;

    }





    try{


        await signOut(auth);



        window.location.href =

        "login.html";



    }



    catch(error){


        console.error(

            "Logout Error:",

            error

        );


        alert(

            "Logout Failed"

        );


    }



}

);


}






// =====================================================
// CLOSE MODAL OUTSIDE CLICK
// =====================================================


if(editModal){


window.addEventListener(

"click",

(event)=>{


    if(event.target === editModal){


        editModal.style.display =

        "none";


    }


}

);


}






console.log(

"================================"

);


console.log(

"🍜 Rio Maggi Point"

);


console.log(

"Premium Profile System Active"

);


console.log(

"Gender Avatar Update Ready"

);


console.log(

"================================"

);
