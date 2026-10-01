/**
 * The hero's retro perspective grid, calm and still — except where the
 * pointer touches it. There the lines ripple: a soft local swell under the
 * pointer (gaussian falloff) plus rings that travel outward from where it moved
 * and fade. When the pointer leaves or stops, everything eases back to straight
 * lines and the animation loop stops (zero CPU while idle).
 *
 * Loaded on demand by boot.ts; replaces the CSS grid. Touch: a ripple at each
 * touch point. prefers-reduced-motion: the grid stays static, no ripples.
 */

const CAM = 1, ROWS = 15, Z0 = 1;
const ROW_SEG = 140, COL_SEG = 70;             // samples per line (enough for ~50 px waves)
const SIGMA = 70, SWELL = 7;                    // local swell: radius (px), amplitude (px)
const RING_C = 190, RING_K = 0.12, RING_W = 46; // ring speed (px/s), wavenumber, width (px)
const RING_A = 6, RING_LIFE = 1.6, MAX_RINGS = 14;

interface Ring { x: number; y: number; t0: number; a: number }

export function start(): void {
  const hero = document.querySelector<HTMLElement>(".hero");
  if (!hero) return;
  const cv = document.createElement("canvas");
  cv.className = "wavegrid";
  cv.setAttribute("aria-hidden", "true");
  hero.append(cv);
  const ctx = cv.getContext("2d");
  if (!ctx) { cv.remove(); return; }

  let W = 0, H = 0, dpr = 1;
  const size = (): void => {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
  };

  // Pointer, in canvas coordinates; `energy` eases to 1 while it is over the grid.
  let mx = -1e4, my = -1e4, over = false, energy = 0, lastRing = 0;
  const rings: Ring[] = [];
  const still = matchMedia("(prefers-reduced-motion: reduce)");

  const local = (e: PointerEvent): boolean => {
    const r = cv.getBoundingClientRect();
    mx = e.clientX - r.left; my = e.clientY - r.top;
    return mx > -SIGMA && mx < r.width + SIGMA && my > -SIGMA && my < r.height + SIGMA;
  };
  const ring = (a: number): void => {
    rings.push({ x: mx, y: my, t0: performance.now() / 1000, a });
    if (rings.length > MAX_RINGS) rings.shift();
  };
  addEventListener("pointermove", (e) => {
    if (still.matches) return;
    over = local(e);
    const now = performance.now();
    if (over && now - lastRing > 110) { lastRing = now; ring(e.pointerType === "touch" ? 1 : 0.7); }
    if (over) wake();
  }, { passive: true });
  addEventListener("pointerdown", (e) => {
    if (still.matches || !local(e)) return;
    ring(1.2); wake();
  }, { passive: true });
  document.documentElement.addEventListener("pointerleave", () => { over = false; });

  /** Radial displacement (px) at (x, y): swell under the pointer + travelling rings. */
  const offset = (x: number, y: number, t: number): [number, number] => {
    let dx = 0, dy = 0;
    if (energy > 0.002) {
      const ex = x - mx, ey = y - my, r2 = ex * ex + ey * ey;
      if (r2 < 9 * SIGMA * SIGMA) {
        const r = Math.sqrt(r2) || 1;
        const d = energy * SWELL * Math.exp(-r2 / (2 * SIGMA * SIGMA)) * Math.sin(RING_K * r - 7 * t);
        dx += (d * ex) / r; dy += (d * ey) / r;
      }
    }
    for (const g of rings) {
      const age = t - g.t0;
      const ex = x - g.x, ey = y - g.y, r = Math.hypot(ex, ey) || 1;
      const u = r - RING_C * age;                // signed distance from the travelling front
      if (u > 2 * RING_W || u < -2 * RING_W) continue;
      const d = g.a * RING_A * Math.exp(-(u * u) / (RING_W * RING_W)) * Math.sin(RING_K * u) * Math.exp(-2.4 * age);
      dx += (d * ex) / r; dy += (d * ey) / r;
    }
    return [dx, dy];
  };

  const draw = (t: number): void => {
    const f = H * 0.92, vx = W / 2, hy = 2;
    const proj = (X: number, Z: number): [number, number] => [vx + (X * f) / Z, hy + (CAM * f) / Z];
    const halfX = Math.ceil((W / f) * 0.75) + 3, zFar = Z0 + ROWS;
    const live = energy > 0.002 || rings.length > 0;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.lineWidth = 1;
    const line = (n: number, at: (s: number) => [number, number]): void => {
      ctx.beginPath();
      for (let s = 0; s <= n; s++) {
        let [x, y] = at(s / n);
        if (live) { const [dx, dy] = offset(x, y, t); x += dx; y += dy; }
        if (s) ctx.lineTo(x, y); else ctx.moveTo(x, y);
      }
      ctx.stroke();
    };

    for (let k = 0; k < ROWS; k++) {           // rows: constant depth
      const a = Math.max(0, 1 - k / ROWS) ** 1.4;
      ctx.strokeStyle = `rgba(21,121,201,${(0.55 * a).toFixed(3)})`;
      line(ROW_SEG, (s) => proj(-halfX * 1.6 + s * halfX * 3.2, Z0 + k));
    }
    const grad = ctx.createLinearGradient(0, hy, 0, H);
    grad.addColorStop(0, "rgba(21,121,201,0)");
    grad.addColorStop(1, "rgba(21,121,201,0.5)");
    ctx.strokeStyle = grad;
    const step = W < 640 ? 0.5 : 1;           // denser columns on narrow screens
    for (let X = -halfX; X <= halfX; X += step) { // columns: meet at the vanishing point
      line(COL_SEG, (s) => proj(X, zFar - s * (zFar - Z0 * 0.6)));
    }
  };

  // Animate only while something moves; otherwise one static frame.
  let raf = 0, visible = true;
  const frame = (ms: number): void => {
    const t = ms / 1000;
    energy += ((over ? 1 : 0) - energy) * (over ? 0.12 : 0.06);
    while (rings.length && t - rings[0]!.t0 > RING_LIFE) rings.shift();
    const busy = energy > 0.002 || rings.length > 0;
    if (!busy) energy = 0;
    draw(t);
    raf = busy && visible && !document.hidden ? requestAnimationFrame(frame) : 0;
  };
  function wake(): void { if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame); }

  new IntersectionObserver((es) => { visible = es.some((e) => e.isIntersecting); if (visible) wake(); }).observe(hero);
  new ResizeObserver(() => { size(); if (!raf) draw(performance.now() / 1000); }).observe(cv);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) wake(); });
  still.addEventListener("change", () => { rings.length = 0; over = false; wake(); });

  size();
  draw(0);
  requestAnimationFrame(() => hero.classList.add("live"));
}
