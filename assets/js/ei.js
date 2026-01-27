// Core initialization for ELIXIR Ireland website
(function() {
  'use strict';

  // Global flag to prevent multiple initializations
  if (window.ELIXIR_INITIALIZED) {
    return;
  }
  window.ELIXIR_INITIALIZED = true;

  // Load header and footer
  function loadHeaderFooter() {
    // Load header
    fetch('/includes/header.html')
      .then(response => response.text())
      .then(data => {
        document.getElementById('header-placeholder').innerHTML = data;
        setActiveNavLink();
      })
      .catch(error => console.error('Error loading header:', error));

    // Load footer
    fetch('/includes/footer.html')
      .then(response => response.text())
      .then(data => {
        document.getElementById('footer-placeholder').innerHTML = data;
      })
      .catch(error => console.error('Error loading footer:', error));
  }

  // Set active navigation item based on current page
  function setActiveNavLink() {
    const currentPage = window.location.pathname.split("/").pop() || "home.html";
    const navLinks = document.querySelectorAll(".nav-link");

    navLinks.forEach((link) => {
      const linkPage = link.getAttribute("href");
      if (linkPage === currentPage || 
          (currentPage === "" && linkPage === "home.html") || 
          (currentPage === "index.html" && linkPage === "home.html")) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadHeaderFooter);
  } else {
    loadHeaderFooter();
  }

  // Export utility function
  window.ELIXIR = {
    setActiveNavLink: setActiveNavLink
  };
})();
