/**
 * image-zoom.ts
 *
 * Opens ImageZoomOverlay's single site-wide dialog for any element carrying
 * `data-zoom-trigger` (Figure, or an Asset rendered with `zoomable`).
 * Delegated from the document, same pattern as case-study-overlay.ts, so it
 * works for triggers added anywhere on the page without per-instance wiring.
 *
 * No extra image is generated for the zoomed view: the trigger's own <img>
 * already carries a responsive `srcset` from astro:assets, so the click
 * handler reads that and reuses its largest candidate.
 */

// Makes this a module so its top-level names can't clash with other scripts.
export {};

const TRIGGER_ATTR = "data-zoom-trigger";
const DIALOG_ID = "image-zoom-overlay";
const ZOOM_LEVELS = [1, 1.5, 2, 2.5, 3];
const PAN_KEY_STEP = 48;
/** Accumulated wheel delta before stepping one zoom level, so a trackpad flick isn't five steps. */
const WHEEL_STEP = 80;
/** Pinch must grow or shrink by this ratio before stepping one zoom level. */
const PINCH_RATIO = 1.12;

let levelIndex = 0;
let panX = 0;
let panY = 0;
let dragging = false;
let pointerId: number | null = null;
let dragOriginX = 0;
let dragOriginY = 0;
let panOriginX = 0;
let panOriginY = 0;
let wheelAccum = 0;
const activePointers = new Map<number, { x: number; y: number }>();
let pinchBase = 0;
/** Set when a pan actually moves, so the click that follows pointerup does not dismiss. */
let suppressClick = false;

function dialog(): HTMLDialogElement | null {
  return document.getElementById(DIALOG_ID) as HTMLDialogElement | null;
}

function stage(): HTMLElement | null {
  return dialog()?.querySelector("[data-zoom-stage]") ?? null;
}

function image(): HTMLImageElement | null {
  return dialog()?.querySelector("[data-zoom-image]") ?? null;
}

function lockPage(): void {
  document.documentElement.style.overflow = "hidden";
  document.body.style.overflow = "hidden";
}

function unlockPage(): void {
  document.documentElement.style.overflow = "";
  document.body.style.overflow = "";
}

/** The widest candidate in a responsive `srcset`, or the plain `src`/`currentSrc`. */
function largestSrc(source: HTMLImageElement): string {
  const srcset = source.srcset;
  if (!srcset) return source.currentSrc || source.src;

  let bestUrl = "";
  let bestWidth = -1;
  for (const entry of srcset.split(",")) {
    const [url, descriptor] = entry.trim().split(/\s+/);
    const width = descriptor ? parseInt(descriptor, 10) : 0;
    if (url && width > bestWidth) {
      bestWidth = width;
      bestUrl = url;
    }
  }
  return bestUrl || source.currentSrc || source.src;
}

function clampPan(): void {
  const activeStage = stage();
  const activeImage = image();
  if (!activeStage || !activeImage) return;

  const scale = ZOOM_LEVELS[levelIndex];
  const maxX = Math.max(0, (activeImage.offsetWidth * scale - activeStage.clientWidth) / 2);
  const maxY = Math.max(0, (activeImage.offsetHeight * scale - activeStage.clientHeight) / 2);
  panX = Math.min(maxX, Math.max(-maxX, panX));
  panY = Math.min(maxY, Math.max(-maxY, panY));
}

function applyTransform(): void {
  const activeImage = image();
  if (!activeImage) return;

  clampPan();
  activeImage.style.transform = `translate(calc(-50% + ${panX}px), calc(-50% + ${panY}px)) scale(${ZOOM_LEVELS[levelIndex]})`;
  activeImage.classList.toggle("is-pannable", levelIndex > 0);
}

function setZoom(index: number): void {
  const activeDialog = dialog();
  if (!activeDialog || !image() || !stage()) return;

  const next = Math.min(Math.max(index, 0), ZOOM_LEVELS.length - 1);
  if (next === 0) {
    panX = 0;
    panY = 0;
  }
  levelIndex = next;
  applyTransform();

  const zoomInBtn = activeDialog.querySelector<HTMLButtonElement>("[data-zoom-in]");
  const zoomOutBtn = activeDialog.querySelector<HTMLButtonElement>("[data-zoom-out]");
  if (zoomInBtn) zoomInBtn.disabled = levelIndex === ZOOM_LEVELS.length - 1;
  if (zoomOutBtn) zoomOutBtn.disabled = levelIndex === 0;
}

function panBy(dx: number, dy: number): void {
  if (levelIndex === 0) return;
  panX += dx;
  panY += dy;
  applyTransform();
}

function pointerSpan(): number {
  const points = [...activePointers.values()];
  if (points.length < 2) return 0;
  return Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
}

function trackPointer(event: PointerEvent): void {
  activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
}

/** Scroll and trackpad pinch. Positive deltaY zooms out, matching the zoom buttons. */
function handleWheel(event: WheelEvent): void {
  if (!dialog()?.open) return;
  event.preventDefault();

  wheelAccum += event.deltaY;
  if (Math.abs(wheelAccum) < WHEEL_STEP) return;

  const steps = Math.trunc(wheelAccum / WHEEL_STEP);
  wheelAccum -= steps * WHEEL_STEP;
  setZoom(levelIndex - steps);
}

