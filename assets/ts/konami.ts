/**
 * ↑ ↑ ↓ ↓ ← → ← → B A — an 80s easter egg: synthwave palette for the session.
 * Loaded by boot.ts on the first ↑ (already counted, hence `start`). Talks to
 * the fractal through a DOM event, so the two bundles share no code.
 */
const CODE = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
const KEY = "rc-synth";

export function watchKonami(start = 0): void {
  let i = start;
  addEventListener("keydown", (e) => {
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    i = k === CODE[i] ? i + 1 : k === CODE[0] ? 1 : 0;
    if (i < CODE.length) return;
    i = 0;
    let on = true;
    try {
      on = sessionStorage.getItem(KEY) !== "1";
      sessionStorage.setItem(KEY, on ? "1" : "0");
    } catch { /* storage blocked: still toggle for this page */ }
    dispatchEvent(new CustomEvent("rc:synth", { detail: on }));
    toast(on ? "1UP · SYNTHWAVE MODE" : "GAME OVER · BACK TO BLUE");
  });
}

function toast(text: string): void {
  const t = document.createElement("p");
  t.setAttribute("role", "status");
  t.textContent = text;
  t.style.cssText =
    "position:fixed;left:50%;bottom:1.5rem;translate:-50% 0;z-index:50;margin:0;" +
    "font:700 .85rem/1 Orbitron,sans-serif;letter-spacing:.12em;color:#fff;padding:.8rem 1.2rem;" +
    "border-radius:10px;background:linear-gradient(90deg,#0b3566,#6b2fb3);box-shadow:0 10px 30px -10px #6b2fb3";
  document.body.append(t);
  setTimeout(() => t.remove(), 2200);
}
