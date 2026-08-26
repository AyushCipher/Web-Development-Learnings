document.addEventListener("DOMContentLoaded", function () {
  const signupForm = document.getElementById("signupForm");
  const loginForm = document.getElementById("loginForm");

  // Signup form handler
  if (signupForm) {
    signupForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      const confirmPassword = document.getElementById("confirmPassword").value;

      let isValid = true;

      // Name
      if (name === "") {
        showError("nameError", "Name is required");
        isValid = false;
      } else {
        clearError("nameError");
      }

      // Email
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (email === "") {
        showError("emailError", "Email is required");
        isValid = false;
      } else if (!emailPattern.test(email)) {
        showError("emailError", "Invalid email format");
        isValid = false;
      } else {
        clearError("emailError");
      }

      // Password
      if (password.length < 6) {
        showError("passwordError", "Password must be at least 6 characters");
        isValid = false;
      } else {
        clearError("passwordError");
      }

      // Confirm Password
      if (confirmPassword !== password) {
        showError("confirmPasswordError", "Passwords do not match");
        isValid = false;
      } else {
        clearError("confirmPasswordError");
      }

      if (isValid) {
        // Save credentials in localStorage for login simulation
        localStorage.setItem("registeredEmail", email);
        localStorage.setItem("registeredPassword", password);

        alert("Signup successful! Redirecting to login...");
        window.location.href = "login.html";
      }
    });
  }

  // Login form handler
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const loginEmail = document.getElementById("loginEmail").value.trim();
      const loginPassword = document.getElementById("loginPassword").value;

      const registeredEmail = localStorage.getItem("registeredEmail");
      const registeredPassword = localStorage.getItem("registeredPassword");

      if (loginEmail === "" || loginPassword === "") {
        alert("Please enter both email and password.");
        return;
      }

      if (loginEmail === registeredEmail && loginPassword === registeredPassword) {
        alert("Login successful! Redirecting to dashboard...");
        window.location.href = "dashboard.html";
      } else {
        alert("Invalid email or password.");
      }
    });
  }
});

function showError(elementId, message) {
  const el = document.getElementById(elementId);
  if (el) el.textContent = message;
}

function clearError(elementId) {
  const el = document.getElementById(elementId);
  if (el) el.textContent = "";
}
