// News page logic with singleton pattern
(function() {
  'use strict';

  // Prevent multiple initializations
  let newsInitialized = false;

  window.initializeNews = function() {
    // Check if already initialized
    if (newsInitialized) {
      console.log("News already initialized, skipping");
      return;
    }

    // Check if we are on a page that needs this functionality
    const newsContainer = document.getElementById('news-container');
    if (!newsContainer) {
      console.log("News container not found, skipping initialization");
      return;
    }

    // Check if newsItems data is available
    if (typeof newsItems === 'undefined') {
      console.error("newsItems data not loaded yet");
      return;
    }

    newsInitialized = true;
    console.log("Initializing news with items:", newsItems.length);

    const paginationContainer = document.getElementById('pagination-container');
    const itemsPerPage = 6;
    let currentPage = 1;

    // Sort news items by date, newest first
    const sortedNewsItems = newsItems.sort((a, b) => new Date(b.date) - new Date(a.date));

    function displayNews(page) {
        newsContainer.innerHTML = '';
        page = page || 1;
        currentPage = page;

        if (sortedNewsItems.length === 0) {
            newsContainer.innerHTML = '<p class="no-news-message">No news items to display.</p>';
            paginationContainer.innerHTML = '';
            return;
        }

        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedItems = sortedNewsItems.slice(startIndex, endIndex);

        paginatedItems.forEach(item => {
            const newsCard = document.createElement('div');
            newsCard.className = 'card';

            if (item.image) {
                const cardImage = document.createElement('img');
                cardImage.className = 'card-image';
                cardImage.src = item.image;
                cardImage.alt = item.title;
                cardImage.loading = 'lazy';
                newsCard.appendChild(cardImage);
            }

            const cardContent = document.createElement('div');
            cardContent.className = 'card-content';

            const title = document.createElement('h3');
            title.className = 'card-title';
            title.textContent = item.title;

            const date = document.createElement('div');
            date.className = 'card-date';
            date.textContent = new Date(item.date).toLocaleDateString('en-IE', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });

            const summary = document.createElement('p');
            summary.className = 'card-text';
            summary.textContent = item.summary;

            const readMore = document.createElement('a');
            readMore.href = item.link;
            readMore.className = 'card-link';
            readMore.textContent = 'Read More →';

            cardContent.appendChild(title);
            cardContent.appendChild(date);
            cardContent.appendChild(summary);
            cardContent.appendChild(readMore);
            newsCard.appendChild(cardContent);
            newsContainer.appendChild(newsCard);
        });
        
        setupPagination();
    }

    function setupPagination() {
        paginationContainer.innerHTML = '';
        const pageCount = Math.ceil(sortedNewsItems.length / itemsPerPage);

        if (pageCount <= 1) return;

        const prevButton = document.createElement('button');
        prevButton.textContent = 'Prev';
        prevButton.disabled = currentPage === 1;
        prevButton.addEventListener('click', () => {
            if (currentPage > 1) {
                displayNews(currentPage - 1);
                window.scrollTo({top: 0, behavior: 'smooth'});
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
                displayNews(i);
                window.scrollTo({top: 0, behavior: 'smooth'});
            });
            paginationContainer.appendChild(pageButton);
        }

        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next';
        nextButton.disabled = currentPage === pageCount;
        nextButton.addEventListener('click', () => {
            if (currentPage < pageCount) {
                displayNews(currentPage + 1);
                window.scrollTo({top: 0, behavior: 'smooth'});
            }
        });
        paginationContainer.appendChild(nextButton);
    }

    displayNews(1);
  };

  // Reset function for navigation system
  window.resetNews = function() {
    newsInitialized = false;
  };

  // Auto-initialize on DOM ready (for direct page load)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.initializeNews);
  } else {
    // DOM already loaded
    window.initializeNews();
  }
})();
