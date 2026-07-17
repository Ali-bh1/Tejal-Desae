/**
 * nav.js — Inject consistent navbar + mobile menu on every page.
 * The nav links use absolute paths so they work on any page.
 * The nav CTA routes to the assessment.
 */
export function injectNav() {
  // Don't double-inject
  if (document.querySelector('.nav')) return;

  const isHome = location.pathname.endsWith('index.html') || location.pathname === '/' || location.pathname.endsWith('/');

  // Helper: prefix with index.html# for non-home pages
  const href = (anchor) => isHome ? anchor : `index.html${anchor}`;

  const navHTML = `
  <nav class="nav${isHome ? '' : ' scrolled'}" aria-label="Main navigation">
    <a href="${isHome ? '#' : 'index.html'}" class="nav-logo">Tejal Desae</a>
    <ul class="nav-links">
      <li><a href="${href('#about')}">About</a></li>
      <li><a href="${href('#work')}">The Work</a></li>
      <li><a href="${href('#testimonials')}">Results</a></li>
      <li><a href="assessment.html">Free Profile</a></li>
    </ul>
    <a href="assessment.html" class="nav-cta" data-specular>Discover Your Profile</a>
    <button class="nav-toggle" aria-label="Toggle menu" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>
  </nav>

  <div class="mobile-menu" aria-hidden="true">
    <a href="${href('#about')}">About</a>
    <a href="${href('#work')}">The Work</a>
    <a href="assessment.html">Free Profile</a>
    <a href="${href('#testimonials')}">Results</a>
    <a href="${href('#contact')}">Contact</a>
  </div>`;

  document.body.insertAdjacentHTML('afterbegin', navHTML);
}
