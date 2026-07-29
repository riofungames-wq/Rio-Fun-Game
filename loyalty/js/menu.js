// Rio Maggi Point
// Premium Menu System


document.addEventListener(
"DOMContentLoaded",
()=>{


const categoryCards =
document.querySelectorAll(
".category-card"
);



const foodSections =
document.querySelectorAll(
".food-section"
);



const foodContainer =
document.querySelector(
".food-container"
);








// CATEGORY SWITCH SYSTEM


categoryCards.forEach(
(card)=>{


card.addEventListener(
"click",
()=>{


const target =
card.getAttribute(
"data-target"
);





// REMOVE ACTIVE FROM ALL CATEGORY


categoryCards.forEach(
(item)=>{

item.classList.remove(
"active"
);

});





// ADD ACTIVE TO CLICKED CATEGORY


card.classList.add(
"active"
);







// HIDE ALL FOOD SECTIONS


foodSections.forEach(
(section)=>{


section.classList.remove(
"active"
);


});








// SHOW SELECTED FOOD SECTION


const selectedSection =
document.getElementById(
target
);





if(selectedSection){



selectedSection.classList.add(
"active"
);





// Restart section animation


selectedSection.style.animation =
"none";



selectedSection.offsetHeight;



selectedSection.style.animation =
"sectionOpen .5s ease";



}







// Smooth scroll


setTimeout(
()=>{


if(foodContainer){


foodContainer.scrollIntoView({

behavior:"smooth",

block:"start"

});


}


},
150
);







// Restart food icon animation


restartFoodAnimation();






});


});









// FOOD ANIMATION RESET FUNCTION


function restartFoodAnimation(){



const animationElements =
document.querySelectorAll(
".food-animation"
);





animationElements.forEach(
(element)=>{



element.style.animation =
"none";



element.offsetHeight;



element.style.animation =
"";



});



}








// DEFAULT LOAD CHECK


const firstCategory =
document.querySelector(
".category-card.active"
);



const firstSection =
document.querySelector(
".food-section.active"
);






if(firstCategory && firstSection){


firstCategory.classList.add(
"active"
);


firstSection.classList.add(
"active"
);



}
  





// BOTTOM NAVIGATION ACTIVE CONTROL


const bottomLinks =
document.querySelectorAll(
".bottom-nav a"
);





bottomLinks.forEach(
(link)=>{


link.addEventListener(
"click",
(e)=>{


const href =
link.getAttribute(
"href"
);




if(href === "menu.html"){


e.preventDefault();



bottomLinks.forEach(
(item)=>{


item.classList.remove(
"active"
);


});




link.classList.add(
"active"
);



}



});


});









// CATEGORY CARD TOUCH EFFECT


categoryCards.forEach(
(card)=>{


card.addEventListener(
"touchstart",
()=>{


card.style.transform =
"scale(0.96)";



});





card.addEventListener(
"touchend",
()=>{


card.style.transform =
"";


});


});








// CHECK MENU LOADED


console.log(
"Rio Maggi Point Menu Loaded Successfully"
);





});
