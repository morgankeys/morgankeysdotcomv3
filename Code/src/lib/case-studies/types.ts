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
import type { ImageMetadata } from "astro";
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

/** A headline result: a short value set large, and one line explaining it. */
export interface CaseStudyHighlight {
  /** E.g. "3 steps", "80%", "RSA 2023". */
  value: string;
  detail: string;
}

export interface CaseStudyMeta {
  /**
   * Dialog `id`, card `data-overlay-target`, and the study's route,
   * `/work/<id>/`. Keep it matching the title; it is a public URL.
   */
  id: string;
  /**
   * Former ids, so links shared before a rename (`/#<old id>`) still open the
   * study.
   */
  aliases?: string[];
  /** Painted on both the card and the overlay, so they always match. */
  tone: CardTone;
  title: string;
  /** Company and date, e.g. "Boardable | Summer 2025". */
  subtitle: string;
  /** Teaser on the carousel card, where it is clamped to five lines. */
  preview: string;
  /** Lead paragraph of the overlay. Falls back to `preview` when unset. */
  standfirst?: string;
  /**
   * Headline results shown under the standfirst, three by convention, so a
   * reader who stops early still sees the outcome. Overlay only.
   */
  highlights?: CaseStudyHighlight[];
  /** Top band of the carousel card, exported cropped to its 320px width. */
  card: CaseStudyImage;
  /** Hero at the top of the overlay, up to 1024px wide. */
  hero: CaseStudyHeroImage;
}
