/**
 * cursor.js — Custom cursor (outer ring + inner dot)
 */
export function initCursor() {
  // Don't run on touch devices
  if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;

  const outer = document.createElement('div');
  const inner = document.createElement('div');
  outer.className = 'cursor-outer';
  inner.className = 'cursor-inner';
  document.body.append(outer, inner);

  let mx = -100, my = -100;  // off-screen until first move
  let ox = -100, oy = -100;  // outer lags slightly

  // Outer follows with a slight lag via lerp in rAF
  function lerp(a, b, t) { return a + (b - a) * t; }

  function tick() {
    ox = lerp(ox, mx, 0.18);
    oy = lerp(oy, my, 0.18);
    outer.style.transform = `translate(${ox - 18}px,${oy - 18}px)`;
    inner.style.transform = `translate(${mx - 2.5}px,${my - 2.5}px)`;
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  document.addEventListener('pointermove', e => {
    mx = e.clientX;
    my = e.clientY;
    document.body.classList.remove('cursor-out');
  }, { passive: true });

  document.addEventListener('pointerleave', () => {
    document.body.classList.add('cursor-out');
  });

  // Hover state on interactive elements
  const INTERACTIVE = 'a, button, [role="button"], input, select, textarea, label, [data-specular], .opt, .nav-item';
  document.addEventListener('pointerover', e => {
    if (e.target.closest(INTERACTIVE)) {
      document.body.classList.add('cursor-hover');
    }
  }, { passive: true });
  document.addEventListener('pointerout', e => {
    if (e.target.closest(INTERACTIVE)) {
      document.body.classList.remove('cursor-hover');
    }
  }, { passive: true });

  // Click flash
  document.addEventListener('pointerdown', () => {
    document.body.classList.add('cursor-click');
  }, { passive: true });
  document.addEventListener('pointerup', () => {
    document.body.classList.remove('cursor-click');
  }, { passive: true });
}
