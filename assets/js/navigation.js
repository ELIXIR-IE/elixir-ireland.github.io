/**
 * Dynamic Navigation System - Clean Implementation
 * Loads page content without reloading header/footer
 */
(function () {
  'use strict';

  // Configuration
  const contentCache = {};
  let currentNavToken = 0;
  let currentAbortController = null;
  let currentPath = null;

  // Track which scripts and inline styles are loaded
  const loadedScripts = new Set();
  const inlineStyleIds = new Set();

  /**
   * Clean up old inline styles
   */
  function cleanupInlineStyles() {
    inlineStyleIds.forEach(styleId => {
      const styleElement = document.getElementById(styleId);
      if (styleElement) {
        styleElement.remove();
      }
    });
    inlineStyleIds.clear();
  }

  /**
   * Extract main content from HTML string
   */
  function extractContent(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // With Jekyll layouts, content is always in <main>
    const main = doc.querySelector('main');
    return main ? main.innerHTML : null;
  }

  /**
   * Update page title from loaded content
   */
  function updatePageTitle(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const title = doc.querySelector('title');
    if (title) {
      document.title = title.textContent;
    }
  }

  /**
   * Update active navigation state
   */
  function updateActiveNav(path) {
    const targetPath = new URL(path, window.location.origin).pathname;

    document.querySelectorAll('nav a').forEach(link => {
      const linkPath = new URL(link.href, window.location.origin).pathname;

      if (linkPath === targetPath ||
        (linkPath === '/' && targetPath.startsWith('/index.html')) ||
        (linkPath.endsWith('/home.html') && (targetPath === '/' || targetPath.endsWith('/index.html')))) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  /**
   * Load page-specific stylesheets
   */
  function loadPageStyles(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const newStyles = doc.querySelectorAll('head link[rel="stylesheet"]');

    const loadPromises = [];

    newStyles.forEach(styleLink => {
      const href = styleLink.getAttribute('href');
      if (href) {
        const existingLink = document.querySelector(`link[href="${href}"]`);
        if (!existingLink) {
          const loadPromise = new Promise((resolve, reject) => {
            const newLink = document.createElement('link');
            newLink.rel = 'stylesheet';
            newLink.type = 'text/css';
            // Add cache-busting timestamp to force fresh load
            newLink.href = href + (href.includes('?') ? '&' : '?') + '_=' + Date.now();
            newLink.onload = () => {
              console.log(`✓ Loaded stylesheet: ${href}`);
              // Force multiple reflows to ensure CSS is applied
              document.body.offsetHeight;
              void document.body.offsetWidth;
              resolve();
            };
            newLink.onerror = () => {
              console.error(`✗ Failed to load stylesheet: ${href}`);
              reject();
            };
            document.head.appendChild(newLink);
          });
          loadPromises.push(loadPromise);
        } else {
          // CSS already loaded, force complete reload by removing and re-adding
          console.log(`♻️ Reloading stylesheet: ${href}`);
          const parent = existingLink.parentNode;
          parent.removeChild(existingLink);

          const reloadPromise = new Promise((resolve) => {
            requestAnimationFrame(() => {
              const newLink = document.createElement('link');
              newLink.rel = 'stylesheet';
              newLink.type = 'text/css';
              newLink.href = href + (href.includes('?') ? '&' : '?') + '_=' + Date.now();
              newLink.onload = () => {
                console.log(`✓ Reloaded stylesheet: ${href}`);
                // Force reflow after re-enabling
                document.body.offsetHeight;
                void document.body.offsetWidth;
                // Force style recalculation
                window.getComputedStyle(document.body).getPropertyValue('color');
                resolve();
              };
              parent.appendChild(newLink);
            });
          });
          loadPromises.push(reloadPromise);
        }
      }
    });

    // Also handle inline styles from the page
    const inlineStyles = doc.querySelectorAll('head style');
    inlineStyles.forEach(styleTag => {
      const styleId = `inline-style-${Math.random().toString(36).substr(2, 9)}`;
      const newStyle = document.createElement('style');
      newStyle.id = styleId;
      newStyle.textContent = styleTag.textContent;
      document.head.appendChild(newStyle);
      inlineStyleIds.add(styleId);
      console.log(`✓ Added inline stylesheet: ${styleId}`);
    });

    if (loadPromises.length === 0) {
      console.log('No new stylesheets to load, forcing reflow');
      // Force multiple reflows even if no new styles loaded
      document.body.offsetHeight;
      void document.body.offsetWidth;
      // Force a style recalculation
      window.getComputedStyle(document.body).getPropertyValue('color');
    }

    return Promise.all(loadPromises);
  }

  /**
   * Load page-specific scripts
   */
  /**
   * Load page-specific scripts sequentially
   * This is critical for scripts that depend on each other (e.g. home.js depends on news_items.js)
   */
  async function loadPageScripts(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const scripts = doc.querySelectorAll('body script[src]');

    // Convert NodeList to Array for iteration
    const scriptsArray = Array.from(scripts);

    for (const scriptTag of scriptsArray) {
      const src = scriptTag.getAttribute('src');
      if (!src) continue;

      // Skip core scripts that are always loaded
      if (src.includes('ei.js') || src.includes('navigation.js') || src.includes('ui.js')) {
        continue;
      }

      // Check if script is already loaded
      const scriptId = `script-${src.replace(/[^a-zA-Z0-9]/g, '-')}`;
      if (document.getElementById(scriptId)) {
        console.log(`Script already loaded: ${src}`);
        continue;
      }

      try {
        await new Promise((resolve, reject) => {
          const newScript = document.createElement('script');
          newScript.id = scriptId;
          // Add cache-busting to ensure fresh scripts are loaded
          newScript.src = src + (src.includes('?') ? '&' : '?') + '_=' + Date.now();
          // Important: set async to false to maintain execution order for dynamically inserted scripts
          newScript.async = false;

          newScript.onload = () => {
            console.log(`✓ Loaded script: ${src}`);
            resolve();
          };
          newScript.onerror = () => {
            console.error(`✗ Failed to load script: ${src}`);
            // We resolve anyway to allow subsequent scripts to try loading
            resolve();
          };
          document.body.appendChild(newScript);
        });
      } catch (err) {
        console.error(err);
      }
    }

    if (scriptsArray.length === 0) {
      console.log('No new scripts to load');
    }
  }

  /**
   * Replace the main content
   */
  function replaceMainContent(content) {
    const mainElement = document.querySelector('main');

    if (mainElement) {
      // Add navigated class for SPA fade-in animation
      mainElement.classList.add('navigated');
      mainElement.innerHTML = content;

      // Force reflow to apply changes
      document.body.offsetHeight;

      // Force image decode for better rendering
      const images = document.querySelectorAll('main img');
      images.forEach(img => {
        if (img.complete && img.decode) {
          img.decode().catch(() => { });
        }
      });
    } else {
      console.error('Main element not found in current page.');
    }
  }

  /**
   * Initialize page-specific functionality
   */
  function initializePage(pathname) {
    console.log('Initializing page:', pathname);

    // Initialize based on page type
    if (pathname.includes('/news/')) {
      if (typeof window.resetNews === 'function') window.resetNews();
      if (typeof window.initializeNews === 'function') window.initializeNews();
    } else if (pathname.includes('/events/')) {
      if (typeof window.resetEvents === 'function') window.resetEvents();
      if (typeof window.initializeEvents === 'function') window.initializeEvents();
    } else if (pathname.includes('/services/')) {
      if (typeof window.resetServices === 'function') window.resetServices();
      if (typeof window.initializeServices === 'function') window.initializeServices();
    } else if (pathname.includes('/vibe/')) {
      if (typeof window.resetVibe === 'function') window.resetVibe();
      if (typeof window.initializeVibe === 'function') window.initializeVibe();
    } else if (pathname === '/' || pathname.endsWith('/index.html') || pathname.endsWith('/home.html')) {
      // Home page
      if (typeof window.resetHome === 'function') window.resetHome();
      if (typeof window.initializeHome === 'function') window.initializeHome();
    }
  }

  /**
   * Load page content via AJAX
   */
  /**
   * Load page content via AJAX
   */
  function loadPage(href, addToHistory = true) {
    const url = new URL(href, window.location.origin);
    const cacheKey = url.pathname;
    const fullPath = url.pathname + url.search + url.hash;

    // Prevent redundant navigation
    if (currentPath === fullPath && !addToHistory) {
      return;
    }
    currentPath = fullPath;

    // Clean up old inline styles before loading new page
    cleanupInlineStyles();

    // Increment token and abort any in-flight request
    const myToken = ++currentNavToken;
    if (currentAbortController) {
      try { currentAbortController.abort(); } catch (_) { }
    }
    currentAbortController = new AbortController();

    // Show loading indicator
    document.body.classList.add('loading');

    // Watchdog timer to force reload if stuck
    const watchdog = setTimeout(() => {
      if (myToken === currentNavToken && document.body.classList.contains('loading')) {
        console.warn('Navigation timed out, forcing reload');
        window.location.href = fullPath;
      }
    }, 5000);

    // Fetch with abort support
    fetch(fullPath, { signal: currentAbortController.signal })
      .then(response => {
        if (!response.ok) throw new Error('Page not found');
        return response.text();
      })
      .then(async (html) => {
        // Only update history if fetch succeeded and we haven't been aborted
        if (myToken !== currentNavToken) return;

        if (addToHistory) {
          history.pushState({ page: fullPath, cacheKey }, '', fullPath);
          updateActiveNav(cacheKey);
        }

        document.body.classList.remove('loading');
        clearTimeout(watchdog);

        // Load styles first (with 2s timeout per style to prevent hanging)
        const styleTimeout = new Promise(resolve => setTimeout(resolve, 2000));
        await Promise.race([loadPageStyles(html), styleTimeout]);

        // Force reflow after CSS loads
        document.body.offsetHeight;

        // Load scripts sequentially (with 2s timeout per script)
        const scriptTimeout = new Promise(resolve => setTimeout(resolve, 2000));
        await Promise.race([loadPageScripts(html), scriptTimeout]);

        // Extract content
        const content = extractContent(html);

        if (content && content.trim().length > 0) {
          contentCache[cacheKey] = content;
          replaceMainContent(content);
          updatePageTitle(html);
          window.scrollTo(0, 0);

          // Wait for CSS to be fully applied and DOM to settle
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              // Final reflow to ensure everything is rendered
              document.body.offsetHeight;
              initializePage(cacheKey);
              // Notify that navigation is complete
              window.dispatchEvent(new Event('navigationComplete'));
            });
          });
        } else {
          // Fallback if content extraction fails or is empty
          console.error("Extracted content was empty, reloading...");
          window.location.href = fullPath;
        }
      })
      .catch(err => {
        document.body.classList.remove('loading');
        clearTimeout(watchdog);
        if (err && err.name === 'AbortError') return;
        console.error('Error loading page:', err);
        window.location.href = fullPath;
      });
  }

  /**
   * Handle click events on internal links
   */
  function handleLinkClick(e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    const link = e.target.closest('a');
    if (!link) return;

    const hrefAttr = link.getAttribute('href') || '';
    if (!hrefAttr || hrefAttr.startsWith('#') || link.hasAttribute('download') || link.target === '_blank') return;

    const url = new URL(link.href, window.location.origin);
    if (url.origin !== window.location.origin) return;
    if (link.hasAttribute('data-no-ajax')) return;

    // Ignore links to assets or non-html resources roughly
    if (url.pathname.match(/\.(pdf|zip|jpg|png|gif|svg)$/i)) return;

    e.preventDefault();
    loadPage(url.href, true);
  }

  /**
   * Initialize navigation system
   */
  function initialize() {
    console.log('Initializing navigation system');
    document.addEventListener('click', handleLinkClick);

    // Initial state setup
    const fullPath = window.location.pathname + window.location.search + window.location.hash;
    currentPath = fullPath;

    updateActiveNav(window.location.pathname);

    // Cache current content
    const content = extractContent(document.documentElement.outerHTML);
    if (content) {
      contentCache[window.location.pathname] = content;
    }

    // Initialize current page
    initializePage(window.location.pathname);

    // Notify listeners
    window.dispatchEvent(new Event('navigationComplete'));
  }

  /**
   * Handle browser back/forward buttons
   */
  window.addEventListener('popstate', (e) => {
    if (e.state && e.state.page) {
      loadPage(e.state.page, false);
    } else {
      loadPage(window.location.pathname + window.location.search + window.location.hash, false);
    }
  });

  /**
   * Initialize on page load
   */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
})();