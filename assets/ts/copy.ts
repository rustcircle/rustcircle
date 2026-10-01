/** Loaded on demand by boot.ts. "Copy" button on every code block; result announced to screen readers. */
export function addCopyButtons(root: ParentNode = document): void {
  const blocks = root.querySelectorAll<HTMLPreElement>(".prose pre");
  if (!navigator.clipboard || blocks.length === 0) return;
  const live = document.createElement("p");
  live.setAttribute("aria-live", "polite");
  live.className = "sr-only";
  live.style.cssText = "position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)";
  document.body.append(live);

  for (const pre of blocks) {
    const code = pre.querySelector("code");
    if (!code) continue;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "copy";
    btn.textContent = "Copy";
    btn.setAttribute("aria-label", "Copy code to clipboard");
    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(code.innerText.replace(/\n$/, ""));
        btn.textContent = "Copied";
        btn.dataset.done = "";
        live.textContent = "Code copied to clipboard";
      } catch {
        btn.textContent = "Failed";
      }
      setTimeout(() => { btn.textContent = "Copy"; delete btn.dataset.done; }, 1600);
    });
    pre.append(btn);
  }
}
