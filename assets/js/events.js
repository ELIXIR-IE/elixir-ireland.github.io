// Events page logic with singleton pattern
(function() {
  'use strict';

  // Prevent multiple initializations
  let eventsInitialized = false;

  window.initializeEvents = function() {
    // Check if already initialized
    if (eventsInitialized) {
      console.log("Events already initialized, skipping");
      return;
    }

    // Check if we are on the events page
    const eventsContainer = document.getElementById('events-container');
    if (!eventsContainer) {
      console.log("Events container not found, skipping initialization");
      return;
    }
    
    // Check if eventsItems data is available
    if (typeof eventsItems === 'undefined') {
      console.error("eventsItems data not loaded yet");
      return;
    }

    eventsInitialized = true;
    console.log("Initializing events with items:", eventsItems.length);

    const paginationContainer = document.getElementById('events-pagination-container');
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    if (!filterButtons || filterButtons.length === 0) {
      console.warn("Filter buttons not found");
    }
    
    const itemsPerPage = 6;
    let currentPage = 1;
    let currentFilter = 'all';
    let filteredEvents = [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Categorize and sort events
    function categorizeEvents() {
        const upcoming = [];
        const past = [];

        eventsItems.forEach(event => {
            const eventDate = new Date(event.date);
            eventDate.setHours(0, 0, 0, 0);
            
            if (eventDate >= today) {
                upcoming.push(event);
            } else {
                past.push(event);
            }
        });

        upcoming.sort((a, b) => new Date(a.date) - new Date(b.date));
        past.sort((a, b) => new Date(b.date) - new Date(a.date));

        return { upcoming, past };
    }

    const { upcoming, past } = categorizeEvents();

    function filterEvents(filter) {
        currentFilter = filter;
        
        if (filter === 'upcoming') {
            filteredEvents = upcoming;
        } else if (filter === 'past') {
            filteredEvents = past;
        } else {
            filteredEvents = [...upcoming, ...past];
        }
        
        displayEvents(1);
    }

    function displayEvents(page) {
        eventsContainer.innerHTML = '';
        page = page || 1;
        currentPage = page;

        if (filteredEvents.length === 0) {
            eventsContainer.innerHTML = '<p class="no-events-message">No events to display.</p>';
            paginationContainer.innerHTML = '';
            return;
        }

        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedItems = filteredEvents.slice(startIndex, endIndex);

        paginatedItems.forEach(item => {
            const eventCard = document.createElement('div');
            eventCard.className = 'card';

            const eventDate = new Date(item.date);
            eventDate.setHours(0, 0, 0, 0);
            const isUpcoming = eventDate >= today;

            if (item.image) {
                const cardImage = document.createElement('img');
                cardImage.className = 'card-image';
                cardImage.src = item.image;
                cardImage.alt = item.title;
                cardImage.loading = 'lazy';
                eventCard.appendChild(cardImage);
            }

            const cardContent = document.createElement('div');
            cardContent.className = 'card-content';

            const statusBadge = document.createElement('span');
            statusBadge.className = `event-status-badge ${isUpcoming ? 'upcoming' : 'past'}`;
            statusBadge.textContent = isUpcoming ? 'Upcoming' : 'Past Event';
            cardContent.appendChild(statusBadge);

            const title = document.createElement('h3');
            title.className = 'card-title';
            title.textContent = item.title;

            const date = document.createElement('div');
            date.className = 'card-date';
            date.innerHTML = `<strong>📅 ${new Date(item.date).toLocaleDateString('en-IE', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>`;

            const location = document.createElement('div');
            location.className = 'card-location';
            location.innerHTML = `<strong>📍 ${item.location}</strong>`;

            const summary = document.createElement('p');
            summary.className = 'card-text';
            summary.textContent = item.summary;

            const buttonsContainer = document.createElement('div');
            buttonsContainer.className = 'card-buttons';

            const readMore = document.createElement('a');
            readMore.href = item.link;
            readMore.className = 'card-link';
            readMore.textContent = 'Learn More →';
            buttonsContainer.appendChild(readMore);

            if (isUpcoming && item.registrationLink) {
                const registerBtn = document.createElement('a');
                registerBtn.href = item.registrationLink;
                registerBtn.className = 'card-link register-btn';
                registerBtn.textContent = 'Register →';
                buttonsContainer.appendChild(registerBtn);
            }

            cardContent.appendChild(title);
            cardContent.appendChild(date);
            cardContent.appendChild(location);
            cardContent.appendChild(summary);
            cardContent.appendChild(buttonsContainer);
            eventCard.appendChild(cardContent);
            eventsContainer.appendChild(eventCard);
        });
        
        // Force style recalculation on newly added elements
        requestAnimationFrame(() => {
            document.body.offsetHeight;
            void document.body.offsetWidth;
            // Force computed style check on register buttons
            const registerButtons = document.querySelectorAll('.register-btn');
            registerButtons.forEach(btn => {
                window.getComputedStyle(btn).getPropertyValue('color');
                window.getComputedStyle(btn).getPropertyValue('background-color');
            });
        });
        
        setupPagination();
    }

    function setupPagination() {
        paginationContainer.innerHTML = '';
        const pageCount = Math.ceil(filteredEvents.length / itemsPerPage);

        if (pageCount <= 1) return;

        const prevButton = document.createElement('button');
        prevButton.textContent = 'Prev';
        prevButton.disabled = currentPage === 1;
        prevButton.addEventListener('click', () => {
            if (currentPage > 1) {
                displayEvents(currentPage - 1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
        paginationContainer.appendChild(prevButton);

        for (let i = 1; i <= pageCount; i++) {
            const pageButton = document.createElement('button');
            pageButton.textContent = i;
            if (i === currentPage) {
                pageButton.classList.add('active');
            }
            pageButton.addEventListener('click', () => {
                displayEvents(i);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
            paginationContainer.appendChild(pageButton);
        }

        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next';
        nextButton.disabled = currentPage === pageCount;
        nextButton.addEventListener('click', () => {
            if (currentPage < pageCount) {
                displayEvents(currentPage + 1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
        paginationContainer.appendChild(nextButton);
    }

    if (filterButtons && filterButtons.length > 0) {
      filterButtons.forEach(button => {
          button.addEventListener('click', () => {
              filterButtons.forEach(btn => btn.classList.remove('active'));
              button.classList.add('active');
              const filter = button.getAttribute('data-filter');
              filterEvents(filter);
          });
      });
    }

    filterEvents('all');
  };

  // Reset function for navigation system
  window.resetEvents = function() {
    eventsInitialized = false;
  };

  // Auto-initialize on DOM ready (for direct page load)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.initializeEvents);
  } else {
    window.initializeEvents();
  }
})();
