// =======================================
// Rio Maggi Point
// Global JavaScript
// =======================================

document.addEventListener("DOMContentLoaded", () => {
    console.log("Rio Maggi Point Loaded");
});

// ---------- Helper Functions ----------

function $(id) {
    return document.getElementById(id);
}

function showElement(id) {
    $(id).style.display = "block";
}

function hideElement(id) {
    $(id).style.display = "none";
}

function toggleElement(id) {
    const el = $(id);
    el.style.display =
        el.style.display === "none" ? "block" : "none";
}
