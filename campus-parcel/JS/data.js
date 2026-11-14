// data.js - demo users, default profiles, demo parcels, and storage helpers
// NOTE: Frontend-only demo. These credentials are NOT secure.

// Predefined demo accounts (array of objects)
var USERS = [
  { id: "12345678",  password: "student123", role: "student",  page: "student.html" },
  { id: "UNIMALL01", password: "unimall123", role: "operator", page: "operator.html" },
  { id: "GUARD01",   password: "guard123",   role: "guard",    page: "guard.html" }
];

// Starting profile details for each account
var DEFAULT_PROFILES = {
  "12345678": {
    name: "Aarav Sharma",
    hostel: "Himalaya Hostel",
    block: "B",
    room: "214",
    phone: "9876543210",
    email: "aarav.sharma@university.edu"
  },
  "UNIMALL01": {
    name: "Meera Kapoor",
    phone: "9811122233",
    email: "meera.kapoor@university.edu"
  },
  "GUARD01": {
    name: "Harpreet Singh",
    phone: "9822211144",
    email: "harpreet.singh@university.edu"
  },
  "12601452": {
    name: "Priya Patel",
    hostel: "Shivalik Hostel",
    block: "A",
    room: "108",
    phone: "9871122334",
    email: "priya.patel@university.edu"
  },
  "12601890": {
    name: "Rohan Verma",
    hostel: "Aravali Hostel",
    block: "C",
    room: "305",
    phone: "9872233445",
    email: "rohan.verma@university.edu"
  }
};

// Default Demo Parcels (UniMall E-Commerce)
var DEFAULT_PARCELS = [
  {
    id: "PKG-1001",
    studentId: "12345678",
    studentName: "Aarav Sharma",
    carrier: "Amazon",
    trackingNumber: "TBA309812491200",
    description: "Logitech MX Master 3S Wireless Mouse",
    shelf: "Locker L-14",
    receivedDate: "14 Nov 2026, 09:15 AM",
    arrivedDate: "14 Nov 2026, 09:30 AM",
    pickupCode: "582910",
    status: "Ready for Pickup",
    collectedDate: null,
    verifiedBy: null
  },
  {
    id: "PKG-1002",
    studentId: "12345678",
    studentName: "Aarav Sharma",
    carrier: "Flipkart",
    trackingNumber: "FMPP782910248",
    description: "Algorithms & Data Structures Textbook",
    shelf: "Rack B-03",
    receivedDate: "14 Nov 2026, 10:00 AM",
    arrivedDate: "14 Nov 2026, 10:15 AM",
    pickupCode: "319402",
    status: "Ready for Pickup",
    collectedDate: null,
    verifiedBy: null
  },
  {
    id: "PKG-1003",
    studentId: "12345678",
    studentName: "Aarav Sharma",
    carrier: "Myntra",
    trackingNumber: "MYN981203410",
    description: "Puma Winter Fleece Hoodie (Size L)",
    shelf: "Rack A-08",
    receivedDate: "13 Nov 2026, 03:20 PM",
    arrivedDate: "13 Nov 2026, 03:40 PM",
    pickupCode: "740192",
    status: "Collected",
    collectedDate: "13 Nov 2026, 05:20 PM",
    verifiedBy: "Meera Kapoor (UNIMALL01)"
  },
  {
    id: "PKG-1004",
    studentId: "12345678",
    studentName: "Aarav Sharma",
    carrier: "BlueDart",
    trackingNumber: "BD882910394IN",
    description: "College ID Card & Official Documents",
    shelf: "Locker L-02",
    receivedDate: "12 Nov 2026, 10:30 AM",
    arrivedDate: "12 Nov 2026, 11:00 AM",
    pickupCode: "629014",
    status: "Collected",
    collectedDate: "12 Nov 2026, 01:15 PM",
    verifiedBy: "Meera Kapoor (UNIMALL01)"
  },
  {
    id: "PKG-1005",
    studentId: "12601452",
    studentName: "Priya Patel",
    carrier: "Delhivery",
    trackingNumber: "DEL552819034",
    description: "Noise-Cancelling Over-Ear Headphones",
    shelf: "Rack C-05",
    receivedDate: "14 Nov 2026, 08:25 AM",
    arrivedDate: "14 Nov 2026, 08:45 AM",
    pickupCode: "882103",
    status: "Ready for Pickup",
    collectedDate: null,
    verifiedBy: null
  },
  {
    id: "PKG-1006",
    studentId: "12601890",
    studentName: "Rohan Verma",
    carrier: "Amazon",
    trackingNumber: "TBA881290312019",
    description: "Aluminium Ergonomic Laptop Stand",
    shelf: "Rack A-02",
    receivedDate: "14 Nov 2026, 10:30 AM",
    arrivedDate: "14 Nov 2026, 10:50 AM",
    pickupCode: "194827",
    status: "Ready for Pickup",
    collectedDate: null,
    verifiedBy: null
  },
  {
    id: "PKG-1007",
    studentId: "12601452",
    studentName: "Priya Patel",
    carrier: "Amazon",
    trackingNumber: "TBA441902819442",
    description: "Casio Scientific Calculator FX-991CW",
    shelf: "Locker L-08",
    receivedDate: "13 Nov 2026, 03:50 PM",
    arrivedDate: "13 Nov 2026, 04:10 PM",
    pickupCode: "405819",
    status: "Collected",
    collectedDate: "13 Nov 2026, 06:05 PM",
    verifiedBy: "Meera Kapoor (UNIMALL01)"
  }
];

