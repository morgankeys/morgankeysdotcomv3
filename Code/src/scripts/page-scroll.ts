/**
 * page-scroll.ts
 *
 * Hides the document scrollbar while a modal dialog is open, and puts it back
 * only after the last one closes.
 *
 * The scrollbar is about 15px. A dialog sized to the viewport grows by that
 * amount when the scrollbar disappears and shrinks when it returns. Image zoom
 * opens on top of a case study, so unlocking on every close made the study
 * jump: closing the zoom brought the scrollbar back, and the next image click
 * hid it again.
 */

/** Hide the page scrollbar. Safe to call when it is already hidden. */
export function lockPageScroll(): void {
  document.documentElement.style.overflow = "hidden";
  document.body.style.overflow = "hidden";
}

/**
 * Restore page scrolling once nothing else is modal. `closing` is excluded
 * because a `close` event can fire while that dialog still reports open.
 */
export function unlockPageScroll(closing?: EventTarget | null): void {
  const anotherOpen = [...document.querySelectorAll("dialog")].some(
    (dialog) =>
      dialog instanceof HTMLDialogElement &&
      dialog !== closing &&
      dialog.open,
  );
  if (anotherOpen) return;

  document.documentElement.style.overflow = "";
  document.body.style.overflow = "";
}
