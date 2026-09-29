/**
 * case-study-overlay.ts
 *
 * Opens and closes CaseStudyOverlay dialogs. Delegated from the document, so it
 * works for triggers that live inside a hydrated island (the carousel) and for
 * any overlay added to the page later.
 *
 * A native <dialog> already provides Escape-to-close, focus containment, and
 * focus restore to the trigger, so this only has to handle what it doesn't:
 * opening from a link, backdrop clicks, and locking the page behind the modal.
 */

import type { CloseMethod, OpenSource } from "../lib/analytics";

const TRIGGER_ATTR = "data-overlay-target";
const CLOSE_ATTR = "data-overlay-close";

/**
 * Keep the page behind the modal from scrolling. Matches how Lightbox.vue does
 * it — set from script rather than a global rule, so no component-level
 * selector has to leak into global.css.
 */
function lockPage(): void {
  document.documentElement.style.overflow = "hidden";
  document.body.style.overflow = "hidden";
}

function unlockPage(): void {
  document.documentElement.style.overflow = "";
  document.body.style.overflow = "";
}

/**
 * Close with the reason as the dialog's return value, which analytics.ts
 * reports as `close_method`. Escape closes natively and leaves it empty.
 */
function closeWith(dialog: HTMLDialogElement, method: CloseMethod): void {
  dialog.close(method);
}

function open(
  dialog: HTMLDialogElement,
  source: OpenSource,
  trigger?: Element,
): void {
  lockPage();
  // A reopened dialog still holds the last close reason; clear it so an
  // Escape this time isn't reported as that.
  dialog.returnValue = "";
  dialog.showModal();
  // Start at the hero: a reopened dialog keeps its previous scroll position.
  dialog.scrollTop = 0;
  dialog.dispatchEvent(
    new CustomEvent("overlayopen", {
      bubbles: true,
      detail: { source, trigger },
    }),
  );
}

function handleClick(event: MouseEvent): void {
  // Let modified clicks (new tab, download, context menu) behave normally.
  if (event.defaultPrevented || event.button !== 0) return;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

  const target = event.target;
  if (!(target instanceof Element)) return;

  const trigger = target.closest(`[${TRIGGER_ATTR}]`);
  if (trigger) {
    const id = trigger.getAttribute(TRIGGER_ATTR);
    const dialog = id ? document.getElementById(id) : null;

    if (dialog instanceof HTMLDialogElement) {
      event.preventDefault();
      // A trigger inside another overlay (a case-study "Contact me" banner)
      // closes that dialog first so the two modals don't stack.
      const current = trigger.closest("dialog");
      if (
        current instanceof HTMLDialogElement &&
        current !== dialog &&
        current.open
      ) {
        closeWith(current, "navigation");
      }
      open(dialog, "click", trigger);
    }
    return;
  }

  if (target.closest(`[${CLOSE_ATTR}]`)) {
    const dialog = target.closest("dialog");
    if (dialog) closeWith(dialog, "button");
    return;
  }

  // A click landing on the dialog itself came from the backdrop — the frame
  // fills the dialog box, so nothing else can be the target.
  if (target instanceof HTMLDialogElement) {
    closeWith(target, "backdrop");
  }
}

function handleClose(event: Event): void {
  if (!(event.target instanceof HTMLDialogElement)) return;

  const closing = event.target;
  closing.style.translate = "";
  closing.style.transition = "";
  // `close` can fire while this dialog still reports open, and it can also
  // fire after the next dialog is already open. Unlock only when no other
  // dialog is modal.
  const anotherOpen = [...document.querySelectorAll("dialog")].some(
    (dialog) =>
      dialog instanceof HTMLDialogElement && dialog !== closing && dialog.open,
  );
  if (!anotherOpen) unlockPage();
}

/** Same literal as the mobile sheet layout in the overlay components. */
const MOBILE_SHEET = window.matchMedia("(max-width: 640px)");
const DISMISS_DISTANCE = 96;

type SheetDrag = {
  dialog: HTMLDialogElement;
  startX: number;
  startY: number;
  tracking: boolean;
  dy: number;
};

let drag: SheetDrag | null = null;

function clearSheetDrag(dialog: HTMLDialogElement): void {
  dialog.style.translate = "";
  dialog.style.transition = "";
}

function handleTouchStart(event: TouchEvent): void {
  if (!MOBILE_SHEET.matches || event.touches.length !== 1) return;

  const target = event.target;
  if (!(target instanceof Element)) return;

  const dialog = target.closest("dialog.overlay");
  if (!(dialog instanceof HTMLDialogElement) || !dialog.open) return;
  if (dialog.scrollTop > 0) return;

  const touch = event.touches[0];
  drag = {
    dialog,
    startX: touch.clientX,
    startY: touch.clientY,
    tracking: false,
    dy: 0,
  };
}

function handleTouchMove(event: TouchEvent): void {
  if (!drag || event.touches.length !== 1) return;

  const touch = event.touches[0];
  const dx = touch.clientX - drag.startX;
  const dy = touch.clientY - drag.startY;

  if (!drag.tracking) {
    if (drag.dialog.scrollTop > 0) {
      drag = null;
      return;
    }
    // A horizontal or upward move is a scroll, not a dismiss.
    if (dy < -8 || (Math.abs(dx) > dy && Math.abs(dx) > 8)) {
      drag = null;
      return;
    }
    if (dy < 12) return;

    drag.tracking = true;
    drag.dialog.style.transition = "none";
  }

  drag.dy = dy;
  drag.dialog.style.translate = `0 ${dy}px`;
  event.preventDefault();
}

function handleTouchEnd(): void {
  if (!drag) return;

  const { dialog, tracking, dy } = drag;
  drag = null;
  if (!tracking) return;

  if (dy >= DISMISS_DISTANCE) {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduceMotion) {
      clearSheetDrag(dialog);
      closeWith(dialog, "swipe");
      return;
    }

    dialog.style.transition = "";
    // Commit the dragged position before the CSS transition runs to 100%.
    void dialog.offsetWidth;
    dialog.style.translate = "0 100%";

    const finish = (): void => {
      dialog.removeEventListener("transitionend", finish);
      if (dialog.open) closeWith(dialog, "swipe");
    };
    dialog.addEventListener("transitionend", finish);
    window.setTimeout(finish, 300);
    return;
  }

  clearSheetDrag(dialog);
}

document.addEventListener("click", handleClick);
// `close` doesn't bubble, so capture it on the way down instead.
document.addEventListener("close", handleClose, true);
document.addEventListener("touchstart", handleTouchStart, { passive: true });
document.addEventListener("touchmove", handleTouchMove, { passive: false });
document.addEventListener("touchend", handleTouchEnd);
document.addEventListener("touchcancel", handleTouchEnd);

/**
 * Open an overlay named by the URL fragment, so a case study can be linked to
 * directly. Runs on load and on subsequent hash changes.
 */
function openFromHash(source: OpenSource): void {
  const id = window.location.hash.slice(1);
  if (!id) return;

  const dialog = document.getElementById(id);
  if (dialog instanceof HTMLDialogElement && !dialog.open) {
    open(dialog, source);
  }
}

openFromHash("deep_link");
window.addEventListener("hashchange", () => openFromHash("hash_change"));
