/**
 * Main Entry Point
 * Initializes all modules when the DOM is ready
 */

import Navigation from './navigation.js';
import Animations from './animations.js';
import ContactForm from './form.js';

/**
 * Initialize the entire application
 */
function init() {
    Navigation.init();
    Animations.init();
    ContactForm.init();
}

// Run when DOM is parsed
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
