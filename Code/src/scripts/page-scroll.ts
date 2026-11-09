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
 *
 * Hiding the scrollbar also widens the page by its width, so centered content
 * slid sideways by half of it on every open and back on every close. Locking
 * pads the root by the scrollbar's width to hold the content where it was. The
 * dialogs and their backdrops are fixed to the viewport, so they still cover
 * the full width; `scrollbar-gutter: stable` would have kept the content still
 * too, but leaves an undimmed strip beside the backdrop. Overlay scrollbars
 * (macOS trackpads, phones) take no width, so there is nothing to pad.
 */

/** Hide the page scrollbar. Safe to call when it is already hidden. */
export function lockPageScroll(): void {
  const root = document.documentElement;
  // Measure only while the scrollbar is still showing: a second overlay over
  // the first (image zoom on a case study) would read 0 and drop the padding.
  if (root.style.overflow !== "hidden") {
    const scrollbarWidth = window.innerWidth - root.clientWidth;
    if (scrollbarWidth > 0) root.style.paddingRight = `${scrollbarWidth}px`;
  }
  root.style.overflow = "hidden";
  document.body.style.overflow = "hidden";
}

/**
 * Restore page scrolling once nothing else is modal. `closing` is excluded
 * because a `close` event can fire while that dialog still reports open.
 */
export function unlockPageScroll(closing?: EventTarget | null): void {
  const anotherOpen = [...document.querySelectorAll("dialog")].some(
    (dialog) =>
      dialog instanceof HTMLDialogElement && dialog !== closing && dialog.open,
  );
  if (anotherOpen) return;

  document.documentElement.style.overflow = "";
  document.documentElement.style.paddingRight = "";
  document.body.style.overflow = "";
}
