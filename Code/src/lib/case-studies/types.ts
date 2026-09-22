/**
 * types.ts
 *
 * The shape of a case study. Everything a carousel card and the overlay it
 * opens both need — id, tone, title, subtitle, copy, imagery — is declared
 * once here so the two can never describe the same study differently.
 *
 * Long-form body content (ProseBlock / Banner / AssetRow) stays in the study's
 * fragment under src/components/case-studies/, since it is markup, not data.
 */
import type { ImageMetadata } from "astro:assets";
import type { ImageCrop } from "../crop";
import type { CardTone } from "../tone";

/** An image plus its alt text. */
export interface CaseStudyImage {
  image: ImageMetadata;
  alt: string;
}

/** A hero can additionally carry a Figma crop; card art is pre-cropped. */
export interface CaseStudyHeroImage extends CaseStudyImage {
  crop?: ImageCrop;
}

export interface CaseStudyMeta {
  /** Dialog `id`, card `data-overlay-target`, and URL fragment. */
  id: string;
  /** Painted on both the card and the overlay, so they always match. */
  tone: CardTone;
  title: string;
  /** Company and date, e.g. "Boardable | Summer 2025". */
  subtitle: string;
  /** Teaser on the carousel card, where it is clamped to five lines. */
  preview: string;
  /** Lead paragraph of the overlay. Falls back to `preview` when unset. */
  standfirst?: string;
  /** Top band of the carousel card, exported cropped to its 320px width. */
  card: CaseStudyImage;
  /** Hero at the top of the overlay, up to 1024px wide. */
  hero: CaseStudyHeroImage;
}
