// auth.js - login check, session handling, page protection, logout

// Find a user whose ID and password both match (ID is not case-sensitive)
function findUser(id, password) {
  var cleanId = id.trim().toUpperCase();
  for (var i = 0; i < USERS.length; i++) {
    if (USERS[i].id.toUpperCase() === cleanId && USERS[i].password === password) {
      return USERS[i];
    }
  }
  return null;
}

// Remember the logged-in user (only ID and role, never the password)
function startSession(user) {
  var session = { id: user.id, role: user.role };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

// Returns the current session object, or null when nobody is logged in
function getSession() {
  var raw = sessionStorage.getItem(SESSION_KEY);
  if (raw) {
    return JSON.parse(raw);
  }
  return null;
}

// Page of the dashboard that belongs to a role
function dashboardFor(role) {
  for (var i = 0; i < USERS.length; i++) {
    if (USERS[i].role === role) {
      return USERS[i].page;
    }
  }
  return "login.html";
}

// Call on every dashboard. Sends the visitor to login if they are not
// logged in, or if they are logged in as a different role.
function requireLogin(role) {
  var session = getSession();
  if (session === null || session.role !== role) {
    window.location.replace("login.html");
    return false;
  }
  return true;
}

// Log out: clear the session only. Parcels, history and profiles stay saved.
function logout() {
  sessionStorage.removeItem(SESSION_KEY);
  window.location.replace("login.html");
}
