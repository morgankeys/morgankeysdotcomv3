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
    "Helped reimagine Cisco’s fragmented security suite as one XDR platform, cutting incident triage from 18+ steps to 3.",
  standfirst:
    "As the UX Lead on a 5-person DesignMap team, I helped reimagine Cisco’s fragmented security suite as one XDR platform, guiding two designers through research, concepting, and testing.",
  highlights: [
    {
      value: "3 steps",
      detail:
        "To triage and act on an incident, down from 18+ steps across 3+ separate tools.",
    },
    {
      value: "RSA 2023",
      detail:
        "Featured in Cisco’s XDR launch. I co-presented the final readout to Cisco’s EVP of Security & Collaboration. Nominated for a UX Award.",
    },
    {
      value: "New platform",
      detail:
        "Cisco retired the legacy SecureX platform and built on this foundation, which won 450+ customers in its first 10 months after launch.",
    },
  ],
  card: {
    image: card,
    alt: "Cisco cybersecurity dashboard",
  },
  hero: {
    image: hero,
    alt: "Cisco cybersecurity incident details dashboard",
  },
} satisfies CaseStudyMeta;
