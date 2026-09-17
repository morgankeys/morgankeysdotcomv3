/**
 * case-studies.ts
 *
 * Overlay ids for the case studies in src/components/case-studies/. Each id is
 * the dialog's `id`, the carousel card's `data-overlay-target`, and the URL
 * fragment that deep-links to the study, so it has to be shared between the
 * overlay and the card that opens it. Astro components can't export values, so
 * the registry lives here rather than alongside each overlay.
 */
export const CASE_STUDY_IDS = {
  businessHome: "business-home",
  aiPrototypingKit: "ai-prototyping-kit",
  publicEdSites: "public-ed-sites",
  ciscoCybersecurity: "cisco-cybersecurity",
  autodeskSso: "autodesk-sso",
  chartOfAccounts: "chart-of-accounts",
} as const;

export type CaseStudyId = (typeof CASE_STUDY_IDS)[keyof typeof CASE_STUDY_IDS];
