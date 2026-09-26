/**
 * button-ripple.ts
 *
 * Pointer-origin press ripple for `[data-component="Button"]`. Delegated from
 * the document, same pattern as image-zoom.ts, so it works for static Astro
 * renders and for buttons inside Vue islands (ContactForm).
 *
 * Ports Material Web's ripple geometry and press state machine onto the circle
 * inside each button's clipped state span. The CSS flash remains the fallback
 * when this script is absent, or when motion / forced-colors skip the ripple.
 */

// Makes this a module so its top-level names can't clash with other scripts.
export {};

const BUTTON_SELECTOR = '[data-component="Button"]';
const RIPPLE_SELECTOR = ".button__ripple";
const STATE_SELECTOR = ".button__state";
const RIPPLE_ATTR = "data-ripple";

const PRESS_GROW_MS = 450;
const MINIMUM_PRESS_MS = 225;
const TOUCH_DELAY_MS = 150;
const PRESS_FADE_MS = 375;
const INITIAL_ORIGIN_SCALE = 0.2;
const PADDING = 10;
const SOFT_EDGE_MINIMUM_SIZE = 75;
const SOFT_EDGE_CONTAINER_RATIO = 0.35;
const EASING = "cubic-bezier(0.2, 0, 0, 1)";

type State = "inactive" | "touch-delay" | "holding" | "waiting-for-click";

interface Session {
  state: State;
  startEvent?: PointerEvent;
  growAnimation?: Animation;
}

const sessions = new WeakMap<HTMLElement, Session>();

function reducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function forcedColors(): boolean {
  return window.matchMedia("(forced-colors: active)").matches;
}

function shouldSkipRipple(): boolean {
  return reducedMotion() || forcedColors();
}

function closestButton(target: EventTarget | null): HTMLElement | null {
  if (!(target instanceof Element)) return null;
  const button = target.closest(BUTTON_SELECTOR);
  return button instanceof HTMLElement ? button : null;
}

function isDisabled(button: HTMLElement): boolean {
  if (button instanceof HTMLButtonElement && button.disabled) return true;
  return button.getAttribute("aria-disabled") === "true";
}

function sessionOf(button: HTMLElement): Session {
  let session = sessions.get(button);
  if (!session) {
    session = { state: "inactive" };
    sessions.set(button, session);
  }
  return session;
}

function rippleHost(button: HTMLElement): HTMLElement {
  return button.querySelector<HTMLElement>(STATE_SELECTOR) ?? button;
}

function rippleCircle(button: HTMLElement): HTMLElement | null {
  return button.querySelector<HTMLElement>(RIPPLE_SELECTOR);
}

function cssZoom(element: HTMLElement): number {
  const zoom = (element as HTMLElement & { currentCSSZoom?: number }).currentCSSZoom;
  return zoom ?? 1;
}

function isTouch(event: PointerEvent): boolean {
  return event.pointerType === "touch";
}

function shouldReactToEvent(
  event: PointerEvent,
  button: HTMLElement,
  session: Session,
): boolean {
  if (isDisabled(button) || !event.isPrimary) return false;

  if (session.startEvent && session.startEvent.pointerId !== event.pointerId) {
    return false;
  }

  if (event.type === "pointerenter" || event.type === "pointerleave") {
    return !isTouch(event);
  }

  return isTouch(event) || event.buttons === 1;
}

function determineRippleSize(host: HTMLElement): {
  initialSize: number;
  rippleSize: string;
  rippleScale: string;
} {
  const { height, width } = host.getBoundingClientRect();
  const maxDim = Math.max(height, width);
  const softEdgeSize = Math.max(
    SOFT_EDGE_CONTAINER_RATIO * maxDim,
    SOFT_EDGE_MINIMUM_SIZE,
  );
  const zoom = cssZoom(host);
  const initialSize = Math.floor((maxDim * INITIAL_ORIGIN_SCALE) / zoom);
  const hypotenuse = Math.sqrt(width ** 2 + height ** 2);
  const maxRadius = hypotenuse + PADDING;
  const maybeZoomedScale = (maxRadius + softEdgeSize) / initialSize;

  return {
    initialSize,
    rippleSize: `${initialSize}px`,
    rippleScale: `${maybeZoomedScale / zoom}`,
  };
}

function getNormalizedPointerEventCoords(
  host: HTMLElement,
  pointerEvent: PointerEvent,
): { x: number; y: number } {
  const { scrollX, scrollY } = window;
  const { left, top } = host.getBoundingClientRect();
  const zoom = cssZoom(host);
  return {
    x: (pointerEvent.pageX - (scrollX + left)) / zoom,
    y: (pointerEvent.pageY - (scrollY + top)) / zoom,
  };
}

function getTranslationCoordinates(
  host: HTMLElement,
  initialSize: number,
  positionEvent?: Event,
): { startPoint: { x: number; y: number }; endPoint: { x: number; y: number } } {
  const { height, width } = host.getBoundingClientRect();
  const zoom = cssZoom(host);
  const endPoint = {
    x: (width / zoom - initialSize) / 2,
    y: (height / zoom - initialSize) / 2,
  };

  let startPoint;
  if (positionEvent instanceof PointerEvent) {
    startPoint = getNormalizedPointerEventCoords(host, positionEvent);
  } else {
    startPoint = {
      x: width / zoom / 2,
      y: height / zoom / 2,
    };
  }

  startPoint = {
    x: startPoint.x - initialSize / 2,
    y: startPoint.y - initialSize / 2,
  };

  return { startPoint, endPoint };
}