// Default Demo Quick-Commerce Deliveries
var DEFAULT_QUICK_DELIVERIES = [
  {
    id: "QC-2001",
    studentId: "12345678",
    studentName: "Aarav Sharma",
    studentHostel: "Himalaya Hostel, B-214",
    studentPhone: "9876543210",
    vendor: "Blinkit",
    orderRef: "BLNK-981273",
    items: "Cold Coffee, Protein Bars & Mixed Nuts",
    gate: "Main Campus Gate #1",
    riderName: "Ramesh Kumar",
    riderPhone: "9812345678",
    riderVehicle: "PB 08 AB 4219 (Hero Splendor)",
    status: "At Main Gate",
    passCode: "QC-8419",
    requestedAt: "14 Nov 2026, 11:15 AM",
    arrivedAtGate: "14 Nov 2026, 11:28 AM",
    collectedAt: null,
    guardNotes: "Waiting at Visitor Bay 2"
  },
  {
    id: "QC-2002",
    studentId: "12345678",
    studentName: "Aarav Sharma",
    studentHostel: "Himalaya Hostel, B-214",
    studentPhone: "9876543210",
    vendor: "Zepto",
    orderRef: "ZPT-448102",
    items: "Fresh Milk, Bananas & Whole Wheat Bread",
    gate: "Main Campus Gate #1",
    riderName: "Vikram Singh",
    riderPhone: "9823456789",
    riderVehicle: "PB 08 CD 7192 (Honda Activa)",
    status: "On the way",
    passCode: "QC-3912",
    requestedAt: "14 Nov 2026, 11:25 AM",
    arrivedAtGate: null,
    collectedAt: null,
    guardNotes: "ETA ~8 mins"
  },
  {
    id: "QC-2003",
    studentId: "12345678",
    studentName: "Aarav Sharma",
    studentHostel: "Himalaya Hostel, B-214",
    studentPhone: "9876543210",
    vendor: "Swiggy Instamart",
    orderRef: "SWIG-331092",
    items: "Late Night Snack Pack & Green Tea",
    gate: "Main Campus Gate #1",
    riderName: "Deepak Sharma",
    riderPhone: "9834567890",
    riderVehicle: "PB 08 EF 8820 (Bajaj Pulsar)",
    status: "Collected",
    passCode: "QC-1094",
    requestedAt: "13 Nov 2026, 09:10 PM",
    arrivedAtGate: "13 Nov 2026, 09:24 PM",
    collectedAt: "13 Nov 2026, 09:35 PM",
    guardNotes: "Verified by Guard Harpreet Singh"
  },
  {
    id: "QC-2004",
    studentId: "12601452",
    studentName: "Priya Patel",
    studentHostel: "Shivalik Hostel, A-108",
    studentPhone: "9871122334",
    vendor: "Zomato",
    orderRef: "ZOM-771829",
    items: "Subway Veggie Delite Combo",
    gate: "Main Campus Gate #2",
    riderName: "Amit Verma",
    riderPhone: "9845678901",
    riderVehicle: "PB 08 GH 1144",
    status: "At Main Gate",
    passCode: "QC-5521",
    requestedAt: "14 Nov 2026, 11:20 AM",
    arrivedAtGate: "14 Nov 2026, 11:32 AM",
    collectedAt: null,
    guardNotes: "Gate #2 Visitor Booth"
  }
];

var PROFILE_KEY = "campusProfiles";           // localStorage: edited profiles
var SESSION_KEY = "campusSession";            // sessionStorage: active login
var PARCEL_KEY = "campusParcels";             // localStorage: e-commerce parcels
var QUICK_DELIVERY_KEY = "campusQuickDelivs"; // localStorage: quick-commerce orders

