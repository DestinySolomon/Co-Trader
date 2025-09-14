// Mobile menu toggle
const hamburger = document.querySelector(".hamburger");
const mobileMenu = document.getElementById("mobileMenu");

hamburger.addEventListener("click", () => {
  mobileMenu.style.display =
    mobileMenu.style.display === "flex" ? "none" : "flex";
});

// Modal functions (Footer)
// Ensure modals are hidden on page load
window.addEventListener("DOMContentLoaded", function () {
  const privacy = document.getElementById("privacyModal");
  const terms = document.getElementById("termsModal");
  if (privacy) privacy.style.display = "none";
  if (terms) terms.style.display = "none";
});

function openModal(id) {
  document.getElementById(id).style.display = "flex";
}
function closeModal(id) {
  document.getElementById(id).style.display = "none";
}

function openModal(id) {
  document.getElementById(id).style.display = "flex"; // show
}
function closeModal(id) {
  document.getElementById(id).style.display = "none"; // hide
}

// Optional: close modal when clicking outside content
window.onclick = function (e) {
  const privacy = document.getElementById("privacyModal");
  const terms = document.getElementById("termsModal");
  if (e.target === privacy) privacy.style.display = "none";
  if (e.target === terms) terms.style.display = "none";
};
