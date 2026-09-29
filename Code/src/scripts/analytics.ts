/**
 * analytics.ts
 *
 * Site-wide GA4 events that need no per-component wiring. Loaded from
 * BaseLayout; delegated from the document like the other scripts here.
 *
 * - Overlays: open, close (with how and after how long), scroll milestones,
 *   and `case_study_read`. case-study-overlay.ts announces each open with an
 *   `overlayopen` event and passes the close method to `dialog.close()`.
 * - Links: resume, decks, prototypes, socials, and everything else, classified
 *   by URL so new content is tracked without touching it.
 * - Sections: `section_view` once per page load for each
 *   `[data-analytics-section]` the visitor reaches.
 *
 * Events that belong to one component (carousel, theme toggle, contact form,
 * image zoom) are sent from that component instead. The catalog of every
 * event is `AnalyticsEvents` in src/lib/analytics.ts.
 */

import {
  VisibleTimer,
  clip,
  overlayTypeOf,
  placementOf,
  track,
  type CloseMethod,
  type OpenSource,
  type OverlayType,
} from "../lib/analytics";

// ---------------------------------------------------------------------------
// Overlays
// ---------------------------------------------------------------------------

const SCROLL_MILESTONES = [25, 50, 75, 90];
/** A case study counts as read at this depth, after at least this long. */
const READ_PERCENT = 90;
const READ_MIN_SECONDS = 10;

interface OverlaySession {
  type: OverlayType;
  timer: VisibleTimer;
  maxPercent: number;
  milestones: Set<number>;
  escaped: boolean;
  readSent: boolean;
}

const sessions = new Map<HTMLDialogElement, OverlaySession>();

const CLOSE_METHODS: readonly CloseMethod[] = [
  "button",
  "backdrop",
  "escape",
  "swipe",
  "navigation",
  "page_exit",
  "other",
];

function isCloseMethod(value: string): value is CloseMethod {
  return (CLOSE_METHODS as readonly string[]).includes(value);
}

/** How far down the dialog the bottom of the viewport is, 0–100. */
function scrollPercent(dialog: HTMLDialogElement): number {
  const { scrollTop, clientHeight, scrollHeight } = dialog;
  if (scrollHeight <= clientHeight) return 100;
  return Math.min(
    100,
    Math.round(((scrollTop + clientHeight) / scrollHeight) * 100),
  );
}

function maybeSendRead(dialog: HTMLDialogElement, session: OverlaySession) {
  if (session.type !== "case_study" || session.readSent) return;
  if (session.maxPercent < READ_PERCENT) return;

  const seconds = session.timer.peek();
  if (seconds < READ_MIN_SECONDS) return;

  session.readSent = true;
  track("case_study_read", { overlay_id: dialog.id, visible_seconds: seconds });
}

function recordScroll(dialog: HTMLDialogElement, session: OverlaySession) {
  // The contact form fits on screen; depth says nothing there.
  if (session.type === "contact") return;

  const percent = scrollPercent(dialog);
  if (percent <= session.maxPercent) return;
  session.maxPercent = percent;

  for (const milestone of SCROLL_MILESTONES) {
    if (percent >= milestone && !session.milestones.has(milestone)) {
      session.milestones.add(milestone);
      track("overlay_scroll", {
        overlay_id: dialog.id,
        overlay_type: session.type,
        percent_scrolled: milestone,
      });
    }
  }

  maybeSendRead(dialog, session);
}

function startSession(
  dialog: HTMLDialogElement,
  source: OpenSource,
  trigger?: Element,
): void {
  const type = overlayTypeOf(dialog);
  if (!type || sessions.has(dialog)) return;

  const session: OverlaySession = {
    type,
    timer: new VisibleTimer(),
    maxPercent: 0,
    milestones: new Set(),
    escaped: false,
    readSent: false,
  };
  sessions.set(dialog, session);

  track("overlay_open", {
    overlay_id: dialog.id,
    overlay_type: type,
    open_source: source,
    placement: source === "click" ? placementOf(trigger) : "url",
  });

  // What's on screen at open counts too: a short study is fully seen.
  recordScroll(dialog, session);
}

function endSession(dialog: HTMLDialogElement, method: CloseMethod): void {
  const session = sessions.get(dialog);
  if (!session) return;
  sessions.delete(dialog);

  maybeSendRead(dialog, session);
  track("overlay_close", {
    overlay_id: dialog.id,
    overlay_type: session.type,
    close_method: method,
    visible_seconds: session.timer.stop(),
    percent_scrolled: session.maxPercent,
  });
}

document.addEventListener("overlayopen", (event) => {
  if (!(event.target instanceof HTMLDialogElement)) return;
  startSession(event.target, event.detail.source, event.detail.trigger);
});

