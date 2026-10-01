// VIBE page logic
(function() {
  'use strict';

  let vibeInitialized = false;
  let teardownSideNav = null;   // removes the active side-nav's listeners

  // Short display names for filter buttons
  const INSTITUTION_SHORT = {
    'Dublin City University':       'DCU',
    'Maynooth University':          'Maynooth',
    'Munster Technological University': 'MTU',
    'Queens University Belfast':    'QUB',
    'RCSI':                         'RCSI',
    'Teagasc':                      'Teagasc',
    'Technological University Dublin': 'TU Dublin',
    'Trinity College Dublin':       'TCD',
    'Ulster University':            'Ulster',
    'University College Cork':      'UCC',
    'University College Dublin':    'UCD',
    'University of Galway':         'Galway',
    'University of Limerick':       'UL'
  };

  function buildPiFilterBar() {
    var grid    = document.getElementById('pi-grid-container');
    var bar     = document.getElementById('pi-filter-bar');
    var countEl = document.getElementById('pi-visible-count');
    var hint    = document.getElementById('pi-browse-hint');
    if (!grid || !bar) return;

    var cards = Array.from(grid.querySelectorAll('.pi-card'));
    if (!cards.length) return;

    // Hide all cards initially
    cards.forEach(function(c) { c.classList.add('pi-hidden'); });

    // Count per institution
    var counts = {};
    cards.forEach(function(c) {
      var aff = c.dataset.affiliation || 'Other';
      counts[aff] = (counts[aff] || 0) + 1;
    });

    // Alphabetical order by displayed short name
    var institutions = Object.keys(counts).sort(function(a, b) {
      var shortA = INSTITUTION_SHORT[a] || a;
      var shortB = INSTITUTION_SHORT[b] || b;
      return shortA.localeCompare(shortB);
    });

    bar.innerHTML = '';

    // "All" — visually distinct
    var allBtn = document.createElement('button');
    allBtn.className = 'pi-filter-btn pi-filter-btn--all';
    allBtn.dataset.filter = 'all';
    allBtn.setAttribute('aria-pressed', 'false');
    allBtn.innerHTML = 'All <span class="pi-filter-count">' + cards.length + '</span>';
    allBtn.addEventListener('click', function() {
      toggleFilter('all', bar, cards, countEl, hint);
    });
    bar.appendChild(allBtn);

    // Separator
    var sep = document.createElement('span');
    sep.className = 'pi-filter-sep';
    sep.setAttribute('aria-hidden', 'true');
    bar.appendChild(sep);

    // Institution buttons (alphabetical)
    institutions.forEach(function(institution) {
      var btn = document.createElement('button');
      btn.className = 'pi-filter-btn';
      btn.dataset.filter = institution;
      btn.setAttribute('aria-pressed', 'false');
      var short = INSTITUTION_SHORT[institution] || institution;
      btn.innerHTML = short + ' <span class="pi-filter-count">' + counts[institution] + '</span>';
      btn.addEventListener('click', function() {
        toggleFilter(institution, bar, cards, countEl, hint);
      });
      bar.appendChild(btn);
    });

    if (countEl) countEl.textContent = '';
  }

  function toggleFilter(institution, bar, cards, countEl, hint) {
    var btn = bar.querySelector('[data-filter="' + institution + '"]');
    var isActive = btn && btn.classList.contains('active');

    // Deactivate everything
    bar.querySelectorAll('.pi-filter-btn').forEach(function(b) {
      b.classList.remove('active');
      b.setAttribute('aria-pressed', 'false');
    });

    if (isActive) {
      // Toggle off: hide all cards again, restore hint
      cards.forEach(function(c) { c.classList.add('pi-hidden'); });
      if (hint) hint.hidden = false;
      if (countEl) countEl.textContent = '';
      return;
    }

    // Activate selected
    if (btn) {
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
    }
    if (hint) hint.hidden = true;

    var visible = 0;
    cards.forEach(function(c) {
      var match = institution === 'all' || c.dataset.affiliation === institution;
      c.classList.toggle('pi-hidden', !match);
      if (match) visible++;
    });

    if (countEl) countEl.textContent = visible + ' researcher' + (visible !== 1 ? 's' : '');
  }

  // Section side-nav: highlights the section in view and handles in-page jumps.
  // Without this the links still work as plain anchors.
  function initSideNav() {
    var nav = document.getElementById('vibe-sidenav');
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

  window.initializeVibe = function() {
    if (vibeInitialized) return;

    var vibeArchive = document.getElementById('vibe-events-archive');
    if (!vibeArchive) return;

    vibeInitialized = true;

    // VIBE year accordion
    window.toggleVibeYear = function(yearId) {
      var content = document.getElementById(yearId + '-content');
      var icon    = document.getElementById(yearId + '-icon');
      if (!content || !icon) return;
      var expanded = icon.classList.contains('expanded');
      content.classList.toggle('expanded', !expanded);
      icon.classList.toggle('expanded', !expanded);
    };

    buildPiFilterBar();
    initSideNav();
  };

  window.resetVibe = function() {
    vibeInitialized = false;
    if (teardownSideNav) teardownSideNav();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.initializeVibe);
  } else {
    window.initializeVibe();
  }
})();
