// profile.js - top-right profile icon, dropdown, profile editor and logout
// Used by all three dashboards. Needs data.js and auth.js loaded first.

var session = getSession();
var isStudent = session.role === "student";

// Small inline icons
var ICON_USER = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>';
var ICON_LOGOUT = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>';
var ICON_ARROW = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';
var ICON_LOCK = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>';

// ---------- 1. Build the dropdown inside the navbar ----------
var mount = document.getElementById("profileMount");
mount.innerHTML =
  '<button type="button" class="profile-btn" id="profileBtn" aria-haspopup="true" aria-expanded="false">' +
    '<span class="avatar" id="avatarCircle"></span>' +
    '<span class="profile-name" data-profile="name"></span>' +
    ICON_ARROW +
  '</button>' +
  '<div class="dropdown" id="profileMenu" hidden>' +
    '<button type="button" id="menuProfile">' + ICON_USER + ' My Profile</button>' +
    '<button type="button" id="menuLogout">' + ICON_LOGOUT + ' Log Out</button>' +
  '</div>';

// ---------- 2. Build the profile modal ----------
var studentFields = "";
if (isStudent) {
  studentFields =
    '<label>Hostel Name<input type="text" id="pfHostel"></label>' +
    '<label>Hostel Block<input type="text" id="pfBlock"></label>' +
    '<label>Room Number<input type="text" id="pfRoom"></label>';
}
var idLabel = isStudent ? "University Registration ID" : "Staff ID";

var overlay = document.createElement("div");
overlay.className = "modal-overlay";
overlay.id = "profileModal";
overlay.hidden = true;
overlay.innerHTML =
  '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="profileTitle">' +
    '<div class="modal-head">' +
      '<h2 id="profileTitle">My Profile</h2>' +
      '<button type="button" class="close-btn" id="closeProfile" aria-label="Close">&times;</button>' +
    '</div>' +
    '<p class="form-success" id="profileSuccess" hidden></p>' +
    '<p class="form-error" id="profileError" hidden></p>' +
    '<div class="modal-body">' +
      '<h3>Personal Information</h3>' +
      '<div class="readonly-id">' + ICON_LOCK +
        '<span>' + idLabel + '</span><strong data-profile="id"></strong>' +
        '<em>Cannot be changed</em></div>' +
      '<div class="form-grid">' +
        '<label>Full Name<input type="text" id="pfName"></label>' +
        studentFields +
        '<label>Phone Number<input type="tel" id="pfPhone"></label>' +
        '<label>Email Address<input type="email" id="pfEmail"></label>' +
      '</div>' +
    '</div>' +
    '<div class="modal-foot">' +
      '<button type="button" class="btn btn-primary" id="editBtn">Edit Profile</button>' +
      '<button type="button" class="btn btn-primary" id="saveBtn" hidden>Save Changes</button>' +
      '<button type="button" class="btn btn-ghost" id="cancelBtn" hidden>Cancel</button>' +
    '</div>' +
  '</div>';
document.body.appendChild(overlay);

// ---------- 3. Show profile data everywhere on the page ----------
// Any element with data-profile="name" (or hostel, block, room, phone, email, id)
// is filled automatically, so edits show up straight away.
function refreshProfileUI() {
  var profile = getProfile(session.id);
  profile.id = session.id;

  var items = document.querySelectorAll("[data-profile]");
  for (var i = 0; i < items.length; i++) {
    var field = items[i].getAttribute("data-profile");
    items[i].textContent = profile[field] || "-";
  }

  // Initials for the circular icon
  var parts = profile.name.trim().split(" ");
  var initials = parts[0].charAt(0);
  if (parts.length > 1) {
    initials += parts[parts.length - 1].charAt(0);
  }
  document.getElementById("avatarCircle").textContent = initials.toUpperCase();
}

// ---------- 4. Dropdown open / close ----------
var profileBtn = document.getElementById("profileBtn");
var profileMenu = document.getElementById("profileMenu");

function openMenu() {
  profileMenu.hidden = false;
  profileBtn.setAttribute("aria-expanded", "true");
}
function closeMenu() {
  profileMenu.hidden = true;
  profileBtn.setAttribute("aria-expanded", "false");
}

profileBtn.addEventListener("click", function (event) {
  event.stopPropagation();
  if (profileMenu.hidden) { openMenu(); } else { closeMenu(); }
});

