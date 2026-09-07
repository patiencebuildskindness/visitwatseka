/* ============================================================
   visitwatseka.com — Main JS
   ============================================================ */

document.addEventListener('DOMContentLoaded', function() {
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  // Mobile nav toggle
  if (toggle && navLinks) {
    toggle.addEventListener('click', function() {
      toggle.classList.toggle('open');
      navLinks.classList.toggle('open');
    });

    // Close menu when clicking a non-dropdown link
    navLinks.querySelectorAll('a').forEach(function(link) {
      if (!link.parentElement.querySelector('.nav-dropdown')) {
        link.addEventListener('click', function() {
          toggle.classList.remove('open');
          navLinks.classList.remove('open');
        });
      }
    });
  }

  // Mobile dropdown toggle (tap to expand on small screens)
  var dropdownParents = document.querySelectorAll('.nav-links > li');
  dropdownParents.forEach(function(li) {
    var dropdown = li.querySelector('.nav-dropdown');
    if (!dropdown) return;
    var mainLink = li.querySelector(':scope > a');
    mainLink.addEventListener('click', function(e) {
      if (window.innerWidth <= 860) {
        e.preventDefault();
        li.classList.toggle('dropdown-open');
      }
    });
  });

  // Set active nav link
  var currentPath = window.location.pathname;
  document.querySelectorAll('.nav-links > li > a').forEach(function(link) {
    var href = link.getAttribute('href');
    if (href === currentPath ||
        (currentPath.includes('/farmers-market') && href.includes('/farmers-market')) ||
        (currentPath === '/' && href === '/') ||
        (currentPath === '/index.html' && href === '/')) {
      link.classList.add('active');
    }
  });
});

/* ── Hubbard Trail Days event bar ──────────────────────────
   Removes itself the day after the event so it does not need
   to be hand-stripped from every page later. */
(function () {
  var EVENT_OVER = new Date(2026, 8, 13); // Sun Sep 13, 2026
  if (new Date() < EVENT_OVER) return;
  document.addEventListener('DOMContentLoaded', function () {
    var bars = document.querySelectorAll('.htd-bar');
    for (var i = 0; i < bars.length; i++) bars[i].remove();
  });
})();
