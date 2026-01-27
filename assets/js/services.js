// Services page logic with singleton pattern
(function() {
  'use strict';

  // Prevent multiple initializations
  let servicesInitialized = false;

  window.initializeServices = function() {
    // Check if already initialized
    if (servicesInitialized) {
      console.log("Services already initialized, skipping");
      return;
    }

    // Check if we are on the services page
    const servicesPage = document.querySelector('.elixir-europe-box');
    if (!servicesPage) {
      console.log("Services page elements not found, skipping initialization");
      return;
    }

    servicesInitialized = true;
    console.log("Initializing services page");

    // Define toggle function
    window.toggleCategory = function(categoryId) {
      const content = document.getElementById(categoryId + '-content');
      const icon = document.getElementById(categoryId + '-icon');
      
      if (content && icon) {
        content.classList.toggle('expanded');
        icon.classList.toggle('expanded');
      }
    };
  };

  // Reset function for navigation system
  window.resetServices = function() {
    servicesInitialized = false;
  };

  // Auto-initialize on DOM ready (for direct page load)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.initializeServices);
  } else {
    // DOM already loaded
    window.initializeServices();
  }
})();
