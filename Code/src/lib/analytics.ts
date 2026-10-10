/**
 * analytics.ts
 *
 * The one door to Google Analytics. Every custom event the site sends is
 * declared in `AnalyticsEvents` below, so this interface doubles as the event
 * catalog (Docs/analytics.md explains how to read each one in GA4).
 *
 * `track` is a no-op when gtag is absent: locally, and on any build without
 * PUBLIC_GA_MEASUREMENT_ID. Under `npm run dev` it logs to the console instead,
 * so events can be checked without a GA property.
 *
 * Never put personal data in a parameter — no names, emails, or message text.
 * Google's terms forbid it, and nothing here needs it.
 */

/** Which kind of <dialog> an overlay is, from its `data-analytics-overlay`. */
export type OverlayType = "case_study" | "intro" | "contact";

/** How an overlay was opened. */
export type OpenSource = "click" | "deep_link" | "hash_change";

/**
 * How an overlay was dismissed. Passed to `dialog.close()` as its return value
 * by case-study-overlay.ts; Escape is detected from the native `cancel` event.
 */
export type CloseMethod =
  | "button"
  | "backdrop"
  | "escape"
  | "swipe"
  | "navigation"
  | "page_exit"
  | "other";

export type CarouselMethod = "next" | "prev" | "dot" | "swipe";

export type ContactFormLocation = "page" | "overlay";

interface LinkParams {
  /** Visible label: card title, aria-label, or link text. */
  link_text: string;
  /** Destination without its query string, capped at 100 characters. */
  link_url: string;
  placement: string;
}

export interface AnalyticsEvents {
  /** A case study, the intro, or the contact overlay opened. */
  overlay_open: {
    overlay_id: string;
    overlay_type: OverlayType;
    open_source: OpenSource;
    /** Where the trigger was: a page section, or the overlay it sat in. */
    placement: string;
  };
  overlay_close: {
    overlay_id: string;
    overlay_type: OverlayType;
    close_method: CloseMethod;
    /** Seconds the overlay was open while the tab was visible. */
    visible_seconds: number;
    percent_scrolled: number;
  };
  /** Scroll milestones inside an overlay: 25, 50, 75, 90. */
  overlay_scroll: {
    overlay_id: string;
    overlay_type: OverlayType;
    percent_scrolled: number;
  };
  /** A case study scrolled to 90% — mark as a key event in GA4. */
  case_study_read: {
    overlay_id: string;
    visible_seconds: number;
  };
  /** A page section's top crossed the middle of the viewport. */
  section_view: {
    section: string;
  };
  resume_open: LinkParams;
  deck_open: LinkParams;
  /** An inline Figma deck finished loading, or gave up after 20 seconds. */
  deck_embed_load: {
    outcome: "ready" | "timeout";
    /** `auto` when the overlay opened (desktop), `tap` on the cover (phones). */
    trigger: "auto" | "tap";
    /** From the overlay opening to the deck showing, to a tenth of a second. */
    load_seconds: number;
    /** The case study it sits in. */
    placement: string;
  };
  prototype_open: LinkParams;
  social_click: LinkParams & { network: string };
  /** Any other link: off-site, or an in-page anchor like #demos. */
  link_click: LinkParams & { link_type: "outbound" | "in_page" };
  carousel_navigate: {
    method: CarouselMethod;
    /** 1-based, so slide 1 is the intro card. */
    slide_index: number;
    slide_title: string;
  };
  theme_change: {
    theme: "system" | "dark" | "light";
  };
  image_zoom_open: {
    image_alt: string;
    placement: string;
  };
  image_zoom_close: {
    /** Highest zoom step reached, e.g. 2.5; 1 means never zoomed past fit. */
    max_zoom: number;
    visible_seconds: number;
  };
  /** First keystroke in the contact form, per form instance and reset. */
  contact_form_start: {
    form_location: ContactFormLocation;
  };
  contact_form_error: {
    form_location: ContactFormLocation;
    error_type: "validation" | "api" | "network";
    /** Invalid fields for a validation error, e.g. "email,message". */
    fields?: string;
  };
  /** GA4's recommended lead event: a message sent. Mark as a key event. */
  generate_lead: {
    form_location: ContactFormLocation;
  };
  contact_form_reset: {
    form_location: ContactFormLocation;
  };
}

export type AnalyticsEventName = keyof AnalyticsEvents;

/**
 * Detail of the `overlayopen` event case-study-overlay.ts dispatches on a
 * dialog as it opens; src/scripts/analytics.ts turns it into overlay_open.
 */
export interface OverlayOpenDetail {
  source: OpenSource;
  /** The clicked element, for `placement`. Absent when opened from the URL. */
  trigger?: Element;
}

type Gtag = (...args: unknown[]) => void;

declare global {
  interface Window {
    gtag?: Gtag;
  }
  interface DocumentEventMap {
    overlayopen: CustomEvent<OverlayOpenDetail>;
  }
}

/** GA4 truncates longer parameter values, so trim them here on our terms. */
const MAX_PARAM_LENGTH = 100;

export function clip(value: string, max = MAX_PARAM_LENGTH): string {
  const text = value.replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

export function track<E extends AnalyticsEventName>(
  name: E,
  params: AnalyticsEvents[E],
): void {
  if (typeof window === "undefined") return;

  if (import.meta.env.DEV) {
    console.debug(`[analytics] ${name}`, params);
  }

  window.gtag?.("event", name, params);
}

/**
 * Where an element sits, for the `placement` parameter: the id of the overlay
 * it is inside, else the nearest `data-analytics-section`, else "page".
 */
export function placementOf(element: Element | null | undefined): string {
  if (!element) return "page";

  const dialog = element.closest("dialog[id]");
  if (dialog) return dialog.id;

  const section = element.closest("[data-analytics-section]");
  return section?.getAttribute("data-analytics-section") || "page";
}

/** The overlay type a dialog declares, or null for dialogs we don't report. */
export function overlayTypeOf(dialog: Element): OverlayType | null {
  const type = dialog.getAttribute("data-analytics-overlay");
  return type === "case_study" || type === "intro" || type === "contact"
    ? type
    : null;
}

/**
 * Wall-clock time that only runs while the tab is visible, so an overlay left
 * open in a background tab doesn't read as a ten-minute read.
 */
export class VisibleTimer {
  private visibleMs = 0;
  private since: number | null = null;

  constructor() {
    if (document.visibilityState === "visible") this.since = performance.now();
    document.addEventListener("visibilitychange", this.onVisibility);
  }

  private onVisibility = (): void => {
    if (document.visibilityState === "visible") {
      this.since ??= performance.now();
    } else if (this.since !== null) {
      this.visibleMs += performance.now() - this.since;
      this.since = null;
    }
  };

  /** Stop the timer and return whole seconds visible. */
  stop(): number {
    if (this.since !== null) {
      this.visibleMs += performance.now() - this.since;
      this.since = null;
    }
    document.removeEventListener("visibilitychange", this.onVisibility);
    return Math.round(this.visibleMs / 1000);
  }

  /** Seconds visible so far, without stopping. */
  peek(): number {
    const running = this.since === null ? 0 : performance.now() - this.since;
    return Math.round((this.visibleMs + running) / 1000);
  }
}
