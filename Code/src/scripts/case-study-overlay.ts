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
 *
 * Case studies also have their own URL, `/work/<id>/` (the dialog's
 * `data-route`). While one is open the address bar and tab title show it:
 * opening from a card pushes it, closing goes back to `/`, and Back and Forward
 * close and reopen the study. Loading a route opens its study.
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

/** The page the overlays live on; a study's route closes back to it. */
const HOME_PATH = "/";

/** Whether `path` is `route`, with or without its trailing slash. */
function isRoute(route: string, path = window.location.pathname): boolean {
  return path === route || path === route.replace(/\/$/, "");
}

/** The case-study dialog whose route is `path`, if any. */
function routedDialogAt(path: string): HTMLDialogElement | undefined {
  return [
    ...document.querySelectorAll<HTMLDialogElement>("dialog[data-route]"),
  ].find(
    (dialog) => dialog.dataset.route && isRoute(dialog.dataset.route, path),
  );
}

/** The home page's title, which a route page doesn't carry in <title>. */
function homeTitle(): string {
  return (
    document.querySelector<HTMLElement>("[data-home-title]")?.dataset
      .homeTitle ?? document.title
  );
}

/**
 * Put an opening study's route in the address bar. Only a card click adds a
 * history entry; a study opened from the URL already has one, so it is
 * replaced (a `/#id` link becomes `/work/id/`).
 */
function enterRoute(dialog: HTMLDialogElement, source: OpenSource): void {
  const route = dialog.dataset.route;
  if (!route) return;

  if (!isRoute(route)) {
    const url = route + window.location.search;
    if (source === "click") {
      window.history.pushState({ overlay: dialog.id }, "", url);
    } else {
      window.history.replaceState(null, "", url);
    }
  }
  if (dialog.dataset.routeTitle) document.title = dialog.dataset.routeTitle;
}

/**
 * Return the address bar to the home page as a study closes. When the open
 * pushed the route, step back over it, so Back doesn't reopen the study.
 * When Back or Forward closed it, the URL has already moved on.
 */
function leaveRoute(dialog: HTMLDialogElement): void {
  const route = dialog.dataset.route;
  if (!route || !isRoute(route)) return;

  if (window.history.state?.overlay === dialog.id) {
    window.history.back();
  } else {
    window.history.replaceState(null, "", HOME_PATH + window.location.search);
  }
  document.title = homeTitle();
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
  enterRoute(dialog, source);
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
  leaveRoute(closing);
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
 * Open an overlay named by the URL fragment: the intro and contact overlays,
 * and case studies linked as `/#id` before they had routes. A study's former
 * id (`data-route-aliases`) still finds it. Runs on load and on later hash
 * changes.
 */
function openFromHash(source: OpenSource): void {
  const id = window.location.hash.slice(1);
  if (!id) return;

  const dialog =
    document.getElementById(id) ??
    document.querySelector(`dialog[data-route-aliases~="${CSS.escape(id)}"]`);
  if (dialog instanceof HTMLDialogElement && !dialog.open) {
    open(dialog, source);
  }
}

/** Open the study whose route this page is (`/work/<id>/`). */
function openFromPath(): void {
  const dialog = routedDialogAt(window.location.pathname);
  if (dialog && !dialog.open) open(dialog, "deep_link");
}

/**
 * Back and Forward between a study's route and the home page: close the study
 * the URL left, and open the one it arrived at.
 */
function syncWithHistory(): void {
  const target = routedDialogAt(window.location.pathname);
  document
    .querySelectorAll<HTMLDialogElement>("dialog[data-route][open]")
    .forEach((dialog) => {
      if (dialog !== target) closeWith(dialog, "history");
    });
  if (target && !target.open) open(target, "history");
  if (!target) document.title = homeTitle();
}

openFromPath();
openFromHash("deep_link");
window.addEventListener("hashchange", () => openFromHash("hash_change"));
window.addEventListener("popstate", syncWithHistory);
