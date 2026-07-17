/**
 * main.js — App entry point (Revamped 2026)
 */
import { initNavigation }         from './navigation.js';
import { initAnimations }         from './animations.js';
import { initForm }               from './form.js';
import { initCursor }             from './cursor.js';
import { initAllSpecularButtons } from './specular-button.js';
import { injectNav }              from './nav.js';

document.addEventListener('DOMContentLoaded', () => {
  // Inject nav first so navigation.js can find it
  injectNav();
  initNavigation();
  initAnimations();
  initForm();
  initCursor();
  requestAnimationFrame(initAllSpecularButtons);
});
