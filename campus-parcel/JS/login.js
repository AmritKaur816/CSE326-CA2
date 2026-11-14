// login.js - handles the login form

var form = document.getElementById("loginForm");
var idInput = document.getElementById("loginId");
var passInput = document.getElementById("loginPassword");
var errorBox = document.getElementById("loginError");

// Already logged in? Go straight to the right dashboard.
var existing = getSession();
if (existing !== null) {
  window.location.replace(dashboardFor(existing.role));
}

function showError(message) {
  errorBox.textContent = message;
  errorBox.hidden = false;
}

form.addEventListener("submit", function (event) {
  event.preventDefault();
  errorBox.hidden = true;

  var id = idInput.value.trim();
  var password = passInput.value;

  // Both fields are mandatory
  if (id === "" && password === "") {
    showError("Please enter your Registration ID / Staff ID and your password.");
    return;
  }
  if (id === "") {
    showError("Registration ID / Staff ID is required.");
    return;
  }
  if (password === "") {
    showError("Password is required. The ID alone cannot log you in.");
    return;
  }

  var user = findUser(id, password);
  if (user === null) {
    showError("Incorrect ID or password. Please try again.");
    passInput.value = "";
    return;
  }

  startSession(user);
  window.location.replace(user.page);
});

// Show / hide password
document.getElementById("togglePassword").addEventListener("click", function () {
  var hidden = passInput.type === "password";
  passInput.type = hidden ? "text" : "password";
  this.textContent = hidden ? "Hide" : "Show";
});
