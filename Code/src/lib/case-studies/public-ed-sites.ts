import type { CaseStudyMeta } from "./types";
import card from "../../assets/case-studies/public-ed-sites/card.png";
import hero from "../../assets/case-studies/public-ed-sites/hero.png";

export const publicEdSites = {
  id: "public-ed-sites",
  tone: "teal",
  title: "Public Ed Sites",
  subtitle: "Boardable | Summer 2025",
  preview:
    "Working quickly to meet a market opportunity, I crafted both a public-facing, customizable page and the admin experience behind it.",
  card: {
    image: card,
    alt: "Public education sites",
  },
  hero: {
    image: hero,
    alt: "Shoreline Unified School District website built on Boardable's public education sites",
    crop: { width: 102.05, height: 302.73, left: -0.39, top: 0 },
  },
} satisfies CaseStudyMeta;
