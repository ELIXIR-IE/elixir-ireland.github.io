// Section side-nav: highlights the section in view and handles in-page jumps.
// Shared by every page with a .side-nav (About, Our work, VIBE). Without this
// script the links still work as plain anchors.
(function() {
  'use strict';

  // navigation.js re-injects page scripts on the first AJAX navigation; a
  // second copy would bind every listener twice
  if (window.initializeSideNav) return;

  let teardownSideNav = null;   // removes the active side-nav's listeners

  function initSideNav() {
    var nav = document.querySelector('.side-nav');
    if (!nav) return;

    var items = [];
    nav.querySelectorAll('a[href^="#"]').forEach(function(link) {
      var section = document.getElementById(link.getAttribute('href').slice(1));
      if (section) items.push({ link: link, section: section });
    });
    if (!items.length) return;

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    var current   = null;
    var locked    = false;   // true while a click-triggered scroll is in flight
    var idleTimer = null;
    var ticking   = false;

    function scrollBehavior() {
      return reduceMotion.matches ? 'auto' : 'smooth';
    }

    function atPageBottom() {
      return window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    }

    function setCurrent(item) {
      if (item === current) return;
      current = item;
      items.forEach(function(i) {
        if (i === item) i.link.setAttribute('aria-current', 'location');
        else i.link.removeAttribute('aria-current');
      });

      // Keep the current pill in view in the horizontal (narrow-screen) bar.
      // Sets scrollLeft rather than calling scrollIntoView(), which would also
      // drag the page whenever the bar itself is off-screen.
      if (nav.scrollWidth > nav.clientWidth) {
        var linkBox = item.link.getBoundingClientRect();
        var navBox  = nav.getBoundingClientRect();
        nav.scrollTo({
          left: nav.scrollLeft + linkBox.left - navBox.left - (nav.clientWidth - linkBox.width) / 2,
          behavior: scrollBehavior()
        });
      }
    }

    function update() {
      ticking = false;
      // <main> was swapped out by navigation.js: stop listening
      if (!nav.isConnected) { teardown(); return; }
      if (locked) return;

      // Current = the last section whose top has passed the upper third of the viewport
      var line   = window.innerHeight * 0.3;
      var active = items[0];
      items.forEach(function(item) {
        if (item.section.getBoundingClientRect().top <= line) active = item;
      });
      // A short final section can never reach that line
      if (atPageBottom()) active = items[items.length - 1];
      setCurrent(active);
    }

    function unlock() {
      locked = false;
      // At the bottom of the page the clicked section may not have reached the
      // line; leave the visitor's choice highlighted rather than overriding it
      if (!atPageBottom()) update();
    }

    function onScroll() {
      if (locked) {
        // Hold the clicked item until the scroll settles, so the highlight
        // doesn't flicker through every section passed on the way
        clearTimeout(idleTimer);
        idleTimer = setTimeout(unlock, 150);
        return;
      }
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }

    function onClick(e) {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var link = e.target.closest('a[href^="#"]');
      var item = link && items.find(function(i) { return i.link === link; });
      if (!item) return;
      e.preventDefault();

      locked = true;
      clearTimeout(idleTimer);
      idleTimer = setTimeout(unlock, 150);
      setCurrent(item);
      item.section.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });

      // replaceState keeps the URL shareable without stacking a Back press per
      // jump (navigation.js would also re-fetch the page on each of those)
      history.replaceState(history.state, '', link.getAttribute('href'));

      // Move focus with the jump, as a native anchor would, so keyboard and
      // screen-reader users carry on from the section rather than the nav
      var section = item.section;
      section.setAttribute('tabindex', '-1');
      section.addEventListener('blur', function() {
        section.removeAttribute('tabindex');
      }, { once: true });
      section.focus({ preventScroll: true });
    }

    function teardown() {
      nav.removeEventListener('click', onClick);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      clearTimeout(idleTimer);
      if (teardownSideNav === teardown) teardownSideNav = null;
    }

    nav.addEventListener('click', onClick);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    teardownSideNav = teardown;

    update();
  }

  window.resetSideNav = function() {
    if (teardownSideNav) teardownSideNav();
  };

  window.initializeSideNav = function() {
    window.resetSideNav();
    initSideNav();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.initializeSideNav);
  } else {
    window.initializeSideNav();
  }

  // Re-initialize after navigation.js swaps <main>
  window.addEventListener('navigationComplete', window.initializeSideNav);
})();
