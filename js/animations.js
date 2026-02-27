/**
 * Animations Module
 * Handles: scroll-triggered reveals, stat counter animation, loader
 */

const Animations = (() => {
    let observer;

    /**
     * Initialize all animations
     */
    function init() {
        initLoader();
        initScrollReveal();
        initStatCounters();
    }

    /**
     * Loader — hides after page is ready
     */
    function initLoader() {
        const loader = document.querySelector('.loader');
        if (!loader) return;

        // Hide loader after content is ready
        window.addEventListener('load', () => {
            setTimeout(() => {
                loader.classList.add('hidden');
                document.body.classList.remove('loading');
            }, 1800); // Show loader for 1.8s for brand impression
        });
    }

    /**
     * Scroll Reveal — observes .reveal and .reveal-children elements
     */
    function initScrollReveal() {
        const revealElements = document.querySelectorAll('.reveal, .reveal-children');
        if (!revealElements.length) return;

        observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target); // Only animate once
                    }
                });
            },
            {
                threshold: 0.15,
                rootMargin: '0px 0px -50px 0px'
            }
        );

        revealElements.forEach(el => observer.observe(el));
    }

    /**
     * Stat Counter — animates numbers when they scroll into view
     */
    function initStatCounters() {
        const stats = document.querySelectorAll('.stat-num[data-target]');
        if (!stats.length) return;

        const counterObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        animateCounter(entry.target);
                        counterObserver.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.5 }
        );

        stats.forEach(stat => counterObserver.observe(stat));
    }

    /**
     * Animate a single counter from 0 to target
     */
    function animateCounter(element) {
        const target = parseInt(element.dataset.target, 10);
        const prefix = element.dataset.prefix || '';
        const suffix = element.dataset.suffix || '';
        const duration = 2000; // 2 seconds
        const startTime = performance.now();

        function updateCount(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(eased * target);

            element.textContent = `${prefix}${current.toLocaleString()}${suffix}`;

            if (progress < 1) {
                requestAnimationFrame(updateCount);
            }
        }

        requestAnimationFrame(updateCount);
    }

    return { init };
})();

export default Animations;
