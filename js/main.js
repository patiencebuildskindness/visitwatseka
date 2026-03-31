/* ============================================================
   visitwatseka.com — Main JS
   ============================================================ */

// Mobile nav toggle
document.addEventListener('DOMContentLoaded', function() {
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (toggle && navLinks) {
    toggle.addEventListener('click', function() {
      toggle.classList.toggle('open');
      navLinks.classList.toggle('open');
    });

    // Close menu when clicking a link
    navLinks.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', function() {
        toggle.classList.remove('open');
        navLinks.classList.remove('open');
      });
    });
  }

  // Set active nav link
  const currentPath = window.location.pathname;
  document.querySelectorAll('.nav-links a').forEach(function(link) {
    const href = link.getAttribute('href');
    if (href === currentPath ||
        (currentPath.includes('/farmers-market') && href.includes('/farmers-market')) ||
        (currentPath === '/' && href === '/') ||
        (currentPath === '/index.html' && href === '/')) {
      link.classList.add('active');
    }
  });
});
