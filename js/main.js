/**
 * main.js — App entry point (Revamped 2026)
 */
import { initNavigation }         from './navigation.js';
import { initAnimations }         from './animations.js';
import { initForm }               from './form.js';
import { initCursor }             from './cursor.js';
import { initAllSpecularButtons } from './specular-button.js';

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initAnimations();
  initForm();
  initCursor();
  // Run specular after a tick so layout is stable
  requestAnimationFrame(initAllSpecularButtons);
});