// Close when clicking anywhere outside
document.addEventListener("click", function (event) {
  if (!mount.contains(event.target)) {
    closeMenu();
  }
});

// ---------- 5. Profile modal: view / edit / save ----------
var fields = ["pfName", "pfPhone", "pfEmail"];
if (isStudent) {
  fields = fields.concat(["pfHostel", "pfBlock", "pfRoom"]);
}

var editBtn = document.getElementById("editBtn");
var saveBtn = document.getElementById("saveBtn");
var cancelBtn = document.getElementById("cancelBtn");
var errorBox = document.getElementById("profileError");
var successBox = document.getElementById("profileSuccess");

// Put the saved values into the form boxes
function fillForm() {
  var p = getProfile(session.id);
  document.getElementById("pfName").value = p.name;
  document.getElementById("pfPhone").value = p.phone;
  document.getElementById("pfEmail").value = p.email;
  if (isStudent) {
    document.getElementById("pfHostel").value = p.hostel;
    document.getElementById("pfBlock").value = p.block;
    document.getElementById("pfRoom").value = p.room;
  }
}

// editing = true  -> boxes can be typed in; false -> read-only
function setEditing(editing) {
  for (var i = 0; i < fields.length; i++) {
    document.getElementById(fields[i]).disabled = !editing;
  }
  editBtn.hidden = editing;
  saveBtn.hidden = !editing;
  cancelBtn.hidden = !editing;
}

function openProfile() {
  closeMenu();
  fillForm();
  setEditing(false);
  errorBox.hidden = true;
  successBox.hidden = true;
  overlay.hidden = false;
}
function closeProfile() {
  overlay.hidden = true;
}

document.getElementById("menuProfile").addEventListener("click", openProfile);
document.getElementById("closeProfile").addEventListener("click", closeProfile);
overlay.addEventListener("click", function (event) {
  if (event.target === overlay) { closeProfile(); }
});
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closeMenu();
    closeProfile();
  }
});

editBtn.addEventListener("click", function () {
  successBox.hidden = true;
  setEditing(true);
});

cancelBtn.addEventListener("click", function () {
  fillForm();               // throw away unsaved typing
  errorBox.hidden = true;
  setEditing(false);
});

// Check the form. Returns a list of problems (empty list = all good).
function validateForm() {
  var problems = [];
  if (document.getElementById("pfName").value.trim() === "") {
    problems.push("Full name is required.");
  }
  if (isStudent) {
    if (document.getElementById("pfHostel").value.trim() === "") {
      problems.push("Hostel name is required.");
    }
    if (document.getElementById("pfBlock").value.trim() === "") {
      problems.push("Hostel block is required.");
    }
    if (document.getElementById("pfRoom").value.trim() === "") {
      problems.push("Room number is required.");
    }
  }
  var phone = document.getElementById("pfPhone").value.trim();
  if (phone === "") {
    problems.push("Phone number is required.");
  } else if (!/^[0-9]{10}$/.test(phone)) {
    problems.push("Phone number must be 10 digits.");
  }
  var email = document.getElementById("pfEmail").value.trim();
  if (email === "") {
    problems.push("Email address is required.");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    problems.push("Please enter a valid email address.");
  }
  return problems;
}

saveBtn.addEventListener("click", function () {
  var problems = validateForm();
  if (problems.length > 0) {
    errorBox.innerHTML = problems.join("<br>");
    errorBox.hidden = false;
    return;
  }

  // Only profile details are saved. The ID and password are untouched.
  var updated = {
    name: document.getElementById("pfName").value.trim(),
    phone: document.getElementById("pfPhone").value.trim(),
    email: document.getElementById("pfEmail").value.trim()
  };
  if (isStudent) {
    updated.hostel = document.getElementById("pfHostel").value.trim();
    updated.block = document.getElementById("pfBlock").value.trim();
    updated.room = document.getElementById("pfRoom").value.trim();
  }
  saveProfile(session.id, updated);

  errorBox.hidden = true;
  setEditing(false);
  refreshProfileUI();
  successBox.textContent = "Profile updated successfully.";
  successBox.hidden = false;
});

// ---------- 6. Logout ----------
document.getElementById("menuLogout").addEventListener("click", function () {
  closeMenu();
  if (confirm("Are you sure you want to log out?")) {
    logout();
  }
});

refreshProfileUI();
