// ================= RIO MAGGI POINT - MENU SYSTEM JS =================

document.addEventListener("DOMContentLoaded", () => {
    initHeroSlider();
});

/* ================= 1. HERO SLIDER LOGIC ================= */
let currentSlide = 0;
let slideInterval;

function initHeroSlider() {
    const slides = document.querySelectorAll(".slide");
    const dots = document.querySelectorAll(".dot");

    if (slides.length === 0) return;

    // Start Auto Sliding every 4 seconds
    startAutoSlide();

    // Pause slider on hover
    const heroSection = document.querySelector(".hero-section");
    if (heroSection) {
        heroSection.addEventListener("mouseenter", () => clearInterval(slideInterval));
        heroSection.addEventListener("mouseleave", () => startAutoSlide());
    }
}

function startAutoSlide() {
    clearInterval(slideInterval);
    slideInterval = setInterval(() => {
        const slides = document.querySelectorAll(".slide");
        if (slides.length > 0) {
            currentSlide = (currentSlide + 1) % slides.length;
            updateSlideView(currentSlide);
        }
    }, 4000);
}

function setSlide(index) {
    currentSlide = index;
    updateSlideView(currentSlide);
    startAutoSlide(); // Reset timer on manual click
}

function updateSlideView(index) {
    const slides = document.querySelectorAll(".slide");
    const dots = document.querySelectorAll(".dot");

    slides.forEach((slide, i) => {
        slide.classList.toggle("active", i === index);
    });

    dots.forEach((dot, i) => {
        dot.classList.toggle("active", i === index);
    });
}

/* ================= 2. SMOOTH SCROLL TO CATEGORY ================= */
function scrollToSection(sectionId) {
    const targetElement = document.getElementById(sectionId);
    
    if (targetElement) {
        // Calculate offset for sticky header
        const headerOffset = 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
        });

        // Highlight target block briefly
        targetElement.classList.add("highlight-block");
        setTimeout(() => {
            targetElement.classList.remove("highlight-block");
        }, 1500);
    }
}
