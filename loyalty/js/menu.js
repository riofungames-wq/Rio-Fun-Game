// =====================================
// RIO MAGGI POINT
// PREMIUM MENU
// menu.js
// PART 1
// =====================================

// ============================
// CATEGORY BUTTONS
// ============================

const tabButtons = document.querySelectorAll(".menu-tab");
const categories = document.querySelectorAll(".menu-category");

// ============================
// CHANGE CATEGORY
// ============================

function showCategory(categoryId) {

    categories.forEach(section => {
        section.classList.remove("active");
    });

    tabButtons.forEach(btn => {
        btn.classList.remove("active");
    });

    document.getElementById(categoryId)?.classList.add("active");

    document
        .querySelector(`[data-category="${categoryId}"]`)
        ?.classList.add("active");
}

// ============================
// TAB CLICK
// ============================

tabButtons.forEach(button => {

    button.addEventListener("click", () => {

        const category = button.dataset.category;

        showCategory(category);

    });

});

// ============================
// DEFAULT CATEGORY
// ============================

window.addEventListener("DOMContentLoaded", () => {

    showCategory("maggi");

});
// =====================================
// RIO MAGGI POINT
// PREMIUM MENU
// menu.js
// PART 2
// =====================================

// ============================
// CARD ANIMATION
// ============================

const menuCards = document.querySelectorAll(".menu-card");

menuCards.forEach(card => {

    card.addEventListener("mouseenter", () => {

        card.style.transform = "translateY(-6px) scale(1.02)";

    });

    card.addEventListener("mouseleave", () => {

        card.style.transform = "translateY(0px) scale(1)";

    });

});

// ============================
// IMAGE POP EFFECT
// ============================

const foodImages = document.querySelectorAll(".menu-right img");

foodImages.forEach(img => {

    img.addEventListener("mouseenter", () => {

        img.style.transform = "scale(1.12) rotate(-3deg)";
        img.style.transition = ".35s ease";

    });

    img.addEventListener("mouseleave", () => {

        img.style.transform = "scale(1) rotate(0deg)";

    });

});

// ============================
// MOBILE TAP EFFECT
// ============================

menuCards.forEach(card => {

    card.addEventListener("click", () => {

        card.classList.add("selected");

        setTimeout(() => {

            card.classList.remove("selected");

        }, 350);

    });

});

// ============================
// SCROLL ANIMATION
// ============================

const observer = new IntersectionObserver((entries) => {

    entries.forEach(entry => {

        if (entry.isIntersecting) {

            entry.target.classList.add("show");

        }

    });

}, {

    threshold: 0.15

});

menuCards.forEach(card => {

    observer.observe(card);

});
// =====================================
// RIO MAGGI POINT
// PREMIUM MENU
// menu.js
// PART 3 (FINAL)
// =====================================


// ============================
// ACTIVE TAB AUTO SCROLL
// ============================

tabButtons.forEach(button => {

    button.addEventListener("click", () => {

        button.scrollIntoView({

            behavior: "smooth",
            inline: "center",
            block: "nearest"

        });

    });

});


// ============================
// MOBILE VIBRATION
// ============================

function vibrateDevice() {

    if ("vibrate" in navigator) {

        navigator.vibrate(20);

    }

}

tabButtons.forEach(btn => {

    btn.addEventListener("click", vibrateDevice);

});

menuCards.forEach(card => {

    card.addEventListener("click", vibrateDevice);

});


// ============================
// MENU LOADING EFFECT
// ============================

window.addEventListener("load", () => {

    document.body.classList.add("loaded");

});


// ============================
// FADE-IN ANIMATION
// ============================

const fadeElements = document.querySelectorAll(

    ".menu-card,.menu-header,.menu-tabs"

);

const fadeObserver = new IntersectionObserver((entries) => {

    entries.forEach(entry => {

        if (entry.isIntersecting) {

            entry.target.classList.add("fade-in");

        }

    });

}, {

    threshold: 0.10

});

fadeElements.forEach(el => {

    fadeObserver.observe(el);

});


// ============================
// PREMIUM GOLD SHINE
// ============================

setInterval(() => {

    menuCards.forEach(card => {

        card.classList.add("shine");

        setTimeout(() => {

            card.classList.remove("shine");

        }, 1200);

    });

}, 8000);


// ============================
// READY
// ============================

console.log("==================================");
console.log("🍜 Rio Maggi Point");
console.log("Premium Menu Loaded Successfully");
console.log("==================================");
