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

// Login form validation

const form = document.getElementById("loginForm");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("Please fill in all fields.");
    return;
  }

  if (password.length < 6) {
    alert("Password must be at least 6 characters.");
    return;
  }

  // For now just simulate login
  alert("Login successful ✅");
  window.location.href = "dashboard.html"; // redirect after login
});

// Register form validation

const form2 = document.getElementById("registerForm");
const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");
const errorMsg = document.getElementById("errorMsg");

form2.addEventListener("submit", (e) => {
  e.preventDefault();
  if (password.value !== confirmPassword.value) {
    errorMsg.textContent = "Passwords do not match!";
  } else {
    errorMsg.textContent = "";
    alert("Registration successful! 🎉 Redirecting to login...");
    window.location.href = "login.html";
  }
});

//Contact Page Logcic

const contactForm = document.getElementById("contactForm");
contactForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const subject = document.getElementById("subject").value.trim();
  const message = document.getElementById("message").value.trim();

  if (!name || !email || !subject || !message) {
    alert("Please fill in all fields before submitting.");
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    alert("Please enter a valid email address.");
    return;
  }

  alert("✅ Message sent successfully! We’ll get back to you soon.");
  contactForm.reset();
});

// Get Started Button Logic

// Select all "Get Started" buttons
const getStartedBtns = document.querySelectorAll(".getStartedBtn");

getStartedBtns.forEach((btn) => {
  btn.addEventListener("click", function (e) {
    e.preventDefault();

    // Simulate login check (replace with real auth later)
    const isLoggedIn = localStorage.getItem("userLoggedIn");

    if (isLoggedIn) {
      // If user is logged in, send to dashboard
      window.location.href = "dashboard.html";
    } else {
      // If not logged in, send to registration
      window.location.href = "register.html";
    }
  });
});
// document.getElementById("getStartedBtn").addEventListener("click", function () {
//   // Simulate login check (replace with real auth later)
//   const isLoggedIn = localStorage.getItem("userLoggedIn");

//   if (isLoggedIn) {
//     // If user is logged in, send to dashboard
//     window.location.href = "dashboard.html";
//   } else {
//     // If not logged in, send to registration
//     window.location.href = "register.html";
//   }
// });
