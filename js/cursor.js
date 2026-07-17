/**
 * cursor.js — mix-blend-mode: difference cursor
 * Based on codepen.io/victorhripko/pen/rqOJBG
 * White circle that inverts underlying colours — always visible.
 */
export function initCursor() {
  // Skip touch devices
  if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;

  // Create the cursor element (or reuse if already exists)
  let cursor = document.querySelector('.custom-cursor');
  if (!cursor) {
    cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    document.body.appendChild(cursor);
  }

  let isCursorInited = false;

  const initCursorState = () => {
    cursor.classList.add('custom-cursor--init');
    isCursorInited = true;
  };

  const destroyCursorState = () => {
    cursor.classList.remove('custom-cursor--init');
    isCursorInited = false;
  };

  // Track all interactive elements — including dynamically added ones
  function bindLinks() {
    const SELECTOR = 'a, button, [role="button"], input, select, textarea, label, .opt, .btn, .btn-primary, .btn-ghost, .btn-champ, .nav-cta, .pillar-cta, [data-specular]';
    document.querySelectorAll(SELECTOR).forEach(el => {
      if (el._cursorBound) return;
      el._cursorBound = true;
      el.addEventListener('mouseover', () => cursor.classList.add('custom-cursor--link'));
      el.addEventListener('mouseout',  () => cursor.classList.remove('custom-cursor--link'));
    });
  }
  bindLinks();

  // Rebind on any DOM changes (for dynamically rendered quiz options etc.)
  const mo = new MutationObserver(() => bindLinks());
  mo.observe(document.body, { childList: true, subtree: true });

  // Move cursor
  document.addEventListener('mousemove', e => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top  = e.clientY + 'px';
    if (!isCursorInited) initCursorState();
  }, { passive: true });

  document.addEventListener('mouseleave', destroyCursorState);
  document.addEventListener('mouseenter', () => {
    if (!isCursorInited) initCursorState();
  });
}
