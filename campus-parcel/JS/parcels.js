// parcels.js - parcel management, rendering, forms, and live updates
// Used by student.html, operator.html, and guard.html

(function () {
  var session = getSession();
  if (!session) return;

  var role = session.role;
  var currentUserId = session.id;

  // Helper formatting functions
  function getInitials(name) {
    if (!name) return "CP";
    var parts = name.trim().split(" ");
    return (parts[0].charAt(0) + (parts.length > 1 ? parts[parts.length - 1].charAt(0) : "")).toUpperCase();
  }

  function getStatusBadge(status) {
    var cls = "badge-pill ";
    if (status === "Ready for Pickup") cls += "badge-ready";
    else if (status === "At Main Gate") cls += "badge-arrived";
    else if (status === "On the way") cls += "badge-pending";
    else if (status === "Collected") cls += "badge-collected";
    else cls += "badge-pending";
    return '<span class="' + cls + '">' + status + '</span>';
  }

  function getCurrentFormattedTime() {
    var d = new Date();
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var day = d.getDate();
    var m = months[d.getMonth()];
    var y = d.getFullYear();
    var hours = d.getHours();
    var mins = d.getMinutes();
    var ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    mins = mins < 10 ? "0" + mins : mins;
    return day + " " + m + " " + y + ", " + (hours < 10 ? "0" + hours : hours) + ":" + mins + " " + ampm;
  }

  // -------------------------------------------------------------
  // NOTIFICATIONS (Bell icon)
  // -------------------------------------------------------------
  function setupNotifications() {
    var bellBtn = document.querySelector(".bell");
    var notifCountEl = document.getElementById("notifCount");
    if (!bellBtn || !notifCountEl) return;

    var notifs = [];
    if (role === "student") {
      var myParcels = getParcels().filter(function (p) {
        return p.studentId === currentUserId && p.status === "Ready for Pickup";
      });
      var myQuick = getQuickDeliveries().filter(function (q) {
        return q.studentId === currentUserId && q.status === "At Main Gate";
      });

      myParcels.forEach(function (p) {
        notifs.push({
          title: "UniMall Parcel Ready",
          text: p.carrier + " parcel (" + p.trackingNumber + ") is ready at " + p.shelf + ". Pickup Code: " + p.pickupCode,
          time: p.arrivedDate
        });
      });

      myQuick.forEach(function (q) {
        notifs.push({
          title: "Delivery at Main Gate!",
          text: q.vendor + " order with rider " + q.riderName + " has arrived at " + q.gate + ". Pass: " + q.passCode,
          time: q.arrivedAtGate || q.requestedAt
        });
      });
    } else if (role === "guard") {
      var atGate = getQuickDeliveries().filter(function (q) {
        return q.status === "At Main Gate";
      });
      atGate.forEach(function (q) {
        notifs.push({
          title: "Rider at Gate",
          text: q.riderName + " (" + q.vendor + ") waiting for student " + q.studentName + " (" + q.studentHostel + ")",
          time: q.arrivedAtGate || q.requestedAt
        });
      });
    }

    notifCountEl.textContent = notifs.length;
    if (notifs.length > 0) {
      notifCountEl.style.display = "flex";
    } else {
      notifCountEl.style.display = "none";
    }

    // Dropdown toggle
    var existingMenu = document.getElementById("notifDropdownMenu");
    if (!existingMenu) {
      var notifMenu = document.createElement("div");
      notifMenu.id = "notifDropdownMenu";
      notifMenu.className = "notification-menu";
      notifMenu.hidden = true;
      bellBtn.parentNode.style.position = "relative";
      bellBtn.parentNode.appendChild(notifMenu);

      bellBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        var isHidden = notifMenu.hidden;
        notifMenu.hidden = !isHidden;
      });

      document.addEventListener("click", function (e) {
        if (!notifMenu.contains(e.target) && e.target !== bellBtn) {
          notifMenu.hidden = true;
        }
      });
    }

    var menu = document.getElementById("notifDropdownMenu");
    if (menu) {
      if (notifs.length === 0) {
        menu.innerHTML = '<div style="padding: 1rem; text-align: center; color: var(--grey);">No new notifications</div>';
      } else {
        var html = '<div style="font-weight: 700; color: var(--forest); padding: 0.4rem 0.6rem; border-bottom: 1px solid var(--grey-light);">Notifications (' + notifs.length + ')</div>';
        notifs.forEach(function (n) {
          html += '<div class="notification-item">' +
            '<div style="font-weight: 600; color: var(--forest);">' + n.title + '</div>' +
            '<div style="font-size: 0.85rem; color: #333; margin: 2px 0;">' + n.text + '</div>' +
            '<div style="font-size: 0.75rem; color: var(--grey);">' + n.time + '</div>' +
          '</div>';
        });
        menu.innerHTML = html;
      }
    }
  }

  // -------------------------------------------------------------
  // STUDENT DASHBOARD LOGIC
  // -------------------------------------------------------------
  function initStudentDashboard() {
    renderStudentOverview();
    renderStudentUniMallParcels();
    setupStudentQuickRegisterForm();
    renderStudentQuickDeliveries();
    renderStudentHistory();
    setupNotifications();
  }

  function renderStudentOverview() {
    var allParcels = getParcels().filter(function (p) { return p.studentId === currentUserId; });
    var allQuick = getQuickDeliveries().filter(function (q) { return q.studentId === currentUserId; });

    var readyParcels = allParcels.filter(function (p) { return p.status === "Ready for Pickup"; });
    var atGateQuick = allQuick.filter(function (q) { return q.status === "At Main Gate"; });
    var onTheWayQuick = allQuick.filter(function (q) { return q.status === "On the way"; });
    var collectedTotal = allParcels.filter(function (p) { return p.status === "Collected"; }).length +
                         allQuick.filter(function (q) { return q.status === "Collected"; }).length;

    var container = document.getElementById("overviewStatsMount");
    if (!container) {
      container = document.createElement("div");
      container.id = "overviewStatsMount";
      var overviewSec = document.getElementById("overview");
      if (overviewSec) overviewSec.appendChild(container);
    }

    container.innerHTML =
      '<div class="stats-grid">' +
        '<div class="stat-card stat-emerald">' +
          '<div class="stat-number">' + readyParcels.length + '</div>' +
          '<div class="stat-label">UniMall Parcels Ready for Pickup</div>' +
        '</div>' +
        '<div class="stat-card stat-gold">' +
          '<div class="stat-number">' + atGateQuick.length + '</div>' +
          '<div class="stat-label">Quick Deliveries at Main Gate</div>' +
        '</div>' +
        '<div class="stat-card stat-forest">' +
          '<div class="stat-number">' + onTheWayQuick.length + '</div>' +
          '<div class="stat-label">Quick Deliveries on the Way</div>' +
        '</div>' +
        '<div class="stat-card">' +
          '<div class="stat-number">' + collectedTotal + '</div>' +
          '<div class="stat-label">Total Past Deliveries Collected</div>' +
        '</div>' +
      '</div>' +
      '<div class="card" style="margin-top: 1rem;">' +
        '<div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.75rem;">' +
          '<h3 style="margin: 0;">Quick Actions & Active Alerts</h3>' +
          '<button type="button" class="btn btn-ghost" id="resetDemoBtn" style="font-size: 0.82rem; padding: 0.35rem 0.75rem;">Reset Demo Data</button>' +
        '</div>' +
        (readyParcels.length > 0 || atGateQuick.length > 0 ?
          '<div class="alert-box" style="background: var(--ok-bg); border: 1px solid #bce1ce; padding: 0.85rem 1rem; border-radius: 8px; margin-bottom: 1rem;">' +
            '<strong>Action Required:</strong> You have ' + (readyParcels.length + atGateQuick.length) + ' delivery items waiting for pickup right now.' +
          '</div>' : '') +
        '<div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">' +
          '<button type="button" class="btn btn-primary" onclick="showSection(\'my-parcels\')">View UniMall Parcels (' + readyParcels.length + ')</button>' +
          '<button type="button" class="btn btn-primary" style="background: var(--gold);" onclick="showSection(\'register-quick\')">+ Register Quick Delivery</button>' +
          '<button type="button" class="btn btn-ghost" onclick="showSection(\'my-quick\')">View Quick Deliveries (' + (atGateQuick.length + onTheWayQuick.length) + ')</button>' +
        '</div>' +
      '</div>';

    var rBtn = document.getElementById("resetDemoBtn");
    if (rBtn) {
      rBtn.addEventListener("click", function () {
        if (confirm("Reset demo parcels and quick deliveries to original examples?")) {
          resetDemoParcels();
          initStudentDashboard();
        }
      });
    }
  }

  function renderStudentUniMallParcels() {
    var mount = document.getElementById("my-parcels");
    if (!mount) return;

    var parcels = getParcels().filter(function (p) { return p.studentId === currentUserId; });

    mount.innerHTML =
      '<div class="card">' +
        '<div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem;">' +
          '<div>' +
            '<h2>My UniMall E-Commerce Parcels</h2>' +
            '<p>Show your 6-digit Pickup Code to the UniMall operator to collect your parcel.</p>' +
          '</div>' +
          '<div class="filter-bar">' +
            '<select id="studentParcelFilter" class="filter-select">' +
              '<option value="all">All Parcels</option>' +
              '<option value="ready" selected>Ready for Pickup</option>' +
              '<option value="collected">Collected</option>' +
            '</select>' +
          '</div>' +
        '</div>' +
        '<div id="studentParcelList"></div>' +
      '</div>';

    var filterSelect = document.getElementById("studentParcelFilter");
    var listEl = document.getElementById("studentParcelList");

    function renderList() {
      var filterVal = filterSelect.value;
      var filtered = parcels.filter(function (p) {
        if (filterVal === "ready") return p.status === "Ready for Pickup";
        if (filterVal === "collected") return p.status === "Collected";
        return true;
      });

      if (filtered.length === 0) {
        listEl.innerHTML = '<div class="empty-state"><p>No parcels found in this category.</p></div>';
        return;
      }

      var html = "";
      filtered.forEach(function (p) {
        var isReady = p.status === "Ready for Pickup";
        html +=
          '<div class="parcel-card">' +
            '<div class="parcel-card-header">' +
              '<div>' +
                '<strong style="font-size: 1.1rem; color: var(--forest);">' + p.carrier + '</strong> ' +
                '<span style="color: var(--grey); font-size: 0.9rem;">&bull; Tracking: ' + p.trackingNumber + '</span>' +
              '</div>' +
              '<div>' + getStatusBadge(p.status) + '</div>' +
            '</div>' +
            '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75rem; margin: 0.75rem 0;">' +
              '<div><span style="font-size: 0.8rem; color: var(--grey); display: block;">Item Description</span><strong>' + p.description + '</strong></div>' +
              '<div><span style="font-size: 0.8rem; color: var(--grey); display: block;">Storage Location</span><strong style="color: var(--emerald-dark);">' + p.shelf + '</strong></div>' +
              '<div><span style="font-size: 0.8rem; color: var(--grey); display: block;">Arrived At</span><span>' + p.arrivedDate + '</span></div>' +
              '<div>' +
                '<span style="font-size: 0.8rem; color: var(--grey); display: block;">Pickup OTP</span>' +
                (isReady ?
                  '<span class="parcel-otp" title="Show this code to UniMall operator">' + p.pickupCode + '</span>' :
                  '<span style="color: var(--grey); font-size: 0.9rem;">Collected on ' + (p.collectedDate || 'earlier') + '</span>') +
              '</div>' +
            '</div>' +
            (isReady ?
              '<div style="background: var(--cream); padding: 0.6rem 0.85rem; border-radius: 6px; font-size: 0.85rem; color: var(--grey); display: flex; align-items: center; gap: 0.5rem;">' +
                '<span style="color: var(--forest); font-weight: 600;">Pickup Instructions:</span> Visit UniMall Counter &rarr; provide code <strong>' + p.pickupCode + '</strong> or your Student ID.' +
              '</div>' : '') +
          '</div>';
      });
      listEl.innerHTML = html;
    }

    filterSelect.addEventListener("change", renderList);
    renderList();
  }

  function setupStudentQuickRegisterForm() {
    var mount = document.getElementById("register-quick");
    if (!mount) return;

    var profile = getProfile(currentUserId);

    mount.innerHTML =
      '<div class="card">' +
        '<h2>Register Quick Delivery (Blinkit, Zepto, Swiggy, etc.)</h2>' +
        '<p>Register your incoming quick commerce delivery so security guards can clear the rider at the campus gate.</p>' +
        '<div id="quickFormMsg" class="form-success" hidden></div>' +
        '<form id="quickDeliveryForm" style="margin-top: 1.25rem;">' +
          '<div class="form-grid">' +
            '<label>Delivery Platform / App' +
              '<select id="qcVendor" class="filter-select" style="width: 100%; margin-top: 0.3rem;" required>' +
                '<option value="Blinkit">Blinkit (10-15 min)</option>' +
                '<option value="Zepto">Zepto (10 min)</option>' +
                '<option value="Swiggy Instamart">Swiggy Instamart</option>' +
                '<option value="Zomato">Zomato / Food Delivery</option>' +
                '<option value="Other">Other Quick Delivery</option>' +
              '</select>' +
            '</label>' +
            '<label>Order Reference / Order ID' +
              '<input type="text" id="qcOrderRef" placeholder="e.g. BLNK-882190" required>' +
            '</label>' +
            '<label>Delivery Gate Location' +
              '<select id="qcGate" class="filter-select" style="width: 100%; margin-top: 0.3rem;">' +
                '<option value="Main Campus Gate #1">Main Campus Gate #1 (Primary)</option>' +
                '<option value="Main Campus Gate #2">Main Campus Gate #2 (East Gate)</option>' +
                '<option value="Hostel Gate #3">Hostel Gate #3</option>' +
              '</select>' +
            '</label>' +
            '<label>Rider Name & Vehicle (Optional)' +
              '<input type="text" id="qcRider" placeholder="e.g. Manoj (PB 08 ...)">' +
            '</label>' +
            '<label style="grid-column: 1 / -1;">Items / Description' +
              '<input type="text" id="qcItems" placeholder="e.g. Groceries, Snacks, Dinner Combo" required>' +
            '</label>' +
          '</div>' +
          '<div style="margin-top: 1.5rem; display: flex; gap: 0.75rem;">' +
            '<button type="submit" class="btn btn-primary">Register Delivery & Generate Gate Pass</button>' +
            '<button type="reset" class="btn btn-ghost">Reset</button>' +
          '</div>' +
        '</form>' +
      '</div>';

    var form = document.getElementById("quickDeliveryForm");
    var msg = document.getElementById("quickFormMsg");

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var vendor = document.getElementById("qcVendor").value;
      var orderRef = document.getElementById("qcOrderRef").value.trim();
      var gate = document.getElementById("qcGate").value;
      var rider = document.getElementById("qcRider").value.trim() || "Assigned by " + vendor;
      var items = document.getElementById("qcItems").value.trim();

      var passNum = Math.floor(1000 + Math.random() * 9000);
      var newPassCode = "QC-" + passNum;
      var newId = "QC-" + (Date.now() % 100000);

      var newDelivery = {
        id: newId,
        studentId: currentUserId,
        studentName: profile.name || "Aarav Sharma",
        studentHostel: (profile.hostel ? profile.hostel + ", " + profile.block + "-" + profile.room : "Himalaya Hostel, B-214"),
        studentPhone: profile.phone || "9876543210",
        vendor: vendor,
        orderRef: orderRef,
        items: items,
        gate: gate,
        riderName: rider,
        riderPhone: "98" + Math.floor(10000000 + Math.random() * 90000000),
        riderVehicle: "PB 08 " + String.fromCharCode(65 + Math.floor(Math.random() * 26)) + String.fromCharCode(65 + Math.floor(Math.random() * 26)) + " " + Math.floor(1000 + Math.random() * 9000),
        status: "On the way",
        passCode: newPassCode,
        requestedAt: getCurrentFormattedTime(),
        arrivedAtGate: null,
        collectedAt: null,
        guardNotes: "Registered by student"
      };

      addQuickDelivery(newDelivery);

      msg.innerHTML = '<strong>Success!</strong> Delivery registered. Gate Pass Code: <strong style="font-size: 1.15rem; color: var(--forest); background: var(--cream); padding: 0.2rem 0.5rem; border-radius: 4px;">' + newPassCode + '</strong>. Gate guards will verify this code when the rider arrives.';
      msg.hidden = false;
      form.reset();

      renderStudentOverview();
      renderStudentQuickDeliveries();
      setupNotifications();

      setTimeout(function () {
        showSection("my-quick");
      }, 1500);
    });
  }

  function renderStudentQuickDeliveries() {
    var mount = document.getElementById("my-quick");
    if (!mount) return;

    var list = getQuickDeliveries().filter(function (q) { return q.studentId === currentUserId; });

    var html =
      '<div class="card">' +
        '<div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem;">' +
          '<div>' +
            '<h2>My Quick Deliveries</h2>' +
            '<p>Track real-time status of your quick-commerce orders arriving at the gate.</p>' +
          '</div>' +
          '<button type="button" class="btn btn-primary" onclick="showSection(\'register-quick\')">+ Register New</button>' +
        '</div>';

    if (list.length === 0) {
      html += '<div class="empty-state"><p>No quick deliveries registered yet.</p></div>';
    } else {
      list.forEach(function (q) {
        var isAtGate = q.status === "At Main Gate";
        var isCollected = q.status === "Collected";

        html +=
          '<div class="parcel-card" style="' + (isAtGate ? 'border-color: #2196f3; background: #fafcfe;' : '') + '">' +
            '<div class="parcel-card-header">' +
              '<div>' +
                '<strong style="font-size: 1.1rem; color: var(--forest);">' + q.vendor + '</strong> ' +
                '<span style="color: var(--grey); font-size: 0.9rem;">&bull; Ref: ' + q.orderRef + '</span>' +
              '</div>' +
              '<div>' + getStatusBadge(q.status) + '</div>' +
            '</div>' +
            '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.75rem; margin: 0.75rem 0;">' +
              '<div><span style="font-size: 0.8rem; color: var(--grey); display: block;">Items</span><strong>' + q.items + '</strong></div>' +
              '<div><span style="font-size: 0.8rem; color: var(--grey); display: block;">Designated Gate</span><strong>' + q.gate + '</strong></div>' +
              '<div><span style="font-size: 0.8rem; color: var(--grey); display: block;">Delivery Rider</span><strong>' + q.riderName + '</strong> <span style="font-size: 0.85rem; color: var(--grey);">' + (q.riderPhone ? '(' + q.riderPhone + ')' : '') + '</span></div>' +
              '<div>' +
                '<span style="font-size: 0.8rem; color: var(--grey); display: block;">Gate Pass Code</span>' +
                '<span class="parcel-otp">' + q.passCode + '</span>' +
              '</div>' +
            '</div>' +
            '<div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.5rem; font-size: 0.85rem; color: var(--grey);">' +
              '<span>' + (q.arrivedAtGate ? 'Arrived at Gate: ' + q.arrivedAtGate : 'Registered: ' + q.requestedAt) + '</span>' +
              (!isCollected ?
                '<button type="button" class="btn btn-ghost mark-qc-collected-btn" data-id="' + q.id + '" style="font-size: 0.85rem; padding: 0.35rem 0.75rem;">Mark as Collected</button>' :
                '<span style="color: var(--emerald-dark); font-weight: 600;">Collected at ' + (q.collectedAt || 'Gate') + '</span>') +
            '</div>' +
          '</div>';
      });
    }

    html += '</div>';
    mount.innerHTML = html;

    // Attach mark collected buttons
    var btns = mount.querySelectorAll(".mark-qc-collected-btn");
    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        var id = this.getAttribute("data-id");
        if (confirm("Confirm that you have collected this delivery from the gate/rider?")) {
          updateQuickDelivery(id, {
            status: "Collected",
            collectedAt: getCurrentFormattedTime()
          });
          initStudentDashboard();
        }
      });
    });
  }

  function renderStudentHistory() {
    var mount = document.getElementById("history");
    if (!mount) return;

    var collectedParcels = getParcels().filter(function (p) {
      return p.studentId === currentUserId && p.status === "Collected";
    });
    var collectedQuick = getQuickDeliveries().filter(function (q) {
      return q.studentId === currentUserId && q.status === "Collected";
    });

    var historyItems = [];
    collectedParcels.forEach(function (p) {
      historyItems.push({
        type: "UniMall Parcel",
        source: p.carrier,
        ref: p.trackingNumber,
        desc: p.description,
        collectedOn: p.collectedDate || p.arrivedDate,
        verifiedBy: p.verifiedBy || "UniMall Operator"
      });
    });
    collectedQuick.forEach(function (q) {
      historyItems.push({
        type: "Quick Commerce",
        source: q.vendor,
        ref: q.passCode + " (" + q.orderRef + ")",
        desc: q.items,
        collectedOn: q.collectedAt || q.requestedAt,
        verifiedBy: "Gate Guard / Self"
      });
    });

    var html =
      '<div class="card">' +
        '<h2>Delivery History</h2>' +
        '<p>Complete history of all parcels and quick commerce items you have collected.</p>';

    if (historyItems.length === 0) {
      html += '<div class="empty-state"><p>No collection history available.</p></div>';
    } else {
      html +=
        '<div class="table-responsive">' +
          '<table class="parcel-table">' +
            '<thead>' +
              '<tr>' +
                '<th>Type</th>' +
                '<th>Provider / Carrier</th>' +
                '<th>Reference / Tracking</th>' +
                '<th>Description</th>' +
                '<th>Collection Date</th>' +
                '<th>Verified By</th>' +
                '<th>Status</th>' +
              '</tr>' +
            '</thead>' +
            '<tbody>';
      historyItems.forEach(function (item) {
        html +=
          '<tr>' +
            '<td><strong>' + item.type + '</strong></td>' +
            '<td>' + item.source + '</td>' +
            '<td><code>' + item.ref + '</code></td>' +
            '<td>' + item.desc + '</td>' +
            '<td>' + item.collectedOn + '</td>' +
            '<td>' + item.verifiedBy + '</td>' +
            '<td><span class="badge-pill badge-collected">Delivered</span></td>' +
          '</tr>';
      });
      html += '</tbody></table></div>';
    }

    html += '</div>';
    mount.innerHTML = html;
  }

  // -------------------------------------------------------------
  // OPERATOR DASHBOARD LOGIC
  // -------------------------------------------------------------
  function initOperatorDashboard() {
    renderOperatorOverview();
    setupOperatorRegisterForm();
    renderOperatorParcelBoard();
    setupOperatorVerifyForm();
  }

  function renderOperatorOverview() {
    var parcels = getParcels();
    var readyCount = parcels.filter(function (p) { return p.status === "Ready for Pickup"; }).length;
    var collectedCount = parcels.filter(function (p) { return p.status === "Collected"; }).length;

    var container = document.getElementById("operatorStatsMount");
    if (!container) {
      container = document.createElement("div");
      container.id = "operatorStatsMount";
      var overviewSec = document.getElementById("overview");
      if (overviewSec) overviewSec.appendChild(container);
    }

    container.innerHTML =
      '<div class="stats-grid">' +
        '<div class="stat-card stat-forest">' +
          '<div class="stat-number">' + parcels.length + '</div>' +
          '<div class="stat-label">Total E-Commerce Parcels Logged</div>' +
        '</div>' +
        '<div class="stat-card stat-emerald">' +
          '<div class="stat-number">' + readyCount + '</div>' +
          '<div class="stat-label">Parcels Waiting on Shelves (Ready)</div>' +
        '</div>' +
        '<div class="stat-card stat-gold">' +
          '<div class="stat-number">' + collectedCount + '</div>' +
          '<div class="stat-label">Parcels Successfully Handed Over</div>' +
        '</div>' +
      '</div>' +
      '<div class="card" style="margin-top: 1rem;">' +
        '<div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.75rem;">' +
          '<h3 style="margin: 0;">Operator Quick Controls</h3>' +
          '<button type="button" class="btn btn-ghost" id="opResetDemoBtn" style="font-size: 0.82rem; padding: 0.35rem 0.75rem;">Reset Demo Data</button>' +
        '</div>' +
        '<p>Quickly intake incoming e-commerce deliveries, search parcels on the shelf, or verify student collection.</p>' +
        '<div style="display: flex; gap: 0.75rem; flex-wrap: wrap; margin-top: 1rem;">' +
          '<button type="button" class="btn btn-primary" onclick="showSection(\'register-parcel\')">+ Register New Parcel</button>' +
          '<button type="button" class="btn btn-primary" style="background: var(--gold);" onclick="showSection(\'verify\')">Verify Collection (OTP / ID)</button>' +
          '<button type="button" class="btn btn-ghost" onclick="showSection(\'parcel-board\')">Open Parcel Board (' + parcels.length + ')</button>' +
        '</div>' +
      '</div>';

    var rBtn = document.getElementById("opResetDemoBtn");
    if (rBtn) {
      rBtn.addEventListener("click", function () {
        if (confirm("Reset demo parcels to initial dataset?")) {
          resetDemoParcels();
          initOperatorDashboard();
        }
      });
    }
  }

  function setupOperatorRegisterForm() {
    var mount = document.getElementById("register-parcel");
    if (!mount) return;

    mount.innerHTML =
      '<div class="card">' +
        '<h2>Register E-Commerce Parcel Arrival</h2>' +
        '<p>Log an incoming courier package received at the UniMall counter. An automated pickup OTP will be generated for the student.</p>' +
        '<div id="opRegMsg" class="form-success" hidden></div>' +
        '<form id="operatorRegisterForm" style="margin-top: 1.25rem;">' +
          '<div class="form-grid">' +
            '<label>Student Registration ID' +
              '<input type="text" id="opRegStudentId" placeholder="e.g. 12345678" value="12345678" required>' +
            '</label>' +
            '<label>Student Full Name' +
              '<input type="text" id="opRegStudentName" placeholder="Auto-filled or type name" value="Aarav Sharma" required>' +
            '</label>' +
            '<label>Courier / Carrier' +
              '<select id="opRegCarrier" class="filter-select" style="width: 100%; margin-top: 0.3rem;" required>' +
                '<option value="Amazon">Amazon</option>' +
                '<option value="Flipkart">Flipkart</option>' +
                '<option value="BlueDart">BlueDart</option>' +
                '<option value="Delhivery">Delhivery</option>' +
                '<option value="Myntra">Myntra</option>' +
                '<option value="India Post">India Post</option>' +
                '<option value="Other Courier">Other Courier</option>' +
              '</select>' +
            '</label>' +
            '<label>Tracking / AWB Number' +
              '<input type="text" id="opRegTracking" placeholder="e.g. TBA398102941" required>' +
            '</label>' +
            '<label>Assigned Shelf / Locker Slot' +
              '<input type="text" id="opRegShelf" placeholder="e.g. Rack B-04 or Locker L-10" required>' +
            '</label>' +
            '<label>Package Description / Contents' +
              '<input type="text" id="opRegDesc" placeholder="e.g. Books, Electronics, Clothing" required>' +
            '</label>' +
          '</div>' +
          '<div style="margin-top: 1.5rem; display: flex; gap: 0.75rem;">' +
            '<button type="submit" class="btn btn-primary">Save Parcel & Generate Pickup OTP</button>' +
            '<button type="reset" class="btn btn-ghost">Clear Form</button>' +
          '</div>' +
        '</form>' +
      '</div>';

    var form = document.getElementById("operatorRegisterForm");
    var msg = document.getElementById("opRegMsg");
    var studentIdInput = document.getElementById("opRegStudentId");
    var studentNameInput = document.getElementById("opRegStudentName");

    // Auto lookup student name when typing student ID
    studentIdInput.addEventListener("input", function () {
      var id = this.value.trim();
      var profile = getProfile(id);
      if (profile && profile.name) {
        studentNameInput.value = profile.name;
      }
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var studentId = studentIdInput.value.trim();
      var studentName = studentNameInput.value.trim();
      var carrier = document.getElementById("opRegCarrier").value;
      var tracking = document.getElementById("opRegTracking").value.trim();
      var shelf = document.getElementById("opRegShelf").value.trim();
      var desc = document.getElementById("opRegDesc").value.trim();

      var randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
      var newPkgId = "PKG-" + (1000 + Math.floor(Math.random() * 9000));

      var newParcel = {
        id: newPkgId,
        studentId: studentId,
        studentName: studentName,
        carrier: carrier,
        trackingNumber: tracking,
        description: desc,
        shelf: shelf,
        arrivedDate: getCurrentFormattedTime(),
        pickupCode: randomOtp,
        status: "Ready for Pickup",
        collectedDate: null,
        verifiedBy: null
      };

      addParcel(newParcel);

      msg.innerHTML = '<strong>Parcel Registered!</strong> Assigned ID: <code>' + newPkgId + '</code> &bull; Shelf: <strong>' + shelf + '</strong> &bull; Generated OTP: <strong style="font-size: 1.15rem; color: var(--forest); background: var(--cream); padding: 0.2rem 0.5rem; border-radius: 4px;">' + randomOtp + '</strong>';
      msg.hidden = false;
      form.reset();

      renderOperatorOverview();
      renderOperatorParcelBoard();

      setTimeout(function () {
        showSection("parcel-board");
      }, 1500);
    });
  }

  function renderOperatorParcelBoard() {
    var mount = document.getElementById("parcel-board");
    if (!mount) return;

    var parcels = getParcels();

    mount.innerHTML =
      '<div class="card">' +
        '<div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem;">' +
          '<div>' +
            '<h2>E-Commerce Parcel Board</h2>' +
            '<p>Filter, locate, and hand over student parcels.</p>' +
          '</div>' +
          '<button type="button" class="btn btn-primary" onclick="showSection(\'register-parcel\')">+ Intake New Parcel</button>' +
        '</div>' +
        '<div class="filter-bar">' +
          '<input type="text" id="opSearchInput" class="search-input" placeholder="Search by Student ID, Name, or Tracking #" style="padding: 0.65rem 0.8rem; border: 1px solid #c9c5b5; border-radius: 8px;">' +
          '<select id="opStatusFilter" class="filter-select">' +
            '<option value="all">All Statuses</option>' +
            '<option value="ready" selected>Ready for Pickup</option>' +
            '<option value="collected">Collected</option>' +
          '</select>' +
        '</div>' +
        '<div id="opParcelTableContainer"></div>' +
      '</div>';

    var searchInput = document.getElementById("opSearchInput");
    var filterSelect = document.getElementById("opStatusFilter");
    var tableMount = document.getElementById("opParcelTableContainer");

    function renderTable() {
      var query = searchInput.value.trim().toLowerCase();
      var statusFilter = filterSelect.value;

      var filtered = parcels.filter(function (p) {
        var matchesStatus = true;
        if (statusFilter === "ready") matchesStatus = p.status === "Ready for Pickup";
        if (statusFilter === "collected") matchesStatus = p.status === "Collected";

        var matchesQuery = true;
        if (query) {
          matchesQuery = (p.studentId && p.studentId.toLowerCase().indexOf(query) !== -1) ||
                         (p.studentName && p.studentName.toLowerCase().indexOf(query) !== -1) ||
                         (p.trackingNumber && p.trackingNumber.toLowerCase().indexOf(query) !== -1) ||
                         (p.carrier && p.carrier.toLowerCase().indexOf(query) !== -1) ||
                         (p.shelf && p.shelf.toLowerCase().indexOf(query) !== -1);
        }
        return matchesStatus && matchesQuery;
      });

      if (filtered.length === 0) {
        tableMount.innerHTML = '<div class="empty-state"><p>No parcels match your search query.</p></div>';
        return;
      }

      var html =
        '<div class="table-responsive">' +
          '<table class="parcel-table">' +
            '<thead>' +
              '<tr>' +
                '<th>Parcel ID</th>' +
                '<th>Student</th>' +
                '<th>Carrier / Tracking</th>' +
                '<th>Contents</th>' +
                '<th>Shelf Location</th>' +
                '<th>Pickup OTP</th>' +
                '<th>Status</th>' +
                '<th>Action</th>' +
              '</tr>' +
            '</thead>' +
            '<tbody>';

      filtered.forEach(function (p) {
        var isReady = p.status === "Ready for Pickup";
        html +=
          '<tr>' +
            '<td><code>' + p.id + '</code></td>' +
            '<td><strong>' + p.studentName + '</strong><br><small style="color: var(--grey);">' + p.studentId + '</small></td>' +
            '<td><strong>' + p.carrier + '</strong><br><small style="color: var(--grey);">' + p.trackingNumber + '</small></td>' +
            '<td>' + p.description + '</td>' +
            '<td><strong style="color: var(--emerald-dark);">' + p.shelf + '</strong></td>' +
            '<td><span class="parcel-otp" style="font-size: 0.85rem; padding: 0.2rem 0.5rem;">' + p.pickupCode + '</span></td>' +
            '<td>' + getStatusBadge(p.status) + '</td>' +
            '<td>' +
              (isReady ?
                '<button type="button" class="btn btn-primary op-mark-collected-btn" data-id="' + p.id + '" style="font-size: 0.82rem; padding: 0.35rem 0.65rem;">Mark Collected</button>' :
                '<span style="font-size: 0.82rem; color: var(--grey);">Handed over</span>') +
            '</td>' +
          '</tr>';
      });

      html += '</tbody></table></div>';
      tableMount.innerHTML = html;

      // Attach mark collected buttons
      var btns = tableMount.querySelectorAll(".op-mark-collected-btn");
      btns.forEach(function (b) {
        b.addEventListener("click", function () {
          var id = this.getAttribute("data-id");
          var opProfile = getProfile(currentUserId);
          var operatorName = opProfile.name ? opProfile.name + " (" + currentUserId + ")" : currentUserId;

          if (confirm("Confirm hand over of parcel " + id + " to student?")) {
            updateParcel(id, {
              status: "Collected",
              collectedDate: getCurrentFormattedTime(),
              verifiedBy: operatorName
            });
            parcels = getParcels();
            renderOperatorOverview();
            renderTable();
          }
        });
      });
    }

    searchInput.addEventListener("input", renderTable);
    filterSelect.addEventListener("change", renderTable);
    renderTable();
  }

  function setupOperatorVerifyForm() {
    var mount = document.getElementById("verify");
    if (!mount) return;

    mount.innerHTML =
      '<div class="card">' +
        '<h2>Verify Parcel Collection at Counter</h2>' +
        '<p>Enter the 6-digit Pickup OTP, Student ID, or Tracking Number provided by the student to verify and complete hand-over.</p>' +
        '<div style="max-width: 500px; margin-top: 1.25rem;">' +
          '<div style="display: flex; gap: 0.5rem;">' +
            '<input type="text" id="verifyLookupInput" placeholder="Enter 6-digit OTP, Student ID or Tracking #" style="font-size: 1.05rem;">' +
            '<button type="button" class="btn btn-primary" id="verifySearchBtn">Search</button>' +
          '</div>' +
        '</div>' +
        '<div id="verifyResultMount" style="margin-top: 1.5rem;"></div>' +
      '</div>';

    var input = document.getElementById("verifyLookupInput");
    var searchBtn = document.getElementById("verifySearchBtn");
    var resMount = document.getElementById("verifyResultMount");

    function doSearch() {
      var query = input.value.trim().toUpperCase();
      if (!query) {
        resMount.innerHTML = '<p class="form-error">Please enter an OTP, Student ID, or Tracking Number to verify.</p>';
        return;
      }

      var parcels = getParcels();
      var matches = parcels.filter(function (p) {
        return (p.pickupCode === query) ||
               (p.studentId.toUpperCase() === query) ||
               (p.trackingNumber.toUpperCase() === query) ||
               (p.id.toUpperCase() === query);
      });

      if (matches.length === 0) {
        resMount.innerHTML =
          '<div class="alert-box" style="background: var(--danger-bg); color: var(--danger); padding: 1rem; border-radius: 8px;">' +
            'No parcel found matching "<strong>' + query + '</strong>". Please check the OTP or Student ID.' +
          '</div>';
        return;
      }

      var html = '<div style="margin-bottom: 0.75rem; font-weight: 600; color: var(--forest);">Found ' + matches.length + ' Matching Parcel(s):</div>';
      matches.forEach(function (p) {
        var isReady = p.status === "Ready for Pickup";
        html +=
          '<div class="parcel-card" style="border-left: 4px solid ' + (isReady ? 'var(--emerald)' : 'var(--grey)') + ';">' +
            '<div class="parcel-card-header">' +
              '<div>' +
                '<strong style="font-size: 1.15rem; color: var(--forest);">' + p.studentName + '</strong> ' +
                '<span style="color: var(--grey);">&bull; ID: ' + p.studentId + '</span>' +
              '</div>' +
              '<div>' + getStatusBadge(p.status) + '</div>' +
            '</div>' +
            '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.75rem; margin: 0.75rem 0;">' +
              '<div><span style="font-size: 0.8rem; color: var(--grey); display: block;">Carrier</span><strong>' + p.carrier + '</strong></div>' +
              '<div><span style="font-size: 0.8rem; color: var(--grey); display: block;">Tracking #</span><code>' + p.trackingNumber + '</code></div>' +
              '<div><span style="font-size: 0.8rem; color: var(--grey); display: block;">Shelf / Locker</span><strong style="color: var(--emerald-dark); font-size: 1.05rem;">' + p.shelf + '</strong></div>' +
              '<div><span style="font-size: 0.8rem; color: var(--grey); display: block;">Pickup OTP</span><span class="parcel-otp">' + p.pickupCode + '</span></div>' +
            '</div>' +
            '<div style="margin-top: 1rem;">' +
              (isReady ?
                '<button type="button" class="btn btn-primary verify-confirm-btn" data-id="' + p.id + '">&#10003; Confirm Collection & Hand Over</button>' :
                '<div style="background: var(--cream); padding: 0.5rem 0.75rem; border-radius: 6px; font-size: 0.85rem; color: var(--grey);">Already collected on ' + p.collectedDate + ' (' + p.verifiedBy + ')</div>') +
            '</div>' +
          '</div>';
      });

      resMount.innerHTML = html;

      var confirmBtns = resMount.querySelectorAll(".verify-confirm-btn");
      confirmBtns.forEach(function (btn) {
        btn.addEventListener("click", function () {
          var id = this.getAttribute("data-id");
          var opProfile = getProfile(currentUserId);
          var operatorName = opProfile.name ? opProfile.name + " (" + currentUserId + ")" : currentUserId;

          updateParcel(id, {
            status: "Collected",
            collectedDate: getCurrentFormattedTime(),
            verifiedBy: operatorName
          });

          renderOperatorOverview();
          renderOperatorParcelBoard();
          doSearch(); // re-render matches
        });
      });
    }

    searchBtn.addEventListener("click", doSearch);
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        doSearch();
      }
    });
  }

  // -------------------------------------------------------------
  // GUARD DASHBOARD LOGIC
  // -------------------------------------------------------------
  function initGuardDashboard() {
    renderGuardOverview();
    renderGuardNotifications();
    setupGuardVerifyForm();
    renderGuardRecords();
    setupNotifications();
  }

  function renderGuardOverview() {
    var deliveries = getQuickDeliveries();
    var atGate = deliveries.filter(function (q) { return q.status === "At Main Gate"; }).length;
    var onWay = deliveries.filter(function (q) { return q.status === "On the way"; }).length;
    var collectedToday = deliveries.filter(function (q) { return q.status === "Collected"; }).length;

    var container = document.getElementById("guardStatsMount");
    if (!container) {
      container = document.createElement("div");
      container.id = "guardStatsMount";
      var overviewSec = document.getElementById("overview");
      if (overviewSec) overviewSec.appendChild(container);
    }

    container.innerHTML =
      '<div class="stats-grid">' +
        '<div class="stat-card stat-gold">' +
          '<div class="stat-number">' + atGate + '</div>' +
          '<div class="stat-label">Delivery Riders at Main Gate Right Now</div>' +
        '</div>' +
        '<div class="stat-card stat-forest">' +
          '<div class="stat-number">' + onWay + '</div>' +
          '<div class="stat-label">Incoming Deliveries Expected (On the Way)</div>' +
        '</div>' +
        '<div class="stat-card stat-emerald">' +
          '<div class="stat-number">' + collectedToday + '</div>' +
          '<div class="stat-label">Quick Deliveries Cleared & Collected</div>' +
        '</div>' +
      '</div>' +
      '<div class="card" style="margin-top: 1rem;">' +
        '<div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.75rem;">' +
          '<h3 style="margin: 0;">Main Gate Security Actions</h3>' +
          '<button type="button" class="btn btn-ghost" id="guardResetDemoBtn" style="font-size: 0.82rem; padding: 0.35rem 0.75rem;">Reset Demo Data</button>' +
        '</div>' +
        '<p>Monitor delivery agents arriving at campus gates, notify students, and verify student collection passes.</p>' +
        '<div style="display: flex; gap: 0.75rem; flex-wrap: wrap; margin-top: 1rem;">' +
          '<button type="button" class="btn btn-primary" onclick="showSection(\'notifications\')">Active Gate Deliveries (' + atGate + ')</button>' +
          '<button type="button" class="btn btn-primary" style="background: var(--gold);" onclick="showSection(\'verify\')">Verify Pass Code</button>' +
          '<button type="button" class="btn btn-ghost" onclick="showSection(\'records\')">All Gate Records (' + deliveries.length + ')</button>' +
        '</div>' +
      '</div>';

    var rBtn = document.getElementById("guardResetDemoBtn");
    if (rBtn) {
      rBtn.addEventListener("click", function () {
        if (confirm("Reset quick-commerce records to demo data?")) {
          resetDemoParcels();
          initGuardDashboard();
        }
      });
    }
  }

  function renderGuardNotifications() {
    var mount = document.getElementById("notifications");
    if (!mount) return;

    var list = getQuickDeliveries();
    var activeList = list.filter(function (q) { return q.status !== "Collected"; });

    var html =
      '<div class="card">' +
        '<h2>Quick-Commerce Notifications & Gate Clearance</h2>' +
        '<p>When riders arrive at the barrier, check their pass code and mark them as arrived at gate to notify the student.</p>';

    if (activeList.length === 0) {
      html += '<div class="empty-state"><p>No pending riders at the gate right now.</p></div>';
    } else {
      activeList.forEach(function (q) {
        var isAtGate = q.status === "At Main Gate";
        html +=
          '<div class="parcel-card" style="border-left: 4px solid ' + (isAtGate ? '#1565c0' : 'var(--gold)') + ';">' +
            '<div class="parcel-card-header">' +
              '<div>' +
                '<strong style="font-size: 1.15rem; color: var(--forest);">' + q.vendor + '</strong> ' +
                '<span style="color: var(--grey);">&bull; Gate Pass: <strong>' + q.passCode + '</strong></span>' +
              '</div>' +
              '<div>' + getStatusBadge(q.status) + '</div>' +
            '</div>' +
            '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.75rem; margin: 0.75rem 0;">' +
              '<div><span style="font-size: 0.8rem; color: var(--grey); display: block;">Student Details</span><strong>' + q.studentName + '</strong><br><small style="color: var(--grey);">' + q.studentHostel + ' &bull; ' + q.studentPhone + '</small></div>' +
              '<div><span style="font-size: 0.8rem; color: var(--grey); display: block;">Rider & Vehicle</span><strong>' + q.riderName + '</strong><br><small style="color: var(--grey);">' + q.riderVehicle + '</small></div>' +
              '<div><span style="font-size: 0.8rem; color: var(--grey); display: block;">Delivery Items</span><strong>' + q.items + '</strong></div>' +
              '<div><span style="font-size: 0.8rem; color: var(--grey); display: block;">Location / Gate</span><strong>' + q.gate + '</strong></div>' +
            '</div>' +
            '<div style="display: flex; gap: 0.75rem; flex-wrap: wrap; margin-top: 1rem; align-items: center;">' +
              (!isAtGate ?
                '<button type="button" class="btn btn-primary guard-arrived-btn" data-id="' + q.id + '">Mark Arrived at Gate</button>' :
                '<span style="color: #1565c0; font-weight: 600; font-size: 0.9rem;">&bull; Waiting for student at ' + (q.guardNotes || 'Gate') + '</span>') +
              '<button type="button" class="btn btn-ghost guard-verify-direct-btn" data-id="' + q.id + '">Verify & Complete Handover</button>' +
              '<a href="tel:' + q.studentPhone + '" class="btn btn-ghost" style="text-decoration: none; font-size: 0.88rem;">Call Student (' + q.studentPhone + ')</a>' +
            '</div>' +
          '</div>';
      });
    }

    html += '</div>';
    mount.innerHTML = html;

    // Attach buttons
    var arrBtns = mount.querySelectorAll(".guard-arrived-btn");
    arrBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = this.getAttribute("data-id");
        updateQuickDelivery(id, {
          status: "At Main Gate",
          arrivedAtGate: getCurrentFormattedTime()
        });
        initGuardDashboard();
      });
    });

    var verifyBtns = mount.querySelectorAll(".guard-verify-direct-btn");
    verifyBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = this.getAttribute("data-id");
        if (confirm("Confirm that student has arrived and collected the delivery?")) {
          updateQuickDelivery(id, {
            status: "Collected",
            collectedAt: getCurrentFormattedTime()
          });
          initGuardDashboard();
        }
      });
    });
  }

  function setupGuardVerifyForm() {
    var mount = document.getElementById("verify");
    if (!mount) return;

    mount.innerHTML =
      '<div class="card">' +
        '<h2>Verify Gate Pass Collection</h2>' +
        '<p>When the student comes to the gate to collect their quick commerce order, enter their Gate Pass Code (e.g. <code>QC-8419</code>) or Student ID.</p>' +
        '<div style="max-width: 500px; margin-top: 1.25rem;">' +
          '<div style="display: flex; gap: 0.5rem;">' +
            '<input type="text" id="guardVerifyInput" placeholder="Enter Gate Pass (e.g. QC-8419) or Student ID" style="font-size: 1.05rem;">' +
            '<button type="button" class="btn btn-primary" id="guardSearchBtn">Verify Pass</button>' +
          '</div>' +
        '</div>' +
        '<div id="guardVerifyResultMount" style="margin-top: 1.5rem;"></div>' +
      '</div>';

    var input = document.getElementById("guardVerifyInput");
    var searchBtn = document.getElementById("guardSearchBtn");
    var resMount = document.getElementById("guardVerifyResultMount");

    function doSearch() {
      var query = input.value.trim().toUpperCase();
      if (!query) {
        resMount.innerHTML = '<p class="form-error">Please enter a Gate Pass Code or Student ID.</p>';
        return;
      }

      var deliveries = getQuickDeliveries();
      var matches = deliveries.filter(function (q) {
        return (q.passCode.toUpperCase() === query) ||
               (q.studentId.toUpperCase() === query) ||
               (q.id.toUpperCase() === query);
      });

      if (matches.length === 0) {
        resMount.innerHTML =
          '<div class="alert-box" style="background: var(--danger-bg); color: var(--danger); padding: 1rem; border-radius: 8px;">' +
            'No quick delivery found for pass "<strong>' + query + '</strong>".' +
          '</div>';
        return;
      }

      var html = '<div style="margin-bottom: 0.75rem; font-weight: 600; color: var(--forest);">Found ' + matches.length + ' Matching Delivery Entry:</div>';
      matches.forEach(function (q) {
        var isCollected = q.status === "Collected";
        html +=
          '<div class="parcel-card" style="border-left: 4px solid ' + (isCollected ? 'var(--grey)' : 'var(--gold)') + ';">' +
            '<div class="parcel-card-header">' +
              '<div>' +
                '<strong style="font-size: 1.15rem; color: var(--forest);">' + q.vendor + ' - Pass ' + q.passCode + '</strong> ' +
                '<span style="color: var(--grey);">&bull; Ref: ' + q.orderRef + '</span>' +
              '</div>' +
              '<div>' + getStatusBadge(q.status) + '</div>' +
            '</div>' +
            '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.75rem; margin: 0.75rem 0;">' +
              '<div><span style="font-size: 0.8rem; color: var(--grey); display: block;">Student</span><strong>' + q.studentName + '</strong> (' + q.studentId + ')<br><small style="color: var(--grey);">' + q.studentHostel + '</small></div>' +
              '<div><span style="font-size: 0.8rem; color: var(--grey); display: block;">Rider</span><strong>' + q.riderName + '</strong><br><small style="color: var(--grey);">' + q.riderVehicle + '</small></div>' +
              '<div><span style="font-size: 0.8rem; color: var(--grey); display: block;">Items</span><strong>' + q.items + '</strong></div>' +
              '<div><span style="font-size: 0.8rem; color: var(--grey); display: block;">Gate</span><strong>' + q.gate + '</strong></div>' +
            '</div>' +
            '<div style="margin-top: 1rem;">' +
              (!isCollected ?
                '<button type="button" class="btn btn-primary guard-confirm-pass-btn" data-id="' + q.id + '">&#10003; Confirm Pass & Complete Gate Handover</button>' :
                '<div style="background: var(--cream); padding: 0.5rem 0.75rem; border-radius: 6px; font-size: 0.85rem; color: var(--grey);">Handed over on ' + q.collectedAt + '</div>') +
            '</div>' +
          '</div>';
      });

      resMount.innerHTML = html;

      var confirmBtns = resMount.querySelectorAll(".guard-confirm-pass-btn");
      confirmBtns.forEach(function (btn) {
        btn.addEventListener("click", function () {
          var id = this.getAttribute("data-id");
          updateQuickDelivery(id, {
            status: "Collected",
            collectedAt: getCurrentFormattedTime()
          });
          initGuardDashboard();
          doSearch();
        });
      });
    }

    searchBtn.addEventListener("click", doSearch);
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        doSearch();
      }
    });
  }

  function renderGuardRecords() {
    var mount = document.getElementById("records");
    if (!mount) return;

    var list = getQuickDeliveries();

    mount.innerHTML =
      '<div class="card">' +
        '<h2>Quick-Commerce Delivery Gate Records</h2>' +
        '<p>Complete log of delivery riders permitted through the gate.</p>' +
        '<div class="table-responsive">' +
          '<table class="parcel-table">' +
            '<thead>' +
              '<tr>' +
                '<th>Pass Code</th>' +
                '<th>Student Name & ID</th>' +
                '<th>Vendor</th>' +
                '<th>Rider Name & Vehicle</th>' +
                '<th>Gate</th>' +
                '<th>Arrival Time</th>' +
                '<th>Status</th>' +
              '</tr>' +
            '</thead>' +
            '<tbody>' +
              list.map(function (q) {
                return '<tr>' +
                  '<td><span class="parcel-otp" style="font-size: 0.85rem; padding: 0.2rem 0.5rem;">' + q.passCode + '</span></td>' +
                  '<td><strong>' + q.studentName + '</strong><br><small style="color: var(--grey);">' + q.studentId + '</small></td>' +
                  '<td><strong>' + q.vendor + '</strong></td>' +
                  '<td>' + q.riderName + '<br><small style="color: var(--grey);">' + q.riderVehicle + '</small></td>' +
                  '<td>' + q.gate + '</td>' +
                  '<td>' + (q.arrivedAtGate || q.requestedAt) + '</td>' +
                  '<td>' + getStatusBadge(q.status) + '</td>' +
                '</tr>';
              }).join("") +
            '</tbody>' +
          '</table>' +
        '</div>' +
      '</div>';
  }

  // -------------------------------------------------------------
  // INITIALIZATION ON PAGE LOAD
  // -------------------------------------------------------------
  window.addEventListener("DOMContentLoaded", function () {
    if (role === "student") {
      initStudentDashboard();
    } else if (role === "operator") {
      initOperatorDashboard();
    } else if (role === "guard") {
      initGuardDashboard();
    }
  });

  // Re-run if DOM is already ready
  if (document.readyState === "complete" || document.readyState === "interactive") {
    if (role === "student") {
      initStudentDashboard();
    } else if (role === "operator") {
      initOperatorDashboard();
    } else if (role === "guard") {
      initGuardDashboard();
    }
  }

})();

