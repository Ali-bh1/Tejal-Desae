/**
 * Navigation Module
 * Handles: mobile menu toggle, smooth scroll, active link tracking, nav scroll state
 */

const Navigation = (() => {
    // DOM references
    let nav, toggle, mobileMenu, navLinks, sections;

    /**
     * Initialize navigation
     */
    function init() {
        nav = document.querySelector('.nav');
        toggle = document.querySelector('.nav-toggle');
        mobileMenu = document.querySelector('.mobile-menu');
        navLinks = document.querySelectorAll('.nav-links a, .mobile-menu a');
        sections = document.querySelectorAll('section[id]');

        if (!nav) return;

        bindEvents();
        updateNavOnScroll(); // Set initial state
    }

    /**
     * Bind all navigation event listeners
     */
    function bindEvents() {
        // Mobile menu toggle
        if (toggle && mobileMenu) {
            toggle.addEventListener('click', toggleMobileMenu);
        }

        // Smooth scroll for all nav links
        navLinks.forEach(link => {
            link.addEventListener('click', handleNavClick);
        });

        // Close mobile menu on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileMenu?.classList.contains('open')) {
                closeMobileMenu();
            }
        });

        // Nav scroll state
        window.addEventListener('scroll', updateNavOnScroll, { passive: true });

        // Active section tracking
        window.addEventListener('scroll', updateActiveLink, { passive: true });
    }

    /**
     * Toggle mobile menu open/close
     */
    function toggleMobileMenu() {
        const isOpen = mobileMenu.classList.contains('open');
        if (isOpen) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    }

    function openMobileMenu() {
        mobileMenu.classList.add('open');
        toggle.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeMobileMenu() {
        mobileMenu.classList.remove('open');
        toggle.classList.remove('open');
        document.body.style.overflow = '';
    }

    /**
     * Handle click on nav links — smooth scroll + close mobile menu
     */
    function handleNavClick(e) {
        const href = e.currentTarget.getAttribute('href');
        if (!href || !href.startsWith('#')) return;

        e.preventDefault();
        const target = document.querySelector(href);
        if (!target) return;

        // Close mobile menu if open
        if (mobileMenu?.classList.contains('open')) {
            closeMobileMenu();
        }

        // Smooth scroll with offset for fixed nav
        const offset = nav.offsetHeight + 20;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;

        window.scrollTo({
            top,
            behavior: 'smooth'
        });
    }

    /**
     * Add/remove scrolled class on nav based on scroll position
     */
    function updateNavOnScroll() {
        if (!nav) return;
        if (window.scrollY > 60) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    }

    /**
     * Highlight the nav link whose section is currently in view
     */
    function updateActiveLink() {
        if (!sections.length) return;

        const scrollPos = window.scrollY + nav.offsetHeight + 100;

        sections.forEach(section => {
            const top = section.offsetTop;
            const bottom = top + section.offsetHeight;
            const id = section.getAttribute('id');

            // Find matching desktop nav links
            const desktopLink = document.querySelector(`.nav-links a[href="#${id}"]`);

            if (scrollPos >= top && scrollPos < bottom) {
                desktopLink?.classList.add('active');
            } else {
                desktopLink?.classList.remove('active');
            }
        });
    }

    return { init };
})();

export default Navigation;
