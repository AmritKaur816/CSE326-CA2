// dashboard.js - switches between the navbar sections

var role = document.documentElement.getAttribute("data-role");

// If the page is restored from the back button after logout, check again
window.addEventListener("pageshow", function () {
  requireLogin(role);
});

var links = document.querySelectorAll(".nav-links a");
var sections = document.querySelectorAll(".section");

function showSection(name) {
  for (var i = 0; i < sections.length; i++) {
    sections[i].hidden = sections[i].id !== name;
  }
  for (var j = 0; j < links.length; j++) {
    var active = links[j].getAttribute("data-section") === name;
    links[j].classList.toggle("active", active);
    if (active) {
      links[j].setAttribute("aria-current", "page");
    } else {
      links[j].removeAttribute("aria-current");
    }
  }
}
window.showSection = showSection;

for (var k = 0; k < links.length; k++) {
  links[k].addEventListener("click", function (event) {
    event.preventDefault();
    showSection(this.getAttribute("data-section"));
  });
}

showSection("overview");
