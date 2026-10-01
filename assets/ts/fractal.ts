/**
 * Slowly morphing Julia set behind the page: J(c) with c = 0.7885·e^{iθ(t)}.
 * Soft and low-contrast on purpose (light blue on white, ≤ 1.3:1 against the
 * background) so it never competes with text.
 *
 * Budget: rendered at ~half the CSS resolution, capped at 30 fps, paused when the
 * tab is hidden; a single still frame under prefers-reduced-motion or Save-Data.
 * Time is anchored per session so navigating between pages (cross-document view
 * transitions) continues the same animation instead of restarting it.
 */

type Palette = readonly [Rgb, Rgb, Rgb];
type Rgb = readonly [number, number, number];

const SKY: Palette = [
  [0.957, 0.976, 1.0],   // #f4f9ff background
  [0.84, 0.92, 0.99],    // #d6ebfd
  [0.62, 0.81, 0.98],    // #9ecffa near the set
];
const SYNTH: Palette = [
  [0.98, 0.95, 1.0],
  [0.95, 0.82, 0.96],
  [0.55, 0.78, 1.0],
];

const VERT = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;

const FRAG = `precision mediump float;
uniform vec2 r;uniform float t;uniform vec3 c0,c1,c2;
void main(){
  vec2 uv=(gl_FragCoord.xy-.5*r)/min(r.x,r.y);
  float a=t*.011;
  mat2 R=mat2(cos(a),-sin(a),sin(a),cos(a));
  vec2 z=R*uv*(2.35+.25*sin(t*.017))+vec2(.18*sin(t*.007),.0);
  float th=t*.027+1.9;
  vec2 c=.7885*vec2(cos(th),sin(th));
  float n=0.;float m2=0.;
  for(int i=0;i<56;i++){
    z=vec2(z.x*z.x-z.y*z.y,2.*z.x*z.y)+c;
    m2=dot(z,z);
    if(m2>256.)break;
    n+=1.;
  }
  float s=n<55.?n-log2(log2(m2))+4.:56.;
  float v=n<55.?pow(clamp(s/56.,0.,1.),.7):.42;
  float band=.5+.5*cos(6.2831*(s*.045-t*.02));
  vec3 col=mix(c0,c1,smoothstep(.05,.55,v));
  col=mix(col,c2,smoothstep(.55,1.,v)*.85);
  col=mix(col,c1,band*.18*smoothstep(.1,.6,v));
  vec2 q=gl_FragCoord.xy/r-.5;
  col=mix(col,c0,smoothstep(.25,.85,length(q*vec2(1.,.8)))*.55);
  gl_FragColor=vec4(col,1.);
}`;

interface Fractal {
  setPalette(p: Palette): void;
}

function startFractal(canvas: HTMLCanvasElement, palette: Palette): Fractal | null {
  const gl = canvas.getContext("webgl", {
    alpha: false, antialias: false, depth: false, stencil: false,
    powerPreference: "low-power", preserveDrawingBuffer: false,
  });
  if (!gl) return null;

  const shader = (type: number, src: string): WebGLShader | null => {
    const s = gl.createShader(type);
    if (!s) return null;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  };
  const vs = shader(gl.VERTEX_SHADER, VERT);
  const fs = shader(gl.FRAGMENT_SHADER, FRAG);
  const prog = gl.createProgram();
  if (!vs || !fs || !prog) return null;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "p");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const uR = gl.getUniformLocation(prog, "r");
  const uT = gl.getUniformLocation(prog, "t");
  const uC = [0, 1, 2].map((i) => gl.getUniformLocation(prog, `c${i}`));

  const setPalette = (p: Palette): void => {
    p.forEach((rgb, i) => gl.uniform3f(uC[i] ?? null, rgb[0], rgb[1], rgb[2]));
  };
  setPalette(palette);

  const SCALE = 0.5;
  const resize = (): void => {
    const w = Math.max(1, Math.round(innerWidth * SCALE));
    const h = Math.max(1, Math.round(innerHeight * SCALE));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
    gl.uniform2f(uR, w, h);
  };

  // Session-anchored clock: seconds since the first page of this visit.
  const KEY = "rc-bg-t0";
  let t0 = Date.now();
  try {
    const saved = Number(sessionStorage.getItem(KEY));
    if (saved > 0) t0 = saved;
    else sessionStorage.setItem(KEY, String(t0));
  } catch { /* storage blocked: start from now */ }

  const draw = (): void => {
    gl.uniform1f(uT, (Date.now() - t0) / 1000);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  const still = matchMedia("(prefers-reduced-motion: reduce)");
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
  let raf = 0;
  let last = 0;
  const FRAME = 1000 / 30;

  const loop = (now: number): void => {
    raf = requestAnimationFrame(loop);
    if (now - last < FRAME) return;
    last = now;
    draw();
  };
  const stop = (): void => { cancelAnimationFrame(raf); raf = 0; };
  const sync = (): void => {
    stop();
    resize();
    if (still.matches || saveData || document.hidden) draw();
    else raf = requestAnimationFrame(loop);
  };

  addEventListener("resize", () => { resize(); if (!raf) draw(); }, { passive: true });
  document.addEventListener("visibilitychange", sync);
  still.addEventListener("change", sync);
  canvas.addEventListener("webglcontextlost", (e) => { e.preventDefault(); stop(); });

  sync();
  requestAnimationFrame(() => canvas.classList.add("on"));
  return { setPalette: (p) => { setPalette(p); if (!raf) draw(); } };
}

/** Entry point used by boot.ts (dynamic import). */
export function start(): void {
  const canvas = document.getElementById("bg");
  if (!(canvas instanceof HTMLCanvasElement)) return;
  let synth = false;
  try { synth = sessionStorage.getItem("rc-synth") === "1"; } catch { /* default palette */ }
  const f = startFractal(canvas, synth ? SYNTH : SKY);
  addEventListener("rc:synth", (e) => f?.setPalette((e as CustomEvent<boolean>).detail ? SYNTH : SKY));
}