function applyPinch(): void {
  const span = pointerSpan();
  if (pinchBase <= 0 || span <= 0) return;

  const ratio = span / pinchBase;
  if (ratio >= PINCH_RATIO) {
    setZoom(levelIndex + 1);
    pinchBase = span;
  } else if (ratio <= 1 / PINCH_RATIO) {
    setZoom(levelIndex - 1);
    pinchBase = span;
  }
}

function openWith(source: HTMLImageElement): void {
  const activeDialog = dialog();
  const activeImage = image();
  if (!activeDialog || !activeImage) return;

  activeImage.src = largestSrc(source);
  activeImage.alt = source.alt;
  lockPage();
  activeDialog.showModal();
  setZoom(0);
}

function close(): void {
  dialog()?.close();
}

function handleClick(event: MouseEvent): void {
  if (event.defaultPrevented || event.button !== 0) return;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

  const target = event.target;
  if (!(target instanceof Element)) return;

  const trigger = target.closest(`[${TRIGGER_ATTR}]`);
  if (trigger) {
    const source = trigger.querySelector("img");
    if (source) {
      event.preventDefault();
      openWith(source);
    }
    return;
  }

  if (target.closest("[data-zoom-close]")) {
    close();
    return;
  }

  if (target.closest("[data-zoom-in]")) {
    setZoom(levelIndex + 1);
    return;
  }

  if (target.closest("[data-zoom-out]")) {
    setZoom(levelIndex - 1);
    return;
  }

  const activeDialog = dialog();
  if (!activeDialog?.open || !activeDialog.contains(target)) return;

  // The stage fills the viewport, so the visible scrim around the photo is the
  // stage, not the dialog backdrop. That click dismisses only at the fit step.
  // Once zoomed, leftover scrim at the edges stays part of the viewer — a click
  // there should not close it. A pan also ends in a click and must not dismiss.
  if (levelIndex > 0 || target.closest("[data-zoom-image]") || suppressClick) {
    suppressClick = false;
    return;
  }
  close();
}

function handleKeydown(event: KeyboardEvent): void {
  const target = event.target;
  if (!(target instanceof Element)) return;

  // Activate a trigger from the keyboard — it's a div, not a <button>.
  const trigger = target.closest(`[${TRIGGER_ATTR}]`);
  if (trigger && (event.key === "Enter" || event.key === " ")) {
    const source = trigger.querySelector("img");
    if (source) {
      event.preventDefault();
      openWith(source);
    }
    return;
  }

  const activeDialog = dialog();
  if (!activeDialog?.open) return;

  if (event.key === "+" || event.key === "=") {
    event.preventDefault();
    setZoom(levelIndex + 1);
  } else if (event.key === "-") {
    event.preventDefault();
    setZoom(levelIndex - 1);
  } else if (event.key === "ArrowLeft") {
    event.preventDefault();
    panBy(-PAN_KEY_STEP, 0);
  } else if (event.key === "ArrowRight") {
    event.preventDefault();
    panBy(PAN_KEY_STEP, 0);
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    panBy(0, -PAN_KEY_STEP);
  } else if (event.key === "ArrowDown") {
    event.preventDefault();
    panBy(0, PAN_KEY_STEP);
  }
}

function endDrag(): void {
  dragging = false;
  pointerId = null;
  image()?.classList.remove("is-panning");
}

function handlePointerDown(event: PointerEvent): void {
  const activeDialog = dialog();
  const activeStage = stage();
  if (!activeDialog?.open || !activeStage) return;

  const target = event.target;
  if (!(target instanceof Element) || !activeDialog.contains(target)) return;

  trackPointer(event);
  if (activePointers.size >= 2) {
    endDrag();
    pinchBase = pointerSpan();
    return;
  }

  if (levelIndex === 0 || event.button !== 0) return;
  if (!activeStage.contains(target) || target.closest("button")) return;

  dragging = true;
  pointerId = event.pointerId;
  dragOriginX = event.clientX;
  dragOriginY = event.clientY;
  panOriginX = panX;
  panOriginY = panY;
  activeStage.setPointerCapture(event.pointerId);
  image()?.classList.add("is-panning");
}

function handlePointerMove(event: PointerEvent): void {
  if (!activePointers.has(event.pointerId)) return;
  trackPointer(event);

  if (activePointers.size >= 2) {
    applyPinch();
    return;
  }

  if (!dragging || event.pointerId !== pointerId) return;
  const dx = event.clientX - dragOriginX;
  const dy = event.clientY - dragOriginY;
  if (Math.hypot(dx, dy) > 4) suppressClick = true;
  panX = panOriginX + dx;
  panY = panOriginY + dy;
  applyTransform();
}

function handlePointerUp(event: PointerEvent): void {
  activePointers.delete(event.pointerId);
  if (activePointers.size < 2) pinchBase = 0;
  if (!dragging || event.pointerId !== pointerId) return;
  endDrag();
}

function handleClose(event: Event): void {
  if (event.target === dialog()) {
    unlockPage();
    wheelAccum = 0;
    activePointers.clear();
    pinchBase = 0;
    suppressClick = false;
    setZoom(0);
    image()?.removeAttribute("src");
  }
}

document.addEventListener("wheel", handleWheel, { passive: false });
document.addEventListener("click", handleClick);
document.addEventListener("keydown", handleKeydown);
document.addEventListener("pointerdown", handlePointerDown);
document.addEventListener("pointermove", handlePointerMove);
document.addEventListener("pointerup", handlePointerUp);
document.addEventListener("pointercancel", handlePointerUp);
// `close` doesn't bubble, so capture it on the way down instead.
document.addEventListener("close", handleClose, true);