function playTimeMs(animation: Animation | undefined): number {
  const time = animation?.currentTime;
  if (time == null) return Infinity;
  if (typeof time === "number") return time;
  return time.to("ms").value;
}

function markRipple(button: HTMLElement): void {
  button.setAttribute(RIPPLE_ATTR, "");
}

function startPressAnimation(button: HTMLElement, positionEvent?: Event): void {
  const circle = rippleCircle(button);
  if (!circle) return;

  const session = sessionOf(button);
  const host = rippleHost(button);
  session.growAnimation?.cancel();
  markRipple(button);

  const { initialSize, rippleSize, rippleScale } = determineRippleSize(host);
  const { startPoint, endPoint } = getTranslationCoordinates(
    host,
    initialSize,
    positionEvent,
  );
  const translateStart = `${startPoint.x}px, ${startPoint.y}px`;
  const translateEnd = `${endPoint.x}px, ${endPoint.y}px`;

  session.growAnimation = circle.animate(
    {
      top: [0, 0],
      left: [0, 0],
      height: [rippleSize, rippleSize],
      width: [rippleSize, rippleSize],
      transform: [
        `translate(${translateStart}) scale(1)`,
        `translate(${translateEnd}) scale(${rippleScale})`,
      ],
    },
    {
      duration: PRESS_GROW_MS,
      easing: EASING,
      fill: "forwards",
    },
  );
}

async function endPressAnimation(button: HTMLElement, session: Session): Promise<void> {
  session.startEvent = undefined;
  session.state = "inactive";
  const animation = session.growAnimation;
  const playState = playTimeMs(animation);

  if (playState < MINIMUM_PRESS_MS) {
    await new Promise((resolve) => {
      setTimeout(resolve, MINIMUM_PRESS_MS - playState);
    });
    if (session.growAnimation !== animation) return;
  }

  button.removeAttribute(RIPPLE_ATTR);

  await new Promise((resolve) => {
    setTimeout(resolve, PRESS_FADE_MS);
  });
  if (session.growAnimation !== animation) return;
  animation?.cancel();
  session.growAnimation = undefined;
}

async function handlePointerdown(event: PointerEvent): Promise<void> {
  if (shouldSkipRipple()) return;

  const button = closestButton(event.target);
  if (!button) return;

  const session = sessionOf(button);
  if (!shouldReactToEvent(event, button, session)) return;

  session.startEvent = event;
  markRipple(button);

  if (!isTouch(event)) {
    session.state = "waiting-for-click";
    startPressAnimation(button, event);
    return;
  }

  session.state = "touch-delay";
  await new Promise((resolve) => {
    setTimeout(resolve, TOUCH_DELAY_MS);
  });

  if (session.state !== "touch-delay") return;

  session.state = "holding";
  startPressAnimation(button, event);
}

function handlePointerup(event: PointerEvent): void {
  if (shouldSkipRipple()) return;

  const button = closestButton(event.target);
  if (!button) return;

  const session = sessions.get(button);
  if (!session || !shouldReactToEvent(event, button, session)) return;

  if (session.state === "holding") {
    session.state = "waiting-for-click";
    return;
  }

  if (session.state === "touch-delay") {
    session.state = "waiting-for-click";
    startPressAnimation(button, session.startEvent);
  }
}

function handlePointerleave(event: PointerEvent): void {
  if (shouldSkipRipple()) return;

  const button = closestButton(event.target);
  if (!button) return;

  const related = event.relatedTarget;
  if (related instanceof Node && button.contains(related)) return;

  const session = sessions.get(button);
  if (!session || !shouldReactToEvent(event, button, session)) return;
  if (session.state === "inactive") return;

  void endPressAnimation(button, session);
}

function handlePointercancel(event: PointerEvent): void {
  if (shouldSkipRipple()) return;

  const button = closestButton(event.target);
  if (!button) return;

  const session = sessions.get(button);
  if (!session || !shouldReactToEvent(event, button, session)) return;

  void endPressAnimation(button, session);
}

function handleClick(event: MouseEvent): void {
  if (shouldSkipRipple()) return;

  const button = closestButton(event.target);
  if (!button || isDisabled(button)) return;

  const session = sessionOf(button);

  if (session.state === "waiting-for-click") {
    void endPressAnimation(button, session);
    return;
  }

  if (session.state === "inactive") {
    startPressAnimation(button);
    void endPressAnimation(button, session);
  }
}

function handleContextmenu(event: MouseEvent): void {
  const button = closestButton(event.target);
  if (!button) return;

  const session = sessions.get(button);
  if (!session || isDisabled(button)) return;

  void endPressAnimation(button, session);
}

document.addEventListener("pointerdown", handlePointerdown);
document.addEventListener("pointerup", handlePointerup);
document.addEventListener("pointercancel", handlePointercancel);
document.addEventListener("pointerleave", handlePointerleave, true);
document.addEventListener("click", handleClick);
document.addEventListener("contextmenu", handleContextmenu);
