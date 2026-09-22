import type { CaseStudyMeta } from "./types";
import card from "../../assets/case-studies/business-home/card.png";
import hero from "../../assets/case-studies/business-home/hero.png";

export const businessHome = {
  id: "business-home",
  tone: "night",
  title: "Business Home",
  subtitle: "Google | Summer 2026",
  preview:
    "Helped launch a new product for local merchants that featured generative AI. Prototyped and delivered critical flows for a quick 6-week turnaround, coordinating with multiple product teams.",
  card: {
    image: card,
    alt: "Google generative AI tools for merchants",
  },
  hero: {
    image: hero,
    alt: "Business Home concept for generating product images",
  },
} satisfies CaseStudyMeta;
