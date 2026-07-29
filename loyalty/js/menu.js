// =======================================
// RIO MAGGI POINT
// PREMIUM MENU
// menu.js
// PART 1
// =======================================

// ============================
// SELECT ELEMENTS
// ============================

const categories = document.querySelectorAll(".menu-category");
const tabs = document.querySelectorAll(".menu-tab");

// ============================
// OPEN / CLOSE CATEGORY
// ============================

categories.forEach(category => {

    const header = category.querySelector(".category-header");

    if (!header) return;

    header.addEventListener("click", () => {

        const isOpen = category.classList.contains("active");

        categories.forEach(item => {

            item.classList.remove("active");

        });

        if (!isOpen) {

            category.classList.add("active");

        }

    });

});

// ============================
// TAB CLICK
// ============================

tabs.forEach(tab => {

    tab.addEventListener("click", () => {

        tabs.forEach(btn => {

            btn.classList.remove("active");

        });

        tab.classList.add("active");

        const target = tab.dataset.category;

        categories.forEach(section => {

            section.classList.remove("active");

            if (section.id === target) {

                section.classList.add("active");

                section.scrollIntoView({

                    behavior: "smooth",
                    block: "start"

                });

            }

        });

    });

});

// ============================
// DEFAULT
// ============================

window.addEventListener("DOMContentLoaded", () => {

    const firstTab = document.querySelector(".menu-tab.active");

    if (firstTab) {

        const target = firstTab.dataset.category;

        document.getElementById(target)?.classList.add("active");

    }

});
// =======================================
// RIO MAGGI POINT
// PREMIUM MENU
// menu.js
// PART 2
// =======================================

// ============================
// CARD HOVER EFFECT
// ============================

const menuCards = document.querySelectorAll(".menu-card");

menuCards.forEach(card => {

    card.addEventListener("mouseenter", () => {

        card.style.transform = "translateY(-6px)";

    });

    card.addEventListener("mouseleave", () => {

        card.style.transform = "";

    });

});

// ============================
// IMAGE POP EFFECT
// ============================

const menuImages = document.querySelectorAll(".menu-right img");

menuImages.forEach(img => {

    img.addEventListener("mouseenter", () => {

        img.style.transform = "scale(1.08) rotate(-4deg)";
        img.style.transition = ".35s ease";

    });

    img.addEventListener("mouseleave", () => {

        img.style.transform = "";

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

        }, 250);

    });

});

// ============================
// FADE-IN ON SCROLL
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

// ============================
// TAB AUTO SCROLL
// ============================

tabs.forEach(tab => {

    tab.addEventListener("click", () => {

        tab.scrollIntoView({

            behavior: "smooth",
            inline: "center",
            block: "nearest"

        });

    });

});
// =======================================
// RIO MAGGI POINT
// PREMIUM MENU
// menu.js
// PART 3 (FINAL)
// =======================================

// ============================
// MOBILE VIBRATION
// ============================

function vibrate() {

    if ("vibrate" in navigator) {

        navigator.vibrate(20);

    }

}

tabs.forEach(tab => {

    tab.addEventListener("click", vibrate);

});

menuCards.forEach(card => {

    card.addEventListener("click", vibrate);

});

// ============================
// PAGE LOADED
// ============================

window.addEventListener("load", () => {

    document.body.classList.add("loaded");

});

// ============================
// PREMIUM SHINE LOOP
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
// REVEAL ANIMATION
// ============================

const revealItems = document.querySelectorAll(

    ".menu-header,.welcome-banner,.menu-category"

);

const revealObserver = new IntersectionObserver((entries) => {

    entries.forEach(entry => {

        if (entry.isIntersecting) {

            entry.target.classList.add("show");

        }

    });

}, {

    threshold: 0.10

});

revealItems.forEach(item => {

    revealObserver.observe(item);

});

// ============================
// CONSOLE
// ============================

console.log("==================================");
console.log("🍜 Rio Maggi Point");
console.log("Premium Menu Ready");
console.log("==================================");
