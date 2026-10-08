// UI Interactions (Burger Menu, etc.)
(function () {
    'use strict';

    // The header persists across AJAX navigations, so this binds exactly once.
    // Re-binding left stale listeners that closed the panel without resetting
    // the button, leaving the icon stuck as an X.
    let initialized = false;

    function initBurgerMenu() {
        if (initialized) return;

        const burger = document.querySelector('.burger-menu');
        const nav = document.querySelector('.header-nav');
        const navList = document.querySelector('.nav-list');

        if (!burger || !nav) {
            console.warn('Burger menu or nav not found');
            return;
        }

        initialized = true;

        // Single source of truth: button, panel and scroll lock always move together
        function setOpen(open) {
            burger.classList.toggle('active', open);
            burger.setAttribute('aria-expanded', open ? 'true' : 'false');
            nav.classList.toggle('active', open);
            if (navList) navList.classList.toggle('active', open);

            // Prevent body scroll when menu is open on mobile
            document.body.style.overflow = open ? 'hidden' : '';
        }

        function isOpen() {
            return nav.classList.contains('active');
        }

        burger.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            setOpen(!isOpen());
        });

        // Close menu when clicking on a nav link
        nav.addEventListener('click', function (event) {
            if (event.target.closest('.nav-link')) {
                setOpen(false);
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', function (event) {
            if (isOpen() && !burger.contains(event.target) && !nav.contains(event.target)) {
                setOpen(false);
            }
        });

        // Handle window resize
        let resizeTimer;
        window.addEventListener('resize', function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {
                if (window.innerWidth > 1024 && isOpen()) {
                    setOpen(false);
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
})();
