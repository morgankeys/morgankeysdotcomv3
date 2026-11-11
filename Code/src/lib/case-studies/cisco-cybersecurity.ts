import type { CaseStudyMeta } from "./types";
import card from "../../assets/case-studies/cisco-cybersecurity/card.png";
import hero from "../../assets/case-studies/cisco-cybersecurity/hero.png";

export const ciscoCybersecurity = {
  id: "cisco-xdr",
  aliases: ["cisco-cybersecurity"],
  tone: "rust",
  title: "Cisco XDR",
  subtitle: "DesignMap | 2022",
  preview:
    "Led a team in redesigning Cisco’s cybersecurity platform. Combined various complex tools into a unified, streamlined experience.",
  role: "Job role: UX Lead (Senior+ resource intended for high independence and leadership).",
  card: {
    image: card,
    alt: "Cisco cybersecurity dashboard",
  },
  hero: {
    image: hero,
    alt: "Cisco cybersecurity incident details dashboard",
  },
} satisfies CaseStudyMeta;
