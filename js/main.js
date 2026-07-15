/**
 * main.js — App entry point (Revamped 2026)
 * Imports and initialises all modules on DOMContentLoaded.
 */
import { initNavigation } from './navigation.js';
import { initAnimations } from './animations.js';
import { initForm }       from './form.js';

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initAnimations();
  initForm();
});