// Auto-migrate legacy demo id 12601271 -> 12345678 if present in storage
(function migrateLegacyId() {
  try {
    var rawProf = localStorage.getItem(PROFILE_KEY);
    if (rawProf && rawProf.indexOf("12601271") !== -1) {
      localStorage.setItem(PROFILE_KEY, rawProf.replace(/"12601271"/g, '"12345678"'));
    }
    var rawParcels = localStorage.getItem(PARCEL_KEY);
    if (rawParcels && rawParcels.indexOf("12601271") !== -1) {
      localStorage.setItem(PARCEL_KEY, rawParcels.replace(/"12601271"/g, '"12345678"'));
    }
    var rawQuick = localStorage.getItem(QUICK_DELIVERY_KEY);
    if (rawQuick && rawQuick.indexOf("12601271") !== -1) {
      localStorage.setItem(QUICK_DELIVERY_KEY, rawQuick.replace(/"12601271"/g, '"12345678"'));
    }
    var rawSess = sessionStorage.getItem(SESSION_KEY);
    if (rawSess && rawSess.indexOf("12601271") !== -1) {
      sessionStorage.setItem(SESSION_KEY, rawSess.replace(/"12601271"/g, '"12345678"'));
    }
  } catch (e) {}
})();

// Read all saved profiles from localStorage
function getSavedProfiles() {
  var raw = localStorage.getItem(PROFILE_KEY);
  if (raw) {
    try { return JSON.parse(raw); } catch (e) {}
  }
  return {};
}

// Get one user's profile: saved changes win over the defaults
function getProfile(id) {
  var profile = {};
  var defaults = DEFAULT_PROFILES[id] || {};
  var saved = getSavedProfiles()[id] || {};
  var key;
  for (key in defaults) { profile[key] = defaults[key]; }
  for (key in saved)    { profile[key] = saved[key]; }
  return profile;
}

// Save one user's profile
function saveProfile(id, profile) {
  var all = getSavedProfiles();
  all[id] = profile;
  localStorage.setItem(PROFILE_KEY, JSON.stringify(all));
}

// Read all UniMall e-commerce parcels
function getParcels() {
  var raw = localStorage.getItem(PARCEL_KEY);
  if (raw) {
    try { return JSON.parse(raw); } catch (e) {}
  }
  // Initialize with demo defaults
  localStorage.setItem(PARCEL_KEY, JSON.stringify(DEFAULT_PARCELS));
  return JSON.parse(JSON.stringify(DEFAULT_PARCELS));
}

// Save all UniMall e-commerce parcels
function saveParcels(list) {
  localStorage.setItem(PARCEL_KEY, JSON.stringify(list));
}

// Add a new UniMall parcel
function addParcel(parcel) {
  var list = getParcels();
  list.unshift(parcel);
  saveParcels(list);
  return parcel;
}

// Update a parcel by ID
function updateParcel(id, updates) {
  var list = getParcels();
  for (var i = 0; i < list.length; i++) {
    if (list[i].id === id) {
      for (var k in updates) {
        list[i][k] = updates[k];
      }
      saveParcels(list);
      return list[i];
    }
  }
  return null;
}

// Read all quick-commerce deliveries
function getQuickDeliveries() {
  var raw = localStorage.getItem(QUICK_DELIVERY_KEY);
  if (raw) {
    try { return JSON.parse(raw); } catch (e) {}
  }
  // Initialize with demo defaults
  localStorage.setItem(QUICK_DELIVERY_KEY, JSON.stringify(DEFAULT_QUICK_DELIVERIES));
  return JSON.parse(JSON.stringify(DEFAULT_QUICK_DELIVERIES));
}

// Save all quick-commerce deliveries
function saveQuickDeliveries(list) {
  localStorage.setItem(QUICK_DELIVERY_KEY, JSON.stringify(list));
}

// Add a quick delivery
function addQuickDelivery(item) {
  var list = getQuickDeliveries();
  list.unshift(item);
  saveQuickDeliveries(list);
  return item;
}

// Update a quick delivery by ID
function updateQuickDelivery(id, updates) {
  var list = getQuickDeliveries();
  for (var i = 0; i < list.length; i++) {
    if (list[i].id === id) {
      for (var k in updates) {
        list[i][k] = updates[k];
      }
      saveQuickDeliveries(list);
      return list[i];
    }
  }
  return null;
}

// Reset all demo parcels and quick deliveries to original defaults
function resetDemoParcels() {
  localStorage.setItem(PARCEL_KEY, JSON.stringify(DEFAULT_PARCELS));
  localStorage.setItem(QUICK_DELIVERY_KEY, JSON.stringify(DEFAULT_QUICK_DELIVERIES));
}
