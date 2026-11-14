CAMPUS PARCEL MANAGEMENT SYSTEM - Login, Profile and Navigation
================================================================

HOW TO RUN
1. Unzip the folder.
2. Open HTML/login.html in a web browser (Chrome, Edge or Firefox).
No server, no installation, no internet needed.

FOLDERS
HTML/    login.html, student.html, operator.html, guard.html
CSS/     style.css (emerald, cream, white, grey and gold theme)
JS/      data.js      demo users, default profiles, localStorage helpers
         auth.js      login check, session, page protection, logout
         login.js     login form
         profile.js   top-right profile icon, dropdown, profile editor, logout
         dashboard.js navbar section switching
assets/  (empty - for images later)

DEMO LOGIN CREDENTIALS
Role               Login ID     Password
Student            12345678     student123
UniMall Operator   UNIMALL01    unimall123
Security Guard     GUARD01      guard123

Both the ID and the password are required. The role is detected
automatically from the ID, and you are sent to the matching dashboard.

IMPORTANT - NOT SECURE
These credentials are demonstration only. They are written in plain text
inside JavaScript files that anyone can open and read, and the login check
happens in the browser. This is NOT real authentication and must never be
used for a production system. Real systems check passwords on a secure
server and store them hashed.

HOW IT WORKS
- Session: sessionStorage key "campusSession" holds the ID and role while
  you are logged in. Log Out removes it.
- Page protection: every dashboard checks the session first. Not logged in,
  or logged in as another role -> redirected to login.html.
- Profiles: edits are saved in localStorage key "campusProfiles" and stay
  after logout. Only name, hostel, block, room, phone and email can be
  edited. The ID is shown as plain read-only text and is never saved or
  changed. Profile edits never touch login credentials.
- Log Out asks "Are you sure you want to log out?" and clears only the
  session. Parcels, history and profiles stay saved.
- To reset saved profiles, clear this site's localStorage in browser
  developer tools.

NAVIGATION (horizontal top bar, no sidebar)
Student:   Overview | My UniMall Parcels | Register Quick Delivery |
           My Quick Deliveries | Delivery History
Operator:  Overview | Register E-commerce Parcel | E-commerce Parcel Board |
           Verify Collection
Guard:     Overview | Quick-commerce Notifications | Verify Collection |
           Quick-commerce Records
Top-right: notification bell (student and guard), circular profile icon,
           name and dropdown arrow -> My Profile / Log Out.

NOTE ON PARCEL FEATURES
Demo parcels and quick-commerce deliveries have been implemented and pre-loaded
into localStorage with realistic examples for all roles:
- Student (Aarav Sharma - 12345678):
  * UniMall Parcels: Amazon (Mouse, Locker L-14, OTP 582910), Flipkart (Textbook, Rack B-03, OTP 319402)
  * Quick-Commerce Deliveries: Blinkit (At Main Gate #1, Pass QC-8419), Zepto (On the way, Pass QC-3912)
  * Delivery History: Past collected Amazon, Myntra, BlueDart & Swiggy deliveries
  * Register Quick Delivery form generates new gate passes instantly.
  * Active notifications bell badge shows ready pickups and gate alerts.
- UniMall Operator (UNIMALL01):
  * Parcel intake registration with auto OTP generation.
  * Searchable & filterable E-Commerce Parcel Board.
  * Instant counter collection verification by OTP, Student ID, or Tracking #.
- Security Guard (GUARD01):
  * Real-time gate delivery arrivals with "Mark Arrived" and student contact.
  * Gate Pass verification form (by QC code or Student ID) to hand over orders.
  * Comprehensive gate log records.
- "Reset Demo Data" button available on dashboards to restore initial samples.

TESTING
TEST 9  Login: correct ID + password opens the right dashboard; wrong
        password is rejected; ID only is rejected; opening a dashboard
        file without logging in goes to login.
TEST 10 Dropdown: click the top-right profile icon -> My Profile and
        Log Out show; clicking outside closes it.
TEST 11 Profile editing: My Profile -> Edit Profile -> change hostel,
        block, room -> Save -> refresh -> changes remain; ID unchanged.
TEST 12 Logout: Log Out -> confirm -> login page shows; dashboard access
        is denied; log in again and saved data is still there.
