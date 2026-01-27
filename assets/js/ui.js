// UI Interactions (Burger Menu, etc.)
(function () {
    'use strict';

    function initBurgerMenu() {
        console.log('Initializing Burger Menu');
        const burger = document.querySelector('.burger-menu');
        const nav = document.querySelector('.header-nav');
        const navList = document.querySelector('.nav-list');

        if (!burger || !nav) {
            console.warn('Burger menu or nav not found');
            return;
        }

        // Remove old event listeners by cloning
        // This handles re-initialization safely
        const newBurger = burger.cloneNode(true);
        burger.parentNode.replaceChild(newBurger, burger);

        newBurger.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Burger menu clicked');

            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            console.log('Current state:', isExpanded ? 'expanded' : 'collapsed');

            this.setAttribute('aria-expanded', !isExpanded);
            this.classList.toggle('active');
            nav.classList.toggle('active');
            if (navList) navList.classList.toggle('active');

            // Prevent body scroll when menu is open on mobile
            if (!isExpanded) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });

        // Close menu when clicking on a nav link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function () {
                newBurger.classList.remove('active');
                nav.classList.remove('active');
                if (navList) navList.classList.remove('active');
                newBurger.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function (event) {
            if (!newBurger.contains(event.target) && !nav.contains(event.target)) {
                if (nav.classList.contains('active')) {
                    newBurger.classList.remove('active');
                    nav.classList.remove('active');
                    if (navList) navList.classList.remove('active');
                    newBurger.setAttribute('aria-expanded', 'false');
                    document.body.style.overflow = '';
                }
            }
        });

        // Handle window resize
        let resizeTimer;
        window.addEventListener('resize', function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {
                if (window.innerWidth > 1024) {
                    newBurger.classList.remove('active');
                    nav.classList.remove('active');
                    if (navList) navList.classList.remove('active');
                    newBurger.setAttribute('aria-expanded', 'false');
                    document.body.style.overflow = '';
                }
            }, 250);
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initBurgerMenu);
    } else {
        initBurgerMenu();
    }

    // Re-initialize after navigation (for AJAX page loads if any)
    window.addEventListener('navigationComplete', initBurgerMenu);
})();
