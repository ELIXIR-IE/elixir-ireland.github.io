// Home page dynamic content with singleton pattern
(function () {
    'use strict';

    // Prevent multiple initializations
    let homeInitialized = false;

    function displayLatestNews() {
        if (typeof newsItems === 'undefined' || newsItems.length === 0) {
            console.log("No news items available");
            return;
        }

        const sortedNews = [...newsItems].sort((a, b) => new Date(b.date) - new Date(a.date));
        const latestNews = sortedNews[0];
        const newsContainer = document.getElementById('latest-news-item');

        if (newsContainer) {
            const date = new Date(latestNews.date).toLocaleDateString('en-IE', {
                year: 'numeric', month: 'long', day: 'numeric'
            });

            newsContainer.innerHTML = `
          <p class="news-date">${date}</p>
          <h3>${latestNews.title}</h3>
          <p>${latestNews.summary}</p>
          <a href="${latestNews.link || 'news.html'}" class="text-link">Read more →</a>
        `;
        }
    }

    function displayUpcomingEvent() {
        if (typeof eventsItems === 'undefined' || eventsItems.length === 0) {
            console.log("No event items available");
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcomingEvents = eventsItems
            .filter(event => new Date(event.date) >= today)
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        const eventContainer = document.getElementById('latest-event-item');
        if (!eventContainer) return;

        if (upcomingEvents.length > 0) {
            const nextEvent = upcomingEvents[0];
            const date = new Date(nextEvent.date).toLocaleDateString('en-IE', {
                year: 'numeric', month: 'long', day: 'numeric'
            });

            eventContainer.innerHTML = `
          <p class="news-date">${date}</p>
          <h3>${nextEvent.title}</h3>
          <p>${nextEvent.summary || 'Join us for this upcoming event. Click below for more details.'}</p>
          <a href="${nextEvent.link || 'events.html'}" class="text-link">View details →</a>
        `;
        } else {
            eventContainer.innerHTML = `
          <p class="news-date">Stay tuned!</p>
          <h3>No upcoming events</h3>
          <p>Check back soon for our next scheduled events.</p>
          <a href="/events/" class="text-link">View past events →</a>
        `;
        }
    }

    window.initializeHome = function () {
        // Check if already initialized
        if (homeInitialized) {
            console.log("Home already initialized, skipping");
            return;
        }

        // Check if we're on the home page elements
        const newsEventsSection = document.querySelector('.news-events');
        if (!newsEventsSection) {
            console.log("Home page elements not found, skipping initialization");
            return;
        }

        homeInitialized = true;
        console.log("Initializing home page");

        displayLatestNews();
        displayUpcomingEvent();
    };

    // Reset function for navigation system
    window.resetHome = function () {
        homeInitialized = false;
    };

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', window.initializeHome);
    } else {
        window.initializeHome();
    }
})();
