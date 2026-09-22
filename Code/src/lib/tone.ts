/**
 * tone.ts
 *
 * The brand tones a card and the overlay it opens can be painted in. Each name
 * resolves `--md-ref-brand-tone` / `--md-ref-brand-on-tone` (see
 * src/styles/brand.css). It lives here rather than in CaseStudyCard.astro so
 * plain `.ts` modules — the case-study registry in particular — can type
 * against it without importing an Astro component.
 */
export type CardTone =
  "night" | "dusk" | "teal" | "rust" | "ochre" | "sun";
