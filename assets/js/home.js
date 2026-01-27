// Home page dynamic content
(function () {
    'use strict';

    function displayLatestNews() {
        const newsContainer = document.getElementById('latest-news-item');
        if (!newsContainer) return;

        if (typeof newsItems === 'undefined' || !Array.isArray(newsItems) || newsItems.length === 0) {
            console.log("No news items available");
            newsContainer.innerHTML = `
                <p class="news-date">No news yet</p>
                <h3>Check back soon</h3>
                <p>We haven't posted any news updates yet.</p>
            `;
            return;
        }

        const sortedNews = [...newsItems].sort((a, b) => new Date(b.date) - new Date(a.date));
        const latestNews = sortedNews[0];

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

    function displayUpcomingEvent() {
        const eventContainer = document.getElementById('latest-event-item');
        if (!eventContainer) return;

        if (typeof eventsItems === 'undefined' || !Array.isArray(eventsItems) || eventsItems.length === 0) {
            console.log("No event items available");
            eventContainer.innerHTML = `
                <p class="news-date">Stay tuned!</p>
                <h3>No upcoming events</h3>
                <p>Check back soon for our next scheduled events.</p>
                <a href="/events/" class="text-link">View past events →</a>
            `;
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcomingEvents = eventsItems
            .filter(event => new Date(event.date) >= today)
            .sort((a, b) => new Date(a.date) - new Date(b.date));

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
        // Always try to initialize if elements exist, idempotency is handled by replacing innerHTML
        const newsEventsSection = document.querySelector('.news-events');
        if (!newsEventsSection) {
            // Not on home page
            return;
        }

        console.log("Initializing home page content...");

        // Small safety delay to ensure scripts are fully parsed if loaded async
        // though usually they are blocking.
        displayLatestNews();
        displayUpcomingEvent();
    };

    window.resetHome = function () {
        // Nothing to reset really, DOM is replaced
    };

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', window.initializeHome);
    } else {
        window.initializeHome();
    }
})();
