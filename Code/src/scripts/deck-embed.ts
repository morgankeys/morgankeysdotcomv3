/**
 * deck-embed.ts
 *
 * Desktop: loads the Figma iframe for each DeckEmbed (a deck or a prototype,
 * per its `data-deck-kind`) when its overlay opens, never before: the embed is
 * several MB of script, and a page holds several.
 *
 * Phones: never loads it. A tap on the cover opens the deck or prototype in
 * Figma in a new tab, and the cover then shows a note saying so (`opened`).
 *
 * State lives on the embed's `data-state`, which DeckEmbed.astro styles:
 *  - `idle`    cover only
 *  - `loading` cover plus the progress bar, iframe hidden
 *  - `ready`   iframe faded in over the cover
 *  - `failed`  cover only, bar gone; the "Open in Figma" link still works
 *  - `opened`  phones: it went to a new tab; a note sits over the cover
 *
 * Decks report `deck_embed_load`; prototypes report `prototype_embed_load`.
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

type DeckState = "idle" | "loading" | "ready" | "failed" | "opened";
type EmbedKind = "deck" | "prototype";

/** DeckEmbed's `kind`; anything unexpected is treated as a deck. */
function kindOf(embed: HTMLElement): EmbedKind {
  return embed.dataset.deckKind === "prototype" ? "prototype" : "deck";
}

function setState(embed: HTMLElement, state: DeckState): void {
  embed.dataset.state = state;
  const status = embed.querySelector("[data-deck-status]");
  if (!status) return;
  const kind = kindOf(embed);
  status.textContent =
    state === "loading"
      ? `Loading ${kind}`
      : state === "failed"
        ? `The ${kind} didn't load. Open it in Figma instead.`
        : state === "opened"
          ? `The ${kind} opened in a new tab.`
          : "";
}

function load(embed: HTMLElement): void {
  if (embed.dataset.state !== "idle") return;

  const src = embed.dataset.deckSrc;
  const stage = embed.querySelector(".stage");
  if (!src || !stage) return;

  const kind = kindOf(embed);
  const startedAt = performance.now();
  const report = (outcome: "ready" | "timeout"): void => {
    track(kind === "prototype" ? "prototype_embed_load" : "deck_embed_load", {
      outcome,
      load_seconds: Math.round((performance.now() - startedAt) / 100) / 10,
      placement: placementOf(embed),
    });
  };

  const iframe = document.createElement("iframe");
  iframe.src = src;
  iframe.title = embed.dataset.deckTitle ?? `Case study ${kind}`;
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

/**
 * Phones: either deck link in the embed ("Open it again", or the caption
 * under the cover) opens Figma in a new tab, which external-links.ts
 * arranges. A tap on an idle cover is forwarded to the caption link, so it
 * counts as the same link click, analytics included. The cover itself isn't
 * focusable; keyboard and screen reader users have the caption link.
 */
function handlePhoneClick(event: MouseEvent): void {
  if (!MOBILE.matches || !(event.target instanceof Element)) return;
  const embed = event.target.closest<HTMLElement>(`[${EMBED_ATTR}]`);
  if (!embed) return;

  const link = event.target.closest("a[href]");
  if (link) {
    setState(embed, "opened");
    return;
  }

  if (embed.dataset.state === "idle" && event.target.closest(".stage")) {
    embed.querySelector<HTMLElement>(".caption a[href]")?.click();
  }
}

document.addEventListener("click", handlePhoneClick);

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

// A study opened from the URL (`/#autodesk-sso`) can open before this script
// runs, in which case its `overlayopen` was missed. Pick those up here.
document
  .querySelectorAll("dialog[open]")
  .forEach((dialog) => loadWithin(dialog));
