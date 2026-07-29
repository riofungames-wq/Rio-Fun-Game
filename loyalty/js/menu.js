// ======================================================
// Rio Maggi Point
// menu.js
// Part 1
// ======================================================

document.addEventListener("DOMContentLoaded", () => {

const categories = document.querySelectorAll(".category");
const cards = document.querySelectorAll(".item");
const badges = document.querySelectorAll(".badge");

let observer = new IntersectionObserver(

(entries)=>{

entries.forEach(entry=>{

if(entry.isIntersecting){

entry.target.classList.add("show");

}

});

},

{
threshold:0.15
}

);

cards.forEach(card=>{

card.classList.add("hidden");
observer.observe(card);

});

categories.forEach(section=>{

observer.observe(section);

});

// ===============================
// Ripple Effect
// ===============================

cards.forEach(card=>{

card.addEventListener("click",(e)=>{

const ripple=document.createElement("span");

const rect=card.getBoundingClientRect();

const size=Math.max(rect.width,rect.height);

ripple.style.width=size+"px";
ripple.style.height=size+"px";

ripple.style.left=(e.clientX-rect.left-size/2)+"px";
ripple.style.top=(e.clientY-rect.top-size/2)+"px";

ripple.className="ripple";

card.appendChild(ripple);

setTimeout(()=>{

ripple.remove();

},600);

});

});

// ===============================
// Badge Animation
// ===============================

let badgeIndex=0;

setInterval(()=>{

badges.forEach(b=>b.classList.remove("badge-pop"));

if(badges.length){

badges[badgeIndex].classList.add("badge-pop");

badgeIndex++;

if(badgeIndex>=badges.length){

badgeIndex=0;

}

}

},1800);
    // ===============================
// Smooth Hover Sound (Optional)
// ===============================

const menuCards = document.querySelectorAll(".item");

menuCards.forEach(card=>{

card.addEventListener("mouseenter",()=>{

card.style.transform="translateY(-8px) scale(1.02)";

});

card.addEventListener("mouseleave",()=>{

card.style.transform="";

});

});

// ===============================
// Category Highlight While Scroll
// ===============================

const categoryTitles=document.querySelectorAll(".category-title");

const sectionObserver=new IntersectionObserver(

(entries)=>{

entries.forEach(entry=>{

const title=entry.target.querySelector(".category-title");

if(!title) return;

if(entry.isIntersecting){

title.classList.add("active-category");

}else{

title.classList.remove("active-category");

}

});

},

{
threshold:0.35
}

);

categories.forEach(section=>{

sectionObserver.observe(section);

});

// ===============================
// Back Button Effect
// ===============================

const backButton=document.querySelector(".back-btn");

if(backButton){

backButton.addEventListener("click",()=>{

backButton.classList.add("clicked");

});

}

// ===============================
// Current Year
// ===============================

const year=document.querySelector("#currentYear");

if(year){

year.textContent=new Date().getFullYear();

}
    // ===============================
// Keyboard Accessibility
// ===============================

menuCards.forEach(card=>{

card.setAttribute("tabindex","0");

card.addEventListener("keydown",(e)=>{

if(e.key==="Enter" || e.key===" "){

e.preventDefault();

card.click();

}

});

});

// ===============================
// Image Lazy Animation
// ===============================

const images=document.querySelectorAll("img");

const imageObserver=new IntersectionObserver(

(entries)=>{

entries.forEach(entry=>{

if(entry.isIntersecting){

entry.target.classList.add("image-visible");
imageObserver.unobserve(entry.target);

}

});

},

{
threshold:0.20
}

);

images.forEach(img=>{

imageObserver.observe(img);

});

// ===============================
// Page Loaded
// ===============================

document.body.classList.add("page-loaded");

// ===============================
// End
// ===============================

});
    
