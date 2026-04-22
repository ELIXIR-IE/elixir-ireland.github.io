// VIBE page logic
(function() {
  'use strict';

  let vibeInitialized = false;

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
  };

  window.resetVibe = function() {
    vibeInitialized = false;
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.initializeVibe);
  } else {
    window.initializeVibe();
  }
})();
