// =====================================
// RIO MAGGI POINT
// FREE GAME JS
// PART 1
// =====================================


// ============================
// HTML ELEMENTS
// ============================


const startGame =

document.getElementById(
"startGame"
);



const maggiItem =

document.getElementById(
"maggiItem"
);



const scoreText =

document.getElementById(
"score"
);



const timeText =

document.getElementById(
"gameTime"
);



const resultBox =

document.getElementById(
"resultBox"
);



const resultText =

document.getElementById(
"resultText"
);



const gameBoard =

document.getElementById(
"gameBoard"
);





// ============================
// GAME VARIABLES
// ============================


let score = 0;


let time = 30;


let gameRunning = false;


let timer = null;





// ============================
// DEFAULT DISPLAY
// ============================


function resetGame(){


score = 0;


time = 30;



if(scoreText){

scoreText.textContent = score;

}



if(timeText){

timeText.textContent = time;

}



if(resultBox){

resultBox.style.display = "none";

}



}

// =====================================
// GAME START + TIMER
// PART 2
// =====================================



// ============================
// START GAME
// ============================


function startNewGame(){


resetGame();


gameRunning = true;



if(startGame){


startGame.disabled = true;


startGame.innerHTML =

`

<i class="fa-solid fa-gamepad"></i>

PLAYING...

`;

}



moveMaggi();





timer = setInterval(()=>{



time--;





if(timeText){


timeText.textContent = time;


}





if(time <= 0){


endGame();


}



},1000);



}








// ============================
// MAGGI RANDOM MOVE
// ============================


function moveMaggi(){



if(!gameRunning || !maggiItem || !gameBoard){

return;

}





const maxX =

gameBoard.clientWidth - 70;



const maxY =

gameBoard.clientHeight - 70;





const randomX =

Math.floor(

Math.random()*maxX

);





const randomY =

Math.floor(

Math.random()*maxY

);






maggiItem.style.left =

randomX + "px";





maggiItem.style.top =

randomY + "px";





maggiItem.classList.add(

"active"

);





setTimeout(()=>{


maggiItem.classList.remove(

"active"

);


},400);



}








// ============================
// CLICK MAGGI
// ============================


if(maggiItem){


maggiItem.addEventListener(

"click",

()=>{


if(!gameRunning){

return;

}





score++;





if(scoreText){


scoreText.textContent = score;


}





moveMaggi();



}

);


}








// ============================
// START BUTTON CLICK
// ============================


if(startGame){


startGame.addEventListener(

"click",

()=>{


startNewGame();


}

);


}

// =====================================
// GAME END + CUSTOMER LOAD
// PART 3
// =====================================


// ============================
// END GAME
// ============================


function endGame(){


gameRunning = false;



if(timer){

clearInterval(timer);

}



if(startGame){


startGame.disabled = false;


startGame.innerHTML =


`

<i class="fa-solid fa-play"></i>

START GAME

`;

}



if(resultBox){


resultBox.style.display = "block";


}



if(resultText){


resultText.textContent =

"Your Score : " + score;


}



if(maggiItem){


maggiItem.style.left = "50%";


maggiItem.style.top = "50%";


}



}







// ============================
// CUSTOMER DATA LOAD
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





const gamePhoto =

document.getElementById(

"gamePhoto"

);



const gameName =

document.getElementById(

"gameName"

);



const gameMember =

document.getElementById(

"gameMember"

);







onAuthStateChanged(

auth,

async(user)=>{



if(!user){


window.location.href =

"login.html";


return;


}





try{


const customerRef =

doc(

db,

"customers",

user.uid

);





const customerSnap =

await getDoc(customerRef);





if(customerSnap.exists()){


const data =

customerSnap.data();





if(gameName){


gameName.textContent =

data.name || "Customer";


}





if(gameMember){


gameMember.textContent =

data.memberId || "RIO-000000";


}





if(gamePhoto){


gamePhoto.src =

data.photoURL ||

data.avatar ||

"assets/avatars/male.png";


}



}



}



catch(error){


console.error(

"Game Customer Load Error:",

error

);


}



});







// ============================
// PAGE READY
// ============================


console.log(

"================================"

);


console.log(

"🍜 Rio Maggi Point"

);


console.log(

"Free Game Loaded Successfully"

);


console.log(

"================================"

);
