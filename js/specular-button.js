/**
 * specular-button.js
 * Vanilla JS port of the SpecularButton (Reactbits) using Canvas 2D.
 * Applies to every element with [data-specular] attribute.
 * Colours adapted to site palette: Forest #154230, Gold #e6d3a3
 */

const PAD = 18; // canvas bleed past button edge in px

function hexToRgb(hex) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? [parseInt(r[1],16)/255, parseInt(r[2],16)/255, parseInt(r[3],16)/255] : [1,1,1];
}

function initSpecularButton(btn) {
  if (btn._specularInit) return;
  btn._specularInit = true;

  // Props from data attributes (with defaults)
  const lineColor   = hexToRgb(btn.dataset.lineColor   || '#C7AC6D');
  const baseColor   = hexToRgb(btn.dataset.baseColor   || '#154230');
  const intensity   = parseFloat(btn.dataset.intensity  || '1.4');
  const shineSizeDeg= parseFloat(btn.dataset.shineSize  || '14');
  const shineFadeDeg= parseFloat(btn.dataset.shineFade  || '44');
  const thickness   = parseFloat(btn.dataset.thickness  || '1.5');
  const speed       = parseFloat(btn.dataset.speed      || '0.28');
  const proximity   = parseFloat(btn.dataset.proximity  || '220');
  const radiusOverride = btn.dataset.radius ? parseFloat(btn.dataset.radius) : null;

  // Canvas overlay
  const canvas = document.createElement('canvas');
  canvas.style.cssText = `position:absolute;inset:-${PAD}px;width:calc(100% + ${PAD*2}px);height:calc(100% + ${PAD*2}px);pointer-events:none;z-index:1;border-radius:inherit;`;
  btn.style.position = 'relative';
  btn.insertBefore(canvas, btn.firstChild);

  // Ensure text is above canvas
  Array.from(btn.childNodes).forEach(n => {
    if (n !== canvas && n.style) n.style.position = 'relative', n.style.zIndex = '2';
  });

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;

  let angle = 2.4;
  let pointerAngle = null;
  let bright = 0;
  let proximityT = 0;
  let last = performance.now();
  let raf = 0;

  function resize() {
    const r = btn.getBoundingClientRect();
    canvas.width  = (r.width  + PAD*2) * dpr;
    canvas.height = (r.height + PAD*2) * dpr;
    ctx.scale(dpr, dpr);
  }

  const ro = new ResizeObserver(resize);
  ro.observe(btn);
  resize();

  // Mouse tracking (global — works even when cursor is near but not on btn)
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
  window.addEventListener('pointermove', onPointerMove, { passive:true });

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x+w, y, x+w, y+r, r);
    ctx.lineTo(x+w, y+h-r);
    ctx.arcTo(x+w, y+h, x+w-r, y+h, r);
    ctx.lineTo(x+r, y+h);
    ctx.arcTo(x, y+h, x, y+h-r, r);
    ctx.lineTo(x, y+r);
    ctx.arcTo(x, y, x+r, y, r);
    ctx.closePath();
  }

  function draw(now) {
    raf = requestAnimationFrame(draw);
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;

    const rect = btn.getBoundingClientRect();
    const W = rect.width  + PAD*2;
    const H = rect.height + PAD*2;
    const bw = rect.width;
    const bh = rect.height;

    // Recheck canvas size if button resized
    if (Math.abs(canvas.width - W*dpr) > 2) {
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    ctx.clearRect(0, 0, W, H);

    // Steer angle toward pointer
    const diff = ((( pointerAngle ?? angle) - angle + Math.PI*3) % (Math.PI*2)) - Math.PI;
    angle += diff * (1 - Math.exp(-dt * 7));

    // Brightness fade in on proximity
    const brightTarget = proximityT;
    bright += (brightTarget - bright) * (1 - Math.exp(-dt * 8));
    if (bright < 0.01) return;

    const R = radiusOverride !== null
      ? Math.min(radiusOverride, Math.min(bw, bh)/2)
      : parseFloat(getComputedStyle(btn).borderRadius) || 4;

    const shineSz  = shineSizeDeg  * Math.PI / 180;
    const shineFd  = shineFadeDeg  * Math.PI / 180;
    const totalArc = shineSz + shineFd;

    // Draw the specular rim using many short arc segments
    const cx = PAD + bw/2;
    const cy = PAD + bh/2;
    const STEPS = 180;

    // Parametric point + normal on a rounded rect
    function rimPoint(t) {
      const perim = 2*(bw + bh) - 8*R + 2*Math.PI*R;
      let s = ((t % 1) + 1) % 1;
      let d = s * perim;

      const seg = [
        bw - 2*R,         // top
        Math.PI/2 * R,    // top-right corner
        bh - 2*R,         // right
        Math.PI/2 * R,    // bottom-right
        bw - 2*R,         // bottom
        Math.PI/2 * R,    // bottom-left
        bh - 2*R,         // left
        Math.PI/2 * R,    // top-left
      ];
      const origins = [
        [PAD+R, PAD],               // top: left to right
        [PAD+bw-R, PAD+R],          // top-right arc center
        [PAD+bw, PAD+R],            // right: top to bottom
        [PAD+bw-R, PAD+bh-R],       // bottom-right arc
        [PAD+bw-R, PAD+bh],         // bottom: right to left
        [PAD+R, PAD+bh-R],          // bottom-left arc
        [PAD, PAD+bh-R],            // left: bottom to top
        [PAD+R, PAD+R],             // top-left arc
      ];

      let i = 0;
      while (i < seg.length && d > seg[i]) { d -= seg[i]; i++; }
      const frac = d / Math.max(seg[i]||0.001, 0.001);

      let px, py, nx, ny;
      switch(i) {
        case 0: px=PAD+R+frac*(bw-2*R); py=PAD;       nx=0;  ny=-1; break;
        case 1: { const a=-Math.PI/2+frac*Math.PI/2; px=origins[1][0]+R*Math.cos(a); py=origins[1][1]+R*Math.sin(a); nx=Math.cos(a); ny=Math.sin(a); break; }
        case 2: px=PAD+bw; py=PAD+R+frac*(bh-2*R);     nx=1;  ny=0;  break;
        case 3: { const a=frac*Math.PI/2; px=origins[3][0]+R*Math.cos(a); py=origins[3][1]+R*Math.sin(a); nx=Math.cos(a); ny=Math.sin(a); break; }
        case 4: px=PAD+bw-R-frac*(bw-2*R); py=PAD+bh; nx=0;  ny=1;  break;
        case 5: { const a=Math.PI/2+frac*Math.PI/2; px=origins[5][0]+R*Math.cos(a); py=origins[5][1]+R*Math.sin(a); nx=Math.cos(a); ny=Math.sin(a); break; }
        case 6: px=PAD; py=PAD+bh-R-frac*(bh-2*R);     nx=-1; ny=0;  break;
        default:{ const a=Math.PI+frac*Math.PI/2; px=origins[7][0]+R*Math.cos(a); py=origins[7][1]+R*Math.sin(a); nx=Math.cos(a); ny=Math.sin(a); break; }
      }
      return {px, py, nx, ny};
    }

    // Light direction
    const lx = Math.cos(angle), ly = Math.sin(angle);

    for (let step = 0; step < STEPS; step++) {
      const t = step / STEPS;
      const { px, py, nx, ny } = rimPoint(t);
      const phi = Math.acos(Math.max(-1, Math.min(1, Math.abs(nx*lx + ny*ly))));
      const rim = 1 - Math.min(1, Math.max(0, (phi - (shineSz - shineFd)) / (2*shineFd + 0.001)));
      if (rim <= 0) continue;
      const alpha = rim * bright * intensity;
      if (alpha < 0.01) continue;
      ctx.strokeStyle = `rgba(${Math.round(lineColor[0]*255)},${Math.round(lineColor[1]*255)},${Math.round(lineColor[2]*255)},${alpha.toFixed(3)})`;
      ctx.lineWidth = thickness;
      ctx.beginPath();
      ctx.moveTo(px, py);
      const { px:px2, py:py2 } = rimPoint((step+1)/STEPS);
      ctx.lineTo(px2, py2);
      ctx.stroke();
    }
  }

  raf = requestAnimationFrame(draw);

  // Cleanup on disconnect
  const mo = new MutationObserver(() => {
    if (!document.contains(btn)) {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      mo.disconnect();
    }
  });
  mo.observe(document.body, { childList:true, subtree:true });
}

export function initAllSpecularButtons() {
  document.querySelectorAll('[data-specular]').forEach(initSpecularButton);
}
