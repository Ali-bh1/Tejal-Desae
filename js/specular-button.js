/**
 * specular-button.js
 * Vanilla JS port of the SpecularButton (Reactbits) using Canvas 2D.
 * Auto-applies to all .btn-primary, .btn-ghost, .btn-champ, .btn-ghost--dark,
 * .btn-champ, [data-specular] elements.
 *
 * Colors per variant:
 *   btn-primary   → gold rim  (#C7AC6D) on forest bg
 *   btn-ghost     → gold rim  (#C7AC6D) on transparent/dark bg
 *   btn-champ     → white rim (#ffffff) on gold bg
 *   btn-ghost--dark → forest rim (#154230) on transparent/light bg
 */

const PAD = 20;

function hexToRgb(hex) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  return r ? [parseInt(r[1],16)/255, parseInt(r[2],16)/255, parseInt(r[3],16)/255] : [1,1,1];
}

function getVariantConfig(btn) {
  if (btn.classList.contains('btn-champ')) {
    return { lineColor: '#ffffff', baseColor: '#C7AC6D', intensity: 1.6, thickness: 1.2 };
  }
  if (btn.classList.contains('btn-ghost--dark')) {
    return { lineColor: '#2A6B52', baseColor: '#154230', intensity: 1.2, thickness: 1.0 };
  }
  if (btn.classList.contains('btn-ghost')) {
    return { lineColor: '#E6D3A3', baseColor: '#C7AC6D', intensity: 1.4, thickness: 1.0 };
  }
  // btn-primary, btn, nav-cta, data-specular default
  return { lineColor: '#C7AC6D', baseColor: '#0E3122', intensity: 1.5, thickness: 1.2 };
}

