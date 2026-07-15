/**
 * animations.js — Loader, scroll-reveal, stat counters (Revamped 2026)
 */
export function initAnimations() {
  // ── Page Loader ───────────────────────────────────────────────
  const loader = document.querySelector('.loader');
  if (loader) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        loader.classList.add('hidden');
        document.body.classList.remove('loading');
      }, 1600);
    });
  } else {
    document.body.classList.remove('loading');
  }

  // ── Scroll Reveal (IntersectionObserver) ─────────────────────
  const revealEls = document.querySelectorAll('.reveal, .reveal-children');
  if (revealEls.length) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => revealObserver.observe(el));
  }

  // ── Stat Counters ─────────────────────────────────────────────
  const statEls = document.querySelectorAll('.stat-num[data-target]');
  if (statEls.length) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    statEls.forEach(el => counterObserver.observe(el));
  }

  // ── Authority image lazy-load placeholder ─────────────────────
  document.querySelectorAll('.authority-img-wrap img').forEach(img => {
    img.addEventListener('error', () => {
      const wrap = img.closest('.authority-img-wrap');
      if (wrap) {
        const ph = document.createElement('div');
        ph.className = 'authority-img-placeholder';
        ph.innerHTML = '<span>Portrait</span>';
        wrap.replaceChild(ph, img);
      }
    });
  });
}

function animateCounter(el) {
  const target   = parseInt(el.dataset.target, 10);
  const prefix   = el.dataset.prefix  || '';
  const suffix   = el.dataset.suffix  || '';
  const duration = 2000;
  const start    = performance.now();

  function update(now) {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease-out cubic
    const eased    = 1 - Math.pow(1 - progress, 3);
    const current  = Math.floor(eased * target);
    el.textContent = prefix + current + suffix;
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = prefix + target + suffix;
  }

  requestAnimationFrame(update);
}