// `cancel`, `close`, and `scroll` don't bubble, so capture them on the way down.
document.addEventListener(
  "cancel",
  (event) => {
    if (!(event.target instanceof HTMLDialogElement)) return;
    const session = sessions.get(event.target);
    if (session) session.escaped = true;
  },
  true,
);

document.addEventListener(
  "close",
  (event) => {
    if (!(event.target instanceof HTMLDialogElement)) return;
    const dialog = event.target;
    const session = sessions.get(dialog);
    if (!session) return;

    const reason = dialog.returnValue;
    const method: CloseMethod = isCloseMethod(reason)
      ? reason
      : session.escaped
        ? "escape"
        : "other";
    endSession(dialog, method);
  },
  true,
);

document.addEventListener(
  "scroll",
  (event) => {
    if (!(event.target instanceof HTMLDialogElement)) return;
    const session = sessions.get(event.target);
    if (session) recordScroll(event.target, session);
  },
  { capture: true, passive: true },
);

// Leaving with an overlay open still reports how long it was read.
window.addEventListener("pagehide", () => {
  for (const dialog of [...sessions.keys()]) endSession(dialog, "page_exit");
});

// case-study-overlay.ts may open a deep-linked overlay before this script
// runs, in which case its `overlayopen` was missed. Pick those up here.
document
  .querySelectorAll<HTMLDialogElement>("dialog[open][data-analytics-overlay]")
  .forEach((dialog) => startSession(dialog, "deep_link"));

// ---------------------------------------------------------------------------
// Links
// ---------------------------------------------------------------------------

const SOCIAL_NETWORKS: Record<string, string> = {
  "github.com": "github",
  "linkedin.com": "linkedin",
  "x.com": "x",
  "twitter.com": "x",
  "substack.com": "substack",
  "threads.com": "threads",
  "threads.net": "threads",
};

function onDomain(host: string, domain: string): boolean {
  return host === domain || host.endsWith(`.${domain}`);
}

function socialNetwork(host: string): string | undefined {
  const domain = Object.keys(SOCIAL_NETWORKS).find((d) => onDomain(host, d));
  return domain ? SOCIAL_NETWORKS[domain] : undefined;
}

/** Card or banner title, then aria-label, then the link's own text. */
function linkText(anchor: HTMLAnchorElement): string {
  const label = anchor.getAttribute("aria-label");
  if (label) return clip(label);

  const title =
    anchor.querySelector(".title") ??
    anchor.closest(".card, .banner")?.querySelector(".title");
  return clip(title?.textContent || anchor.textContent || "");
}

function handleLinkClick(event: MouseEvent): void {
  // Primary click (with or without modifiers) and middle click both open it.
  if (event.button !== 0 && event.button !== 1) return;
  if (!(event.target instanceof Element)) return;

  const anchor = event.target.closest("a[href]");
  if (!(anchor instanceof HTMLAnchorElement)) return;
  // Overlay triggers report through overlay_open instead.
  if (anchor.closest("[data-overlay-target]")) return;

  let url: URL;
  try {
    url = new URL(anchor.href, window.location.href);
  } catch {
    return;
  }

  const sameDocument =
    url.origin === window.location.origin &&
    url.pathname === window.location.pathname;
  if (sameDocument && url.hash) {
    // A hash naming a dialog opens it, which overlay_open already reports.
    if (document.getElementById(url.hash.slice(1)) instanceof HTMLDialogElement)
      return;
  }

  const params = {
    link_text: linkText(anchor),
    link_url: clip(`${url.origin}${url.pathname}${url.hash}`),
    placement: placementOf(anchor),
  };
  const host = url.hostname;
  const path = url.pathname;
  const network = socialNetwork(host);

  if (onDomain(host, "docs.google.com") && path.startsWith("/document/")) {
    track("resume_open", params);
  } else if (onDomain(host, "figma.com") && path.startsWith("/deck/")) {
    track("deck_open", params);
  } else if (
    onDomain(host, "figma.com") &&
    (path.startsWith("/make/") || path.startsWith("/proto/"))
  ) {
    track("prototype_open", params);
  } else if (network) {
    track("social_click", { ...params, network });
  } else if (sameDocument) {
    track("link_click", { ...params, link_type: "in_page" });
  } else if (url.origin !== window.location.origin) {
    track("link_click", { ...params, link_type: "outbound" });
  }
}

document.addEventListener("click", handleLinkClick, true);
document.addEventListener("auxclick", handleLinkClick, true);

// ---------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------

// Fires once a section's top reaches the upper half of the viewport, so a
// section taller than the screen still counts as reached.
const sectionObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      sectionObserver.unobserve(entry.target);
      const section = entry.target.getAttribute("data-analytics-section");
      if (section) track("section_view", { section });
    }
  },
  { rootMargin: "0px 0px -50% 0px" },
);

document
  .querySelectorAll("[data-analytics-section]")
  .forEach((element) => sectionObserver.observe(element));
