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
 * URL fragment that deep-links to the study.
 */
export const CASE_STUDY_IDS = Object.fromEntries(
  Object.entries(registry).map(([key, study]) => [key, study.id]),
) as { [K in keyof typeof registry]: (typeof registry)[K]["id"] };

export type CaseStudyId = (typeof CASE_STUDY_IDS)[keyof typeof CASE_STUDY_IDS];

/** Props for the CaseStudyCard that opens `study` in the carousel. */
export function toCarouselCard(study: CaseStudyMeta) {
  return {
    tone: study.tone,
    title: study.title,
    subtitle: study.subtitle,
    body: study.preview,
    // A real href keeps the card working as an anchor before the overlay
    // script loads, or if it never does.
    href: `#${study.id}`,
    overlayId: study.id,
    image: study.card.image,
    imageAlt: study.card.alt,
  };
}

/** Header props for the CaseStudyOverlay of `study`; its body stays in markup. */
export function toOverlayProps(study: CaseStudyMeta) {
  return {
    id: study.id,
    tone: study.tone,
    title: study.title,
    subtitle: study.subtitle,
    standfirst: study.standfirst ?? study.preview,
    image: study.hero.image,
    imageAlt: study.hero.alt,
    crop: study.hero.crop,
  };
}
