// VIBE page logic
(function() {
  'use strict';

  // Prevent multiple initializations
  let vibeInitialized = false;

  window.initializeVibe = function() {
    // Check if already initialized
    if (vibeInitialized) {
      return;
    }

    // Check if we are on the VIBE page by looking for the archive container
    const vibeArchive = document.getElementById('vibe-events-archive');
    if (!vibeArchive) {
      return;
    }

    vibeInitialized = true;
    console.log("Initializing VIBE page");

    // Define toggle function for VIBE years
    window.toggleVibeYear = function(yearId) {
      const content = document.getElementById(yearId + '-content');
      const icon = document.getElementById(yearId + '-icon');
      
      if (!content || !icon) return;

      // Check if currently expanded
      const isExpanded = icon.classList.contains('expanded');
      
      if (isExpanded) {
        // Collapse
        content.classList.remove('expanded');
        icon.classList.remove('expanded');
        // If using font awesome icons directly in innerHTML
        // icon.innerHTML = '<i class="fas fa-chevron-down"></i>';
      } else {
        // Expand
        content.classList.add('expanded');
        icon.classList.add('expanded');
        // icon.innerHTML = '<i class="fas fa-chevron-up"></i>';
      }
    };

    // Toggle PI Grid
    window.togglePiGrid = function() {
      const grid = document.getElementById('pi-grid-container');
      const btn = document.getElementById('toggle-pi-grid');
      
      if (!grid || !btn) return;
      
      if (grid.classList.contains('collapsed')) {
        grid.classList.remove('collapsed');
        btn.textContent = "Show Less";
      } else {
        grid.classList.add('collapsed');
        btn.textContent = "Show All Principal Investigators";
        // Scroll back to top of section
        btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };
  };

  // Reset function for navigation system
  window.resetVibe = function() {
    vibeInitialized = false;
  };

  // Auto-initialize on DOM ready (for direct page load)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.initializeVibe);
  } else {
    // DOM already loaded
    window.initializeVibe();
  }
})();
