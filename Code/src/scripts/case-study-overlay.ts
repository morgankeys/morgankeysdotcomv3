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

function open(dialog: HTMLDialogElement): void {
  lockPage();
  dialog.showModal();
  // Start at the hero: a reopened dialog keeps its previous scroll position.
  dialog.scrollTop = 0;
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
      open(dialog);
    }
    return;
  }

  if (target.closest(`[${CLOSE_ATTR}]`)) {
    target.closest("dialog")?.close();
    return;
  }

  // A click landing on the dialog itself came from the backdrop — the frame
  // fills the dialog box, so nothing else can be the target.
  if (target instanceof HTMLDialogElement) {
    target.close();
  }
}

function handleClose(event: Event): void {
  if (event.target instanceof HTMLDialogElement) {
    unlockPage();
  }
}

document.addEventListener("click", handleClick);
// `close` doesn't bubble, so capture it on the way down instead.
document.addEventListener("close", handleClose, true);

/**
 * Open an overlay named by the URL fragment, so a case study can be linked to
 * directly. Runs on load and on subsequent hash changes.
 */
function openFromHash(): void {
  const id = window.location.hash.slice(1);
  if (!id) return;

  const dialog = document.getElementById(id);
  if (dialog instanceof HTMLDialogElement && !dialog.open) {
    open(dialog);
  }
}

openFromHash();
window.addEventListener("hashchange", openFromHash);
