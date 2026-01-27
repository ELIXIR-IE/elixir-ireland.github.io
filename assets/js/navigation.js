/**
 * Dynamic Navigation System - Clean Implementation
 * Loads page content without reloading header/footer
 */
(function() {
  'use strict';

  // Configuration
  const contentCache = {};
  let headerFooterLoaded = false;
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
    
    const headerPlaceholder = doc.querySelector('#header-placeholder');
    const footerPlaceholder = doc.querySelector('#footer-placeholder');
    
    if (headerPlaceholder && footerPlaceholder) {
      let content = '';
      let currentNode = headerPlaceholder.nextSibling;
      
      while (currentNode && currentNode !== footerPlaceholder) {
        if (currentNode.nodeType === Node.ELEMENT_NODE) {
          content += currentNode.outerHTML;
        } else if (currentNode.nodeType === Node.TEXT_NODE && currentNode.textContent.trim()) {
          content += currentNode.textContent;
        }
        currentNode = currentNode.nextSibling;
      }
      
      return content;
    }
    
    const main = doc.querySelector('main');
    return main ? main.outerHTML : null;
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
  function loadPageScripts(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const scripts = doc.querySelectorAll('body script[src]');
    
    const loadPromises = [];
    
    scripts.forEach(scriptTag => {
      const src = scriptTag.getAttribute('src');
      if (!src) return;
      
      // Skip core scripts that are always loaded
      if (src.includes('ei.js') || src.includes('navigation.js')) {
        return;
      }
      
      // Check if script is already loaded
      const scriptId = `script-${src.replace(/[^a-zA-Z0-9]/g, '-')}`;
      if (document.getElementById(scriptId)) {
        console.log(`Script already loaded: ${src}`);
        return;
      }
      
      const loadPromise = new Promise((resolve, reject) => {
        const newScript = document.createElement('script');
        newScript.id = scriptId;
        newScript.src = src;
        newScript.onload = () => {
          console.log(`✓ Loaded script: ${src}`);
          resolve();
        };
        newScript.onerror = () => {
          console.error(`✗ Failed to load script: ${src}`);
          reject();
        };
        document.body.appendChild(newScript);
      });
      
      loadPromises.push(loadPromise);
    });
    
    if (loadPromises.length === 0) {
      console.log('No new scripts to load');
    }
    
    return Promise.all(loadPromises);
  }

  /**
   * Replace the main content between header and footer
   */
  function replaceMainContent(content) {
    const headerPlaceholder = document.querySelector('#header-placeholder');
    const footerPlaceholder = document.querySelector('#footer-placeholder');
    
    if (headerPlaceholder && footerPlaceholder) {
      let currentNode = headerPlaceholder.nextSibling;
      const nodesToRemove = [];
      
      while (currentNode && currentNode !== footerPlaceholder) {
        nodesToRemove.push(currentNode);
        currentNode = currentNode.nextSibling;
      }
      
      nodesToRemove.forEach(node => node.remove());
      footerPlaceholder.insertAdjacentHTML('beforebegin', content);
      
      // Multiple forced reflows to ensure DOM updates and CSS are applied
      document.body.offsetHeight;
      void document.body.offsetWidth;
      
      // Force image decode for better rendering
      const images = document.querySelectorAll('main img');
      images.forEach(img => {
        if (img.complete && img.decode) {
          img.decode().catch(() => {});
        }
      });
    }
  }

  /**
   * Initialize page-specific functionality
   */
  function initializePage(pathname) {
    console.log('Initializing page:', pathname);
    
    // Initialize based on page type
    if (pathname.includes('news.html')) {
      if (typeof window.resetNews === 'function') {
        window.resetNews();
      }
      if (typeof window.initializeNews === 'function') {
        console.log('Calling initializeNews');
        window.initializeNews();
      } else {
        console.warn('initializeNews function not found');
      }
    } else if (pathname.includes('events.html')) {
      if (typeof window.resetEvents === 'function') {
        window.resetEvents();
      }
      if (typeof window.initializeEvents === 'function') {
        console.log('Calling initializeEvents');
        window.initializeEvents();
      } else {
        console.warn('initializeEvents function not found');
      }
    } else if (pathname.includes('services.html')) {
      if (typeof window.resetServices === 'function') {
        window.resetServices();
      }
      if (typeof window.initializeServices === 'function') {
        console.log('Calling initializeServices');
        window.initializeServices();
      } else {
        console.warn('initializeServices function not found');
      }
    } else if (pathname.includes('vibe.html')) {
      if (typeof window.resetVibe === 'function') {
        window.resetVibe();
      }
      if (typeof window.initializeVibe === 'function') {
        console.log('Calling initializeVibe');
        window.initializeVibe();
      } else {
        console.warn('initializeVibe function not found');
      }
    } else if (pathname.includes('home.html') || pathname === '/' || pathname.endsWith('/index.html')) {
      // Home page dynamic content
      if (typeof window.resetHome === 'function') {
        window.resetHome();
      }
      if (typeof window.initializeHome === 'function') {
        console.log('Calling initializeHome');
        window.initializeHome();
      } else {
        console.warn('initializeHome function not found');
      }
    }
  }

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
      try { currentAbortController.abort(); } catch (_) {}
    }
    currentAbortController = new AbortController();

    if (addToHistory) {
      history.pushState({ page: fullPath, cacheKey }, '', fullPath);
    }

    updateActiveNav(cacheKey);

    // Serve from cache
    if (contentCache[cacheKey]) {
      if (myToken !== currentNavToken) return;
      replaceMainContent(contentCache[cacheKey]);
      window.scrollTo(0, 0);
      
      // Force reflow and wait for images to load
      document.body.offsetHeight;
      
      // Even when serving from cache, wait for DOM to settle and CSS to apply
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          // Additional reflow to ensure CSS is applied
          document.body.offsetHeight;
          initializePage(cacheKey);
          // Notify that navigation is complete
          window.dispatchEvent(new Event('navigationComplete'));
        });
      });
      return;
    }

    // Show loading indicator
    document.body.classList.add('loading');

    // Fetch with abort support
    fetch(fullPath, { signal: currentAbortController.signal })
      .then(response => {
        if (!response.ok) throw new Error('Page not found');
        return response.text();
      })
      .then(html => {
        document.body.classList.remove('loading');
        if (myToken !== currentNavToken) return;

        // Load styles first, then scripts, then initialize
        return loadPageStyles(html)
          .then(() => {
            // Force reflow after CSS loads
            document.body.offsetHeight;
            return loadPageScripts(html);
          })
          .then(() => {
            const content = extractContent(html);
            if (content) {
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
              window.location.href = fullPath;
            }
          });
      })
      .catch(err => {
        document.body.classList.remove('loading');
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

    e.preventDefault();
    loadPage(url.href, true);
  }

  /**
   * Initialize navigation event listeners
   */
  function initializeNavigation() {
    document.addEventListener('click', handleLinkClick);
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
   * Wait for header/footer to be loaded, then initialize
   */
  function waitForHeaderFooter() {
    const checkInterval = setInterval(() => {
      const header = document.querySelector('#header-placeholder > *');
      const footer = document.querySelector('#footer-placeholder > *');
      if (header && footer) {
        clearInterval(checkInterval);
        headerFooterLoaded = true;
        initializeNavigation();
        
        // Dispatch event to notify burger menu can initialize
        window.dispatchEvent(new Event('navigationComplete'));
        
        updateActiveNav(window.location.pathname);

        const fullPath = window.location.pathname + window.location.search + window.location.hash;
        currentPath = fullPath;
        history.replaceState({ page: fullPath, cacheKey: window.location.pathname }, '', fullPath);

        // Cache current page content
        const content = extractContent(document.documentElement.outerHTML);
        if (content) {
          contentCache[window.location.pathname] = content;
        }
        
        // Initialize current page
        initializePage(window.location.pathname);
      }
    }, 50);

    setTimeout(() => {
      clearInterval(checkInterval);
      if (!headerFooterLoaded) {
        console.warn('Header/footer not loaded, navigation system may not work properly');
        initializeNavigation();
        const fullPath = window.location.pathname + window.location.search + window.location.hash;
        currentPath = fullPath;
        history.replaceState({ page: fullPath, cacheKey: window.location.pathname }, '', fullPath);
      }
    }, 5000);
  }

  /**
   * Initialize on page load
   */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForHeaderFooter);
  } else {
    waitForHeaderFooter();
  }
})();