function initSpecularButton(btn) {
  if (btn._specularInit) return;
  btn._specularInit = true;

  const variant = getVariantConfig(btn);
  const lineColor   = hexToRgb(btn.dataset.lineColor  || variant.lineColor);
  const baseColor   = hexToRgb(btn.dataset.baseColor  || variant.baseColor);
  const intensity   = parseFloat(btn.dataset.intensity  || variant.intensity);
  const thickness   = parseFloat(btn.dataset.thickness  || variant.thickness);
  const shineSizeDeg= parseFloat(btn.dataset.shineSize  || '14');
  const shineFadeDeg= parseFloat(btn.dataset.shineFade  || '44');
  const speed       = parseFloat(btn.dataset.speed      || '0.28');
  const proximity   = parseFloat(btn.dataset.proximity  || '240');
  const radiusOverride = btn.dataset.radius ? parseFloat(btn.dataset.radius) : null;

  // Canvas overlay
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = [
    `position:absolute`,
    `inset:-${PAD}px`,
    `width:calc(100% + ${PAD*2}px)`,
    `height:calc(100% + ${PAD*2}px)`,
    `pointer-events:none`,
    `z-index:1`,
    `border-radius:inherit`,
    `overflow:visible`
  ].join(';');

  // Make sure button is positioned and text stays above canvas
  btn.style.position = 'relative';
  btn.style.overflow = 'visible';
  btn.insertBefore(canvas, btn.firstChild);
  Array.from(btn.childNodes).forEach(n => {
    if (n !== canvas && n.style !== undefined) {
      n.style.position = 'relative';
      n.style.zIndex   = '2';
    }
  });

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;

  let angle = 2.4;
  let pointerAngle = null;
  let bright = 0;
  let proximityT = 0;
  let last = performance.now();
  let raf = 0;
  let cW = 0, cH = 0;

  function resize() {
    const r = btn.getBoundingClientRect();
    const W = (r.width  + PAD*2) * dpr;
    const H = (r.height + PAD*2) * dpr;
    if (Math.abs(canvas.width - W) > 1 || Math.abs(canvas.height - H) > 1) {
      canvas.width  = W;
      canvas.height = H;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cW = r.width  + PAD*2;
      cH = r.height + PAD*2;
    }
  }

  const ro = new ResizeObserver(resize);
  ro.observe(btn);
  resize();

  function onPointerMove(e) {
    const rect = btn.getBoundingClientRect();
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;
    const dx = Math.max(rect.left - e.clientX, 0, e.clientX - rect.right);
    const dy = Math.max(rect.top  - e.clientY, 0, e.clientY - rect.bottom);
    const dist = Math.hypot(dx, dy);
    if (dist === 0) {
      const nx = (e.clientX - cx) / (rect.width  / 2);
      const ny = (cy - e.clientY) / (rect.height / 2);
      pointerAngle = Math.atan2(2/rect.height, -2/rect.width) + nx*0.28 + ny*0.14;
    } else {
      pointerAngle = Math.atan2(cy - e.clientY, e.clientX - cx);
    }
    const t = Math.max(0, 1 - dist / Math.max(proximity, 1));
    proximityT = t * t * (3 - 2 * t);
  }
  window.addEventListener('pointermove', onPointerMove, { passive: true });

  // Parametric rim traversal for a rounded rect
  function rimPoint(frac, bw, bh, R) {
    const perim = 2*(bw + bh) - 8*R + 2*Math.PI*R;
    let d = ((frac % 1) + 1) % 1 * perim;

    const segs = [
      bw - 2*R, Math.PI/2*R,
      bh - 2*R, Math.PI/2*R,
      bw - 2*R, Math.PI/2*R,
      bh - 2*R, Math.PI/2*R,
    ];

    let i = 0;
    while (i < segs.length && d > segs[i]) { d -= segs[i]; i++; }
    const f = d / Math.max(segs[i] || 0.001, 0.001);

    const ox = PAD, oy = PAD;
    let px, py, nx, ny;
    switch(i) {
      case 0: px=ox+R+f*(bw-2*R);     py=oy;           nx=0;  ny=-1; break;
      case 1: { const a=-Math.PI/2+f*Math.PI/2; px=ox+bw-R+R*Math.cos(a); py=oy+R+R*Math.sin(a); nx=Math.cos(a); ny=Math.sin(a); break; }
      case 2: px=ox+bw;               py=oy+R+f*(bh-2*R); nx=1; ny=0; break;
      case 3: { const a=f*Math.PI/2; px=ox+bw-R+R*Math.cos(a); py=oy+bh-R+R*Math.sin(a); nx=Math.cos(a); ny=Math.sin(a); break; }
      case 4: px=ox+bw-R-f*(bw-2*R); py=oy+bh;          nx=0;  ny=1; break;
      case 5: { const a=Math.PI/2+f*Math.PI/2; px=ox+R+R*Math.cos(a); py=oy+bh-R+R*Math.sin(a); nx=Math.cos(a); ny=Math.sin(a); break; }
      case 6: px=ox;                  py=oy+bh-R-f*(bh-2*R); nx=-1; ny=0; break;
      default:{ const a=Math.PI+f*Math.PI/2; px=ox+R+R*Math.cos(a); py=oy+R+R*Math.sin(a); nx=Math.cos(a); ny=Math.sin(a); break; }
    }
    return { px, py, nx, ny };
  }

  function draw(now) {
    raf = requestAnimationFrame(draw);
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;

    const rect = btn.getBoundingClientRect();
    const bw = rect.width;
    const bh = rect.height;
    resize();

    ctx.clearRect(0, 0, cW, cH);

    // Steer angle
    const target = pointerAngle ?? angle;
    const diff = (((target - angle) + Math.PI*3) % (Math.PI*2)) - Math.PI;
    angle += diff * (1 - Math.exp(-dt * 7));

    // Proximity fade
    bright += (proximityT - bright) * (1 - Math.exp(-dt * 8));
    if (bright < 0.008) return;

    const R = radiusOverride !== null
      ? Math.min(radiusOverride, Math.min(bw, bh)/2)
      : Math.min(parseFloat(getComputedStyle(btn).borderRadius) || 3, Math.min(bw, bh)/2);

    const shineSz = shineSizeDeg * Math.PI / 180;
    const shineFd = shineFadeDeg * Math.PI / 180;
    const lx = Math.cos(angle), ly = Math.sin(angle);
    const STEPS = 200;

    // Dark base rim
    ctx.save();
    ctx.lineWidth = thickness + 0.5;
    const [br, bg, bb] = baseColor;
    ctx.strokeStyle = `rgba(${Math.round(br*255)},${Math.round(bg*255)},${Math.round(bb*255)},${(0.35 * bright).toFixed(3)})`;
    const rx = PAD, ry = PAD;
    ctx.beginPath();
    ctx.moveTo(rx + R, ry);
    ctx.lineTo(rx + bw - R, ry);
    ctx.arcTo(rx+bw, ry, rx+bw, ry+R, R);
    ctx.lineTo(rx+bw, ry+bh-R);
    ctx.arcTo(rx+bw, ry+bh, rx+bw-R, ry+bh, R);
    ctx.lineTo(rx+R, ry+bh);
    ctx.arcTo(rx, ry+bh, rx, ry+bh-R, R);
    ctx.lineTo(rx, ry+R);
    ctx.arcTo(rx, ry, rx+R, ry, R);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();

    // Specular highlight
    const [lr, lg, lb] = lineColor;
    for (let step = 0; step < STEPS; step++) {
      const t0 = step / STEPS;
      const t1 = (step + 1) / STEPS;
      const { px, py, nx, ny } = rimPoint(t0, bw, bh, R);
      const { px: px2, py: py2 } = rimPoint(t1, bw, bh, R);
      const phi = Math.acos(Math.max(-1, Math.min(1, Math.abs(nx*lx + ny*ly))));
      const rim = 1 - Math.min(1, Math.max(0, (phi - (shineSz - shineFd)) / (2*shineFd + 0.001)));
      if (rim <= 0) continue;
      const alpha = rim * bright * intensity;
      if (alpha < 0.01) continue;
      ctx.strokeStyle = `rgba(${Math.round(lr*255)},${Math.round(lg*255)},${Math.round(lb*255)},${Math.min(alpha, 1).toFixed(3)})`;
      ctx.lineWidth = thickness;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px2, py2);
      ctx.stroke();
    }
  }

  raf = requestAnimationFrame(draw);

  // Cleanup when element leaves DOM
  const mo = new MutationObserver(() => {
    if (!document.contains(btn)) {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      mo.disconnect();
    }
  });
  mo.observe(document.body, { childList: true, subtree: true });
}

const SELECTOR = [
  '.btn-primary',
  '.btn-ghost',
  '.btn-champ',
  '.btn-ghost--dark',
  '.nav-cta',
  '[data-specular]',
].join(',');

export function initAllSpecularButtons() {
  document.querySelectorAll(SELECTOR).forEach(initSpecularButton);

  // Also catch dynamically added buttons (e.g. quiz result screen)
  const observer = new MutationObserver(mutations => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (node.nodeType !== 1) continue;
        if (node.matches?.(SELECTOR)) initSpecularButton(node);
        node.querySelectorAll?.(SELECTOR).forEach(initSpecularButton);
      }
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}
