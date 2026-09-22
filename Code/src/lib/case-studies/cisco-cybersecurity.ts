import type { CaseStudyMeta } from "./types";
import card from "../../assets/case-studies/cisco-cybersecurity/card.png";
import hero from "../../assets/case-studies/cisco-cybersecurity/hero.png";

export const ciscoCybersecurity = {
  id: "cisco-cybersecurity",
  tone: "rust",
  title: "Cisco Cybersecurity",
  subtitle: "DesignMap | 2023",
  preview:
    "Led a team to redesign a cybersecurity platform. Combined various, complex tools into a unified, streamlined experience.",
  card: {
    image: card,
    alt: "Cisco cybersecurity dashboard",
  },
  hero: {
    image: hero,
    alt: "Cisco cybersecurity incident details dashboard",
  },
} satisfies CaseStudyMeta;
