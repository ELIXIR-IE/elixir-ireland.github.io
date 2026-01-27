// Core initialization for ELIXIR Ireland website
(function () {
  'use strict';

  // Global flag to prevent multiple initializations
  if (window.ELIXIR_INITIALIZED) {
    return;
  }
  window.ELIXIR_INITIALIZED = true;



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
    document.addEventListener('DOMContentLoaded', setActiveNavLink);
  } else {
    setActiveNavLink();
  }

  // Export utility function
  window.ELIXIR = {
    setActiveNavLink: setActiveNavLink
  };
})();
