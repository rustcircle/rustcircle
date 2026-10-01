/**
 * The only script every page loads (< 1 kB gzip). Everything else is fetched
 * on demand with dynamic import():
 *   fractal — after `load`, when the main thread is idle (skipped on Save-Data)
 *   copy    — when the first code block comes within 300 px of the viewport
 *   konami  — on the first ↑ key press
 * Plus a prefetch-on-intent fallback for browsers without Speculation Rules.
 */
import * as chunks from "@params";

type Conn = { saveData?: boolean };
const saveData = (navigator as Navigator & { connection?: Conn }).connection?.saveData === true;

const whenIdle = (fn: () => void): void => {
  if ("requestIdleCallback" in window) requestIdleCallback(fn, { timeout: 2500 });
  else setTimeout(fn, 300);
};
const afterLoad = (fn: () => void): void => {
  if (document.readyState === "complete") fn();
  else addEventListener("load", fn, { once: true });
};

// 1. Background fractal: never on the critical path.
if (!saveData && document.getElementById("bg")) {
  afterLoad(() => whenIdle(() => { void import(chunks.fractal).then((m: typeof import("./fractal.ts")) => m.start()); }));
}

// 2. Copy buttons: only for pages with code, only when it is about to be seen.
const blocks = document.querySelectorAll(".prose pre");
if (blocks.length > 0 && "IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => {
    if (!entries.some((e) => e.isIntersecting)) return;
    io.disconnect();
    void import(chunks.copy).then((m: typeof import("./copy.ts")) => m.addCopyButtons());
  }, { rootMargin: "300px" });
  blocks.forEach((b) => io.observe(b));
}

// 3. Easter egg: loaded by its first key.
const onKey = (e: KeyboardEvent): void => {
  if (e.key !== "ArrowUp") return;
  removeEventListener("keydown", onKey);
  void import(chunks.konami).then((m: typeof import("./konami.ts")) => m.watchKonami(1));
};
addEventListener("keydown", onKey);

// 4. Prefetch on intent where <script type="speculationrules"> is unsupported.
if (!HTMLScriptElement.supports?.("speculationrules") && !saveData) {
  const seen = new Set<string>([location.pathname]);
  const intent = (e: Event): void => {
    const a = (e.target as Element | null)?.closest?.("a[href]");
    if (!(a instanceof HTMLAnchorElement) || a.origin !== location.origin || a.hash && a.pathname === location.pathname) return;
    if (/\.\w+$/.test(a.pathname) || seen.has(a.pathname)) return;
    seen.add(a.pathname);
    const l = document.createElement("link");
    l.rel = "prefetch";
    l.href = a.pathname;
    document.head.append(l);
  };
  for (const t of ["pointerover", "touchstart", "focusin"]) addEventListener(t, intent, { passive: true, capture: true });
}
