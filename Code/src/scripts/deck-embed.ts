/**
 * deck-embed.ts
 *
 * Loads the Figma iframe for each DeckEmbed when its overlay opens, never
 * before: the embed is several MB of script, and a page holds three of them.
 *
 * State lives on the embed's `data-state`, which DeckEmbed.astro styles:
 *  - `idle`    cover only
 *  - `loading` cover plus the progress bar, iframe hidden
 *  - `ready`   iframe faded in over the cover
 *  - `failed`  cover only, bar gone; the "Open in Figma" link still works
 *
 * The iframe's `load` fires once Figma's page has loaded, a moment before the
 * slide paints, so the fade waits a beat longer. A loaded iframe stays loaded
 * after the overlay closes, so reopening it is instant.
 */

import { placementOf, track } from "../lib/analytics";

const EMBED_ATTR = "data-deck-embed";
/** Same literal as the mobile sheet in CaseStudyOverlay and DeckEmbed. */
const MOBILE = window.matchMedia("(max-width: 640px)");
/** Lets the first slide paint after `load` before the deck replaces the cover. */
const SETTLE_MS = 500;
/** Past this, stop showing progress and leave the cover and link. */
const TIMEOUT_MS = 20_000;

type DeckState = "idle" | "loading" | "ready" | "failed";

function setState(embed: HTMLElement, state: DeckState): void {
  embed.dataset.state = state;
  const status = embed.querySelector("[data-deck-status]");
  if (!status) return;
  status.textContent =
    state === "loading"
      ? "Loading deck"
      : state === "failed"
        ? "The deck didn't load. Open it in Figma instead."
        : "";
}

function load(embed: HTMLElement): void {
  if (embed.dataset.state !== "idle") return;

  const src = embed.dataset.deckSrc;
  const stage = embed.querySelector(".stage");
  if (!src || !stage) return;

  const startedAt = performance.now();
  const report = (outcome: "ready" | "timeout"): void => {
    track("deck_embed_load", {
      outcome,
      load_seconds: Math.round((performance.now() - startedAt) / 100) / 10,
      placement: placementOf(embed),
    });
  };

  const iframe = document.createElement("iframe");
  iframe.src = src;
  iframe.title = embed.dataset.deckTitle ?? "Case study deck";
  iframe.allow = "fullscreen";

  const timeout = window.setTimeout(() => {
    if (embed.dataset.state !== "loading") return;
    setState(embed, "failed");
    report("timeout");
  }, TIMEOUT_MS);

  iframe.addEventListener(
    "load",
    () => {
      window.setTimeout(() => {
        window.clearTimeout(timeout);
        const timedOut = embed.dataset.state === "failed";
        // A late load after a timeout still shows the deck, but was already
        // reported as a timeout.
        setState(embed, "ready");
        if (!timedOut) report("ready");
      }, SETTLE_MS);
    },
    { once: true },
  );

  setState(embed, "loading");
  stage.append(iframe);
}

function loadWithin(dialog: Element): void {
  if (MOBILE.matches) return;
  dialog
    .querySelectorAll<HTMLElement>(`[${EMBED_ATTR}]`)
    .forEach((embed) => load(embed));
}

document.addEventListener("overlayopen", (event) => {
  if (event.target instanceof Element) loadWithin(event.target);
});

// Widening the window past the phone layout while a study is open reveals the
// embed, so load it then.
MOBILE.addEventListener("change", () => {
  document
    .querySelectorAll("dialog[open]")
    .forEach((dialog) => loadWithin(dialog));
});
