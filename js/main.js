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
      if (window.innerWidth <= 1220) {
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

/* ── Nav search ────────────────────────────────────────────
   The form posts to /places-to-go.html?q=, so it still works
   with JavaScript off. This only handles opening the box. */
document.addEventListener('DOMContentLoaded', function () {
  var wrap = document.querySelector('.nav-search');
  if (!wrap) return;
  var btn = wrap.querySelector('.nav-search-btn');
  var input = wrap.querySelector('input[name="q"]');

  function setOpen(open) {
    wrap.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) input.focus();
  }
  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    setOpen(!wrap.classList.contains('open'));
  });
  document.addEventListener('click', function (e) {
    if (!wrap.contains(e.target)) setOpen(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && wrap.classList.contains('open')) { setOpen(false); btn.focus(); }
  });
});

/* Apply ?q= on the directory page so nav searches land on results. */
document.addEventListener('DOMContentLoaded', function () {
  var box = document.getElementById('dir-search');
  if (!box) return;
  var q = new URLSearchParams(location.search).get('q');
  if (!q) return;
  box.value = q;
  box.dispatchEvent(new Event('input'));
  var sec = box.closest('section') || box;
  window.scrollTo({ top: sec.getBoundingClientRect().top + window.pageYOffset - 90, behavior: 'auto' });
});
