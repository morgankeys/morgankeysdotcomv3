import type { CaseStudyMeta } from "./types";
import card from "../../assets/case-studies/cisco-cybersecurity/card.png";
import hero from "../../assets/case-studies/cisco-cybersecurity/hero.png";

export const ciscoCybersecurity = {
  id: "cisco-cybersecurity",
  tone: "rust",
  title: "Cisco XDR",
  subtitle: "DesignMap | 2022",
  preview:
    "Led a team in redesigning Cisco's cybersecurity platform. Combined various complex tools into a unified, streamlined experience.",
  standfirst:
    "I led UX on a 5-person DesignMap team that reimagined Cisco’s fragmented security suite as one XDR platform, guiding two designers through research, concepting, and testing.",
  card: {
    image: card,
    alt: "Cisco cybersecurity dashboard",
  },
  hero: {
    image: hero,
    alt: "Cisco cybersecurity incident details dashboard",
  },
} satisfies CaseStudyMeta;
