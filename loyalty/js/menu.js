


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






categoryCards.forEach(
(card)=>{



card.addEventListener(
"click",
()=>{



const target =
card.getAttribute(
"data-target"
);






// REMOVE ACTIVE CATEGORY


categoryCards.forEach(
(item)=>{

item.classList.remove(
"active"
);

});






// ADD ACTIVE CATEGORY


card.classList.add(
"active"
);








// HIDE ALL FOOD SECTION


foodSections.forEach(
(section)=>{


section.classList.remove(
"active"
);


});








// SHOW SELECTED SECTION


const selectedSection =
document.getElementById(
target
);




if(selectedSection){



selectedSection.classList.add(
"active"
);






// Restart animation


selectedSection.style.animation =
"none";



selectedSection.offsetHeight;



selectedSection.style.animation =
"sectionOpen .5s ease";



}





});



});






});





// SMOOTH SCROLL TO FOOD SECTION


const foodContainer =
document.querySelector(
".food-container"
);



categoryCards.forEach(
(card)=>{


card.addEventListener(
"click",
()=>{


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



});


});








// RESTART FOOD ANIMATION


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






// RUN WHEN CATEGORY CHANGES


categoryCards.forEach(
(card)=>{


card.addEventListener(
"click",
()=>{


restartFoodAnimation();


});


});







// DEFAULT ACTIVE SECTION CHECK


window.addEventListener(
"load",
()=>{



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



});







// PREVENT EMPTY LINK JUMP


document
.querySelectorAll(
".bottom-nav a"
)
.forEach(
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


}



});


});





console.log(
"Rio Maggi Point Menu Loaded"
);




