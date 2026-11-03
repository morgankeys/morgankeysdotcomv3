/**
 * case-studies/index.ts
 *
 * The registry of case studies: one entry per study, each declaring the id,
 * tone, title, subtitle, copy, and imagery that the carousel card and the
 * overlay it opens both draw from. Card and overlay used to hold their own
 * copies of this and drifted apart; now there is one source.
 *
 * `toCarouselCard` and `toOverlayProps` project an entry onto the props of
 * CaseStudyCard.astro and CaseStudyOverlay.astro respectively. They live here
 * rather than in the components because Astro components cannot export values.
 */
import type { CaseStudyMeta } from "./types";
import { businessHome } from "./business-home";
import { aiPrototypingKit } from "./ai-prototyping-kit";
import { publicEdSites } from "./public-ed-sites";
import { ciscoCybersecurity } from "./cisco-cybersecurity";
import { autodeskSso } from "./autodesk-sso";
import { chartOfAccounts } from "./chart-of-accounts";

export type {
  CaseStudyMeta,
  CaseStudyImage,
  CaseStudyHeroImage,
  CaseStudyHighlight,
} from "./types";
export {
  businessHome,
  aiPrototypingKit,
  publicEdSites,
  ciscoCybersecurity,
  autodeskSso,
  chartOfAccounts,
};

const registry = {
  businessHome,
  aiPrototypingKit,
  publicEdSites,
  ciscoCybersecurity,
  autodeskSso,
  chartOfAccounts,
};

/**
 * Every study, in the order the carousel shows them. The intro card is not a
 * case study and stays defined on the page that renders it.
 */
export const caseStudies: CaseStudyMeta[] = Object.values(registry);

/**
 * Overlay ids, derived from the registry so they cannot fall out of step with
 * it. Each id is the dialog's `id`, the card's `data-overlay-target`, and the
 * last segment of the study's route.
 */
export const CASE_STUDY_IDS = Object.fromEntries(
  Object.entries(registry).map(([key, study]) => [key, study.id]),
) as { [K in keyof typeof registry]: (typeof registry)[K]["id"] };

export type CaseStudyId = (typeof CASE_STUDY_IDS)[keyof typeof CASE_STUDY_IDS];

/**
 * A study's own URL, `/work/<id>/`, built by src/pages/work/[id].astro. The
 * trailing slash matches the directory-style pages Astro emits.
 */
export function studyPath(id: string): string {
  return `/work/${id}/`;
}

/** Props for the CaseStudyCard that opens `study` in the carousel. */
export function toCarouselCard(study: CaseStudyMeta) {
  return {
    tone: study.tone,
    title: study.title,
    subtitle: study.subtitle,
    body: study.preview,
    // A real href keeps the card working as a link before the overlay script
    // loads, or if it never does, and lets it open in a new tab.
    href: studyPath(study.id),
    overlayId: study.id,
    image: study.card.image,
    imageAlt: study.card.alt,
  };
}

/** Header props for the CaseStudyOverlay of `study`; its body stays in markup. */
export function toOverlayProps(study: CaseStudyMeta) {
  return {
    id: study.id,
    aliases: study.aliases,
    tone: study.tone,
    title: study.title,
    subtitle: study.subtitle,
    standfirst: study.standfirst ?? study.preview,
    highlights: study.highlights,
    summary: study.summary,
    image: study.hero.image,
    imageAlt: study.hero.alt,
    crop: study.hero.crop,
  };
}
