/**
 * Boids flocking in the home page profile banner (.profile-banner).
 *
 * They used to fill the whole viewport behind the text, which pulled the eye
 * off whatever you were reading. Now they live in one small box you can play
 * with: hover to attract the flock, click for a shockwave.
 *
 * Direct reference to the Y3A boids self-study project. Reynolds rules
 * (separation, alignment, cohesion) plus soft cursor attraction and click-burst
 * shockwaves. Uniform spatial grid for O(k) neighbour queries; per-boid hue
 * jitter; velocity-driven glow; additive-blend connection lines.
 */
(function () {
  'use strict';

  const host = document.querySelector('.profile-banner');
  if (!host) return;

  const reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Small canvas, so full device resolution is cheap.
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let width = 0, height = 0;

  const boidCanvas = document.createElement('canvas');
  host.appendChild(boidCanvas);
  const boidCtx = boidCanvas.getContext('2d', { alpha: true });

  // ---------- Boid config ----------
  // Tuned for a box roughly 300 x 130 px.
  const cfg = {
    boidCountFactor: 0.0005,
    minBoids: 12,
    maxBoids: 28,

    perceptionRadius: 42,
    separationRadius: 14,

    wSep: 1.7,
    wAli: 1.0,
    wCoh: 0.9,
    wAttract: 0.5,        // pull toward the cursor while it is over the banner
    attractRadius: 140,
    wClickAttract: 1.8,   // strong, decaying pull at a click

    maxSpeed: 0.9,
    minSpeed: 0.35,
    maxForce: 0.04,

    boidSize: 3.2,
    drawConnections: true,
    connectionRadius: 44,
    maxConnectionsPerBoid: 3,

    // Colour band - most boids hue-jitter inside this HSL range (cyan to sky);
    // a share are orange to match the site accent.
    hueMin: 180,        // cyan
    hueMax: 215,        // sky
    accentShare: 0.2,   // fraction of boids in the warm accent colour
    accentHue: 27,      // orange
    saturation: 90,
    lightness: 78,
    boidAlpha: 0.75,
    lineAlphaBase: 0.1,
    glowColor: 'rgba(56, 189, 248, 0.55)',

    // Click shockwave - three concentric rings, plus a brief central flash.
    rippleLife: 850,
    rippleRadius: 140,
    rippleRingCount: 3,
    rippleRingDelay: 90,  // ms between successive ring starts
    rippleFlashLife: 220, // ms

    // Reduced-motion fallback.
    reducedMotion: {
      maxBoids: 16,
      drawConnections: false,
      maxSpeed: 0.5,
      glow: false,
    }
  };

  let glowEnabled = true;
  if (reduceMotion) {
    cfg.maxBoids = cfg.reducedMotion.maxBoids;
    cfg.drawConnections = cfg.reducedMotion.drawConnections;
    cfg.maxSpeed = cfg.reducedMotion.maxSpeed;
    glowEnabled = cfg.reducedMotion.glow;
  }

  // ---------- Boid state (Structure-of-Arrays) ----------
  let n = 0;
  let px, py, vx, vy, ax, ay, hue, phase;

  function allocate(targetCount) {
    n = targetCount;
    px = new Float32Array(n);
    py = new Float32Array(n);
    vx = new Float32Array(n);
    vy = new Float32Array(n);
    ax = new Float32Array(n);
    ay = new Float32Array(n);
    hue = new Float32Array(n);
    phase = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      px[i] = Math.random() * width;
      py[i] = Math.random() * height;
      const angle = Math.random() * Math.PI * 2;
      const speed = cfg.minSpeed + Math.random() * (cfg.maxSpeed - cfg.minSpeed);
      vx[i] = Math.cos(angle) * speed;
      vy[i] = Math.sin(angle) * speed;
      hue[i] = Math.random();
      phase[i] = Math.random() * Math.PI * 2;
    }
  }

  function targetBoidCount() {
    const area = width * height;
    return Math.max(cfg.minBoids, Math.min(cfg.maxBoids, Math.round(area * cfg.boidCountFactor)));
  }

  // ---------- Spatial grid ----------
  let gridSize = 0, gridCols = 0, gridRows = 0;
  let gridHead, gridNext;

  function rebuildGridStructure() {
    gridSize = cfg.perceptionRadius;
    gridCols = Math.max(1, Math.ceil(width / gridSize));
    gridRows = Math.max(1, Math.ceil(height / gridSize));
    gridHead = new Int32Array(gridCols * gridRows);
    gridNext = new Int32Array(n);
  }

  function fillGrid() {
    gridHead.fill(-1);
    for (let i = 0; i < n; i++) {
      let cx = (px[i] / gridSize) | 0;
      let cy = (py[i] / gridSize) | 0;
      if (cx < 0) cx = 0; else if (cx >= gridCols) cx = gridCols - 1;
      if (cy < 0) cy = 0; else if (cy >= gridRows) cy = gridRows - 1;
      const cell = cy * gridCols + cx;
      gridNext[i] = gridHead[cell];
      gridHead[cell] = i;
    }
  }

  // ---------- Cursor + click ----------
  const mouse = { x: -9999, y: -9999, active: false };
  const ripples = []; // each: { x, y, born, life, flashLife }

  // Banner-local coordinates.
  function local(e) {
    const r = host.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  host.addEventListener('mousemove', (e) => {
    const p = local(e);
    mouse.x = p.x;
    mouse.y = p.y;
    mouse.active = true;
  }, { passive: true });
  host.addEventListener('mouseleave', () => { mouse.active = false; });

  host.addEventListener('click', (e) => {
    const p = local(e);
    ripples.push({
      x: p.x, y: p.y,
      born: performance.now(),
      life: cfg.rippleLife,
      flashLife: cfg.rippleFlashLife,
    });
    if (ripples.length > 6) ripples.shift();
  }, { passive: true });

  // ---------- Boid update ----------
  const perceptionSq = cfg.perceptionRadius * cfg.perceptionRadius;
  const separationSq = cfg.separationRadius * cfg.separationRadius;

  function update(now) {
    fillGrid();

    while (ripples.length && now - ripples[0].born > ripples[0].life) ripples.shift();

    for (let i = 0; i < n; i++) {
      let sepX = 0, sepY = 0;
      let aliX = 0, aliY = 0;
      let cohX = 0, cohY = 0;
      let aliCount = 0, cohCount = 0;

      const cx = Math.min(gridCols - 1, Math.max(0, (px[i] / gridSize) | 0));
      const cy = Math.min(gridRows - 1, Math.max(0, (py[i] / gridSize) | 0));

      for (let oy = -1; oy <= 1; oy++) {
        const ny_ = cy + oy;
        if (ny_ < 0 || ny_ >= gridRows) continue;
        for (let ox = -1; ox <= 1; ox++) {
          const nx_ = cx + ox;
          if (nx_ < 0 || nx_ >= gridCols) continue;
          let j = gridHead[ny_ * gridCols + nx_];
          while (j !== -1) {
            if (j !== i) {
              const dx = px[i] - px[j];
              const dy = py[i] - py[j];
              const d2 = dx * dx + dy * dy;
              if (d2 < perceptionSq && d2 > 0.0001) {
                aliX += vx[j]; aliY += vy[j]; aliCount++;
                cohX += px[j]; cohY += py[j]; cohCount++;
                if (d2 < separationSq) {
                  const inv = 1 / Math.sqrt(d2);
                  sepX += dx * inv;
                  sepY += dy * inv;
                }
              }
            }
            j = gridNext[j];
          }
        }
      }

      let fx = 0, fy = 0;

      if (sepX !== 0 || sepY !== 0) {
        const m = Math.hypot(sepX, sepY);
        let dvx = (sepX / m) * cfg.maxSpeed - vx[i];
        let dvy = (sepY / m) * cfg.maxSpeed - vy[i];
        const fmag = Math.hypot(dvx, dvy);
        if (fmag > cfg.maxForce) {
          const s = cfg.maxForce / fmag; dvx *= s; dvy *= s;
        }
        fx += dvx * cfg.wSep; fy += dvy * cfg.wSep;
      }

      if (aliCount > 0) {
        aliX /= aliCount; aliY /= aliCount;
        const m = Math.hypot(aliX, aliY);
        if (m > 0) {
          let dvx = (aliX / m) * cfg.maxSpeed - vx[i];
          let dvy = (aliY / m) * cfg.maxSpeed - vy[i];
          const fmag = Math.hypot(dvx, dvy);
          if (fmag > cfg.maxForce) {
            const s = cfg.maxForce / fmag; dvx *= s; dvy *= s;
          }
          fx += dvx * cfg.wAli; fy += dvy * cfg.wAli;
        }
      }

      if (cohCount > 0) {
        cohX = cohX / cohCount - px[i];
        cohY = cohY / cohCount - py[i];
        const m = Math.hypot(cohX, cohY);
        if (m > 0) {
          let dvx = (cohX / m) * cfg.maxSpeed - vx[i];
          let dvy = (cohY / m) * cfg.maxSpeed - vy[i];
          const fmag = Math.hypot(dvx, dvy);
          if (fmag > cfg.maxForce) {
            const s = cfg.maxForce / fmag; dvx *= s; dvy *= s;
          }
          fx += dvx * cfg.wCoh; fy += dvy * cfg.wCoh;
        }
      }

      if (mouse.active) {
        const dxm = mouse.x - px[i];
        const dym = mouse.y - py[i];
        const dm = Math.hypot(dxm, dym);
        if (dm > 1 && dm < cfg.attractRadius) {
          const falloff = 1 - dm / cfg.attractRadius;
          fx += (dxm / dm) * cfg.maxForce * cfg.wAttract * falloff;
          fy += (dym / dm) * cfg.maxForce * cfg.wAttract * falloff;
        }
      }

      // Click ripples - strong attractor that decays with both distance and time.
      for (let r = 0; r < ripples.length; r++) {
        const rip = ripples[r];
        const age = (now - rip.born) / rip.life;
        if (age > 1) continue;
        const dxr = rip.x - px[i];
        const dyr = rip.y - py[i];
        const dr = Math.hypot(dxr, dyr);
        if (dr > 1 && dr < cfg.rippleRadius) {
          const distFalloff = 1 - dr / cfg.rippleRadius;
          const timeFalloff = 1 - age;
          const k = cfg.maxForce * cfg.wClickAttract * distFalloff * timeFalloff;
          fx += (dxr / dr) * k;
          fy += (dyr / dr) * k;
        }
      }

      ax[i] = fx;
      ay[i] = fy;
    }

    for (let i = 0; i < n; i++) {
      vx[i] += ax[i];
      vy[i] += ay[i];
      const sp = Math.hypot(vx[i], vy[i]);
      if (sp > cfg.maxSpeed) {
        const s = cfg.maxSpeed / sp; vx[i] *= s; vy[i] *= s;
      } else if (sp < cfg.minSpeed && sp > 0) {
        const s = cfg.minSpeed / sp; vx[i] *= s; vy[i] *= s;
      }
      px[i] += vx[i];
      py[i] += vy[i];

      const m = 10;
      if (px[i] < -m) px[i] = width + m;
      else if (px[i] > width + m) px[i] = -m;
      if (py[i] < -m) py[i] = height + m;
      else if (py[i] > height + m) py[i] = -m;
    }
  }

  // ---------- Boid draw ----------
  const TWO_PI = Math.PI * 2;

  // Soft falloff disc, drawn once at 64px and scaled per boid. Near-white so
  // the additive blend picks up the boid's own colour from the arrow beneath.
  const glowSprite = (function () {
    const size = 64, r = size / 2;
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const g = c.getContext('2d');
    const grad = g.createRadialGradient(r, r, 0, r, r, r);
    grad.addColorStop(0,    'rgba(186, 230, 253, 1)');
    grad.addColorStop(0.25, 'rgba(125, 211, 252, 0.45)');
    grad.addColorStop(0.55, 'rgba(56, 189, 248, 0.12)');
    grad.addColorStop(1,    'rgba(56, 189, 248, 0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);
    return c;
  })();

  function drawBoids(now) {
    // Sharp boids - clear every frame, no trails.
    boidCtx.clearRect(0, 0, width, height);

    // Connections - additive so dense clusters bloom brighter.
    if (cfg.drawConnections) {
      boidCtx.globalCompositeOperation = 'lighter';
      boidCtx.strokeStyle = `rgba(103, 232, 249, ${cfg.lineAlphaBase})`;
      boidCtx.lineWidth = 1;
      boidCtx.beginPath();
      const connSq = cfg.connectionRadius * cfg.connectionRadius;
      for (let i = 0; i < n; i++) {
        let connected = 0;
        const cx = Math.min(gridCols - 1, Math.max(0, (px[i] / gridSize) | 0));
        const cy = Math.min(gridRows - 1, Math.max(0, (py[i] / gridSize) | 0));
        for (let oy = -1; oy <= 1 && connected < cfg.maxConnectionsPerBoid; oy++) {
          const ny_ = cy + oy;
          if (ny_ < 0 || ny_ >= gridRows) continue;
          for (let ox = -1; ox <= 1 && connected < cfg.maxConnectionsPerBoid; ox++) {
            const nx_ = cx + ox;
            if (nx_ < 0 || nx_ >= gridCols) continue;
            let j = gridHead[ny_ * gridCols + nx_];
            while (j !== -1 && connected < cfg.maxConnectionsPerBoid) {
              if (j > i) {
                const dx = px[i] - px[j];
                const dy = py[i] - py[j];
                const d2 = dx * dx + dy * dy;
                if (d2 < connSq) {
                  boidCtx.moveTo(px[i], py[i]);
                  boidCtx.lineTo(px[j], py[j]);
                  connected++;
                }
              }
              j = gridNext[j];
            }
          }
        }
      }
      boidCtx.stroke();
      boidCtx.globalCompositeOperation = 'source-over';
    }

    // Boids - streamlined arrow with concave notch + speed-driven glow.
    const speedRange = cfg.maxSpeed - cfg.minSpeed;
    const t = now * 0.005;

    for (let i = 0; i < n; i++) {
      const sp = Math.hypot(vx[i], vy[i]);
      const speedNorm = Math.min(1, Math.max(0, (sp - cfg.minSpeed) / speedRange));
      const flutter = Math.sin(t + phase[i]) * 0.25;
      const heading = Math.atan2(vy[i], vx[i]) + flutter * 0.06;
      const cosH = Math.cos(heading), sinH = Math.sin(heading);
      const s = cfg.boidSize * (0.85 + speedNorm * 0.35);

      const tipX  = px[i] + cosH * s * 1.9;
      const tipY  = py[i] + sinH * s * 1.9;
      const baseLeftX  = px[i] + Math.cos(heading + 2.4) * s * 0.95;
      const baseLeftY  = py[i] + Math.sin(heading + 2.4) * s * 0.95;
      const baseRightX = px[i] + Math.cos(heading - 2.4) * s * 0.95;
      const baseRightY = py[i] + Math.sin(heading - 2.4) * s * 0.95;
      const notchX = px[i] - cosH * s * 0.35;
      const notchY = py[i] - sinH * s * 0.35;

      const accent = hue[i] < cfg.accentShare;
      const h = accent ? cfg.accentHue : cfg.hueMin + (hue[i] - cfg.accentShare) / (1 - cfg.accentShare) * (cfg.hueMax - cfg.hueMin);
      const l = Math.min(88, (accent ? 48 : cfg.lightness) + speedNorm * 10);
      boidCtx.fillStyle = `hsla(${h.toFixed(0)}, ${cfg.saturation}%, ${l.toFixed(0)}%, ${cfg.boidAlpha})`;

      if (glowEnabled) {
        // Soft glow: a pre-rendered radial sprite, blended additively. A flat
        // arc() fill reads as a hard opaque disc, which is the bug this replaces.
        const gr = s * (2.6 + speedNorm * 1.2);
        boidCtx.globalCompositeOperation = 'lighter';
        boidCtx.globalAlpha = 0.16 + speedNorm * 0.12;
        boidCtx.drawImage(glowSprite, px[i] - gr, py[i] - gr, gr * 2, gr * 2);
        boidCtx.globalAlpha = 1;
        boidCtx.globalCompositeOperation = 'source-over';
      }
      boidCtx.beginPath();
      boidCtx.moveTo(tipX, tipY);
      boidCtx.lineTo(baseLeftX, baseLeftY);
      boidCtx.lineTo(notchX, notchY);
      boidCtx.lineTo(baseRightX, baseRightY);
      boidCtx.closePath();
      boidCtx.fill();
    }

    // Click shockwave - three staggered concentric rings + central flash.
    if (ripples.length) {
      boidCtx.globalCompositeOperation = 'lighter';
      for (let r = 0; r < ripples.length; r++) {
        const rip = ripples[r];
        const elapsed = now - rip.born;
        if (elapsed > rip.life) continue;

        // Central flash - bright, very short-lived.
        const flashAge = elapsed / rip.flashLife;
        if (flashAge < 1) {
          const flashAlpha = (1 - flashAge) * 0.8;
          const flashR = 6 + flashAge * 24;
          const grad = boidCtx.createRadialGradient(rip.x, rip.y, 0, rip.x, rip.y, flashR);
          grad.addColorStop(0, `rgba(186, 230, 253, ${flashAlpha.toFixed(3)})`);
          grad.addColorStop(0.5, `rgba(125, 211, 252, ${(flashAlpha * 0.5).toFixed(3)})`);
          grad.addColorStop(1, 'rgba(56, 189, 248, 0)');
          boidCtx.fillStyle = grad;
          boidCtx.beginPath();
          boidCtx.arc(rip.x, rip.y, flashR, 0, TWO_PI);
          boidCtx.fill();
        }

        // Concentric rings - staggered start times, growing outward, fading out.
        for (let k = 0; k < cfg.rippleRingCount; k++) {
          const ringStart = k * cfg.rippleRingDelay;
          const ringElapsed = elapsed - ringStart;
          if (ringElapsed < 0) continue;
          const ringAge = ringElapsed / (rip.life - ringStart);
          if (ringAge >= 1) continue;

          const ringR = ringAge * cfg.rippleRadius * 0.95;
          // Easing: thicker at start, thinner as it expands.
          const eased = 1 - ringAge;
          const alpha = 0.55 * eased * (k === 0 ? 1.0 : 0.7 - k * 0.15);
          const lineW = 2.5 * eased + 0.5;
          const hue_ = 200 + k * 8; // first ring sky, later rings drift toward indigo

          boidCtx.strokeStyle = `hsla(${hue_}, 90%, 70%, ${alpha.toFixed(3)})`;
          boidCtx.lineWidth = lineW;
          boidCtx.beginPath();
          boidCtx.arc(rip.x, rip.y, ringR, 0, TWO_PI);
          boidCtx.stroke();
        }
      }
      boidCtx.globalCompositeOperation = 'source-over';
    }
  }

  // ---------- Animation loop ----------
  let rafId = null;
  let lastFrame = 0;
  const targetFrameMs = 1000 / 30;

  function frame(t) {
    rafId = requestAnimationFrame(frame);
    if (t - lastFrame < targetFrameMs * 0.9) return;
    lastFrame = t;
    update(t);
    drawBoids(t);
  }

  // ---------- Resize ----------
  function resize() {
    width = host.clientWidth;
    height = host.clientHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    boidCanvas.width = width * dpr;
    boidCanvas.height = height * dpr;
    boidCanvas.style.width = width + 'px';
    boidCanvas.style.height = height + 'px';
    boidCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const target = targetBoidCount();
    if (n !== target) allocate(target);
    rebuildGridStructure();

    boidCtx.clearRect(0, 0, width, height);
  }

  // ---------- Visibility throttle ----------
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    } else if (!rafId) {
      lastFrame = performance.now();
      rafId = requestAnimationFrame(frame);
    }
  });

  // Size now, before the first frame; the observer covers layout changes
  // (its first callback fires after the first animation frame).
  resize();
  new ResizeObserver(resize).observe(host);
  rafId = requestAnimationFrame(frame);
})();
