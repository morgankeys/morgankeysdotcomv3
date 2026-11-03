/**
 * figma-capture.ts
 *
 * Dev-only "capture to Figma" button from the figma-capture-button package.
 * Under `npm run dev`, a draggable pink button sits in the bottom-right
 * corner. Click it, then pick Entire screen or Select element, and paste into
 * any Figma file (⌘V) to get editable layers. Ctrl+C captures the entire
 * screen directly.
 *
 * The capture itself is Figma's html-to-design script, which the package
 * loads from mcp.figma.com. `import.meta.env.DEV` is `false` in every build,
 * so neither the button nor that request reaches staging or production.
 */

if (import.meta.env.DEV) {
  void import("figma-capture-button/auto").then(() => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", keepAboveModals, {
        once: true,
      });
    } else {
      keepAboveModals();
    }
  });
}

/**
 * Keeps the button usable while an overlay is open.
 *
 * Overlays are modal <dialog>s: they render in the browser's top layer, above
 * any z-index, and make everything outside them inert, so the button would be
 * hidden behind the scrim and unclickable. While a modal is open, the button
 * (and the element picker's highlight) move into the topmost one, which keeps
 * them interactive, and are shown as popovers, which puts them in the top
 * layer above that dialog at their usual viewport position. When the last
 * modal closes they go back to <body>.
 */
function keepAboveModals(): void {
  const pill = document.querySelector<HTMLElement>(
    "[data-figma-capture-button]",
  );
  // The package mounts only on localhost.
  if (!pill) return;

  const managed = new Set<HTMLElement>([pill]);

  // A popover's UA styles (inset 0, auto margins, border, padding) would
  // re-center and re-box the package's own fixed positioning; undo them.
  const style = document.createElement("style");
  style.textContent =
    "[data-h2d-ignore]:popover-open{inset:auto;margin:0;border:0;padding:0;overflow:visible}";
  document.head.append(style);

  /** Open modal dialogs, oldest first; the last one is on top. */
  const stack: HTMLDialogElement[] = [
    ...document.querySelectorAll<HTMLDialogElement>("dialog[open]"),
  ].filter((dialog) => dialog.matches(":modal"));

  const lift = (el: HTMLElement): void => {
    // The highlight is detached between picks; it comes back on the next one.
    if (!el.isConnected) return;
    const host = stack.at(-1) ?? document.body;
    if (el.parentElement !== host) host.append(el);
    el.popover = "manual";
    // Re-showing moves it above whatever entered the top layer since.
    if (el.matches(":popover-open")) el.hidePopover();
    el.showPopover();
  };
  const liftAll = (): void => managed.forEach(lift);

  new MutationObserver((records) => {
    let changed = false;
    for (const record of records) {
      const target = record.target;
      if (record.type === "attributes" && target instanceof HTMLDialogElement) {
        const at = stack.indexOf(target);
        if (at !== -1) stack.splice(at, 1);
        if (target.open && target.matches(":modal")) stack.push(target);
        changed = true;
      }
      // The picker's highlight is appended to <body> each time picking starts.
      // Figma's own toolbar host is left alone.
      if (record.target === document.body) {
        for (const node of record.addedNodes) {
          if (
            node instanceof HTMLElement &&
            node.hasAttribute("data-h2d-ignore") &&
            node.id !== "__figma_capture_toolbar_host__"
          ) {
            managed.add(node);
            changed = true;
          }
        }
      }
    }
    if (changed) liftAll();
  }).observe(document.body, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["open"],
  });

  liftAll();
}
