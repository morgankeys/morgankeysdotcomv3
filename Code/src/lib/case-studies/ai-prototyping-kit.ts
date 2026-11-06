import type { CaseStudyMeta } from "./types";
import card from "../../assets/case-studies/ai-prototyping-kit/card.png";
import hero from "../../assets/case-studies/ai-prototyping-kit/hero.png";

export const aiPrototypingKit = {
  id: "ai-prototyping-kit",
  tone: "dusk",
  title: "AI Prototyping Kit",
  subtitle: "Google | Summer 2026",
  preview:
    "As part of an internal push to transform design workflows, I developed a customized AI prototyping kit. I built a well-structured codebase, using design tokens and skills to improve Gemini's outputs. The results were faster to build and more consistent, enabling deeper design review and better engineering handoff.",
  // Draft summary. The overlay shows it only where draft content renders until
  // the study is ready to ship; see components/case-studies/ai-prototyping-kit.astro.
  standfirst:
    "I built a prototyping kit that kept AI-generated prototypes true to our new design library, and used it to prototype the core gen-AI flows for Business Home, Google’s next-generation merchant experience.",
  highlights: [
    {
      value: "On-brand",
      detail:
        "My prototypes used only the new library’s components and tokens. Others kept slipping back to older Material Design 3 components.",
    },
    {
      value: "8 weeks",
      detail:
        "To build the kit, during the Business Home project and alongside my design work on it.",
    },
    {
      value: "Shared",
      detail:
        "Piloted with my teammates and shared with engineering. The shared sandbox team adopted some of my tips.",
    },
  ],
  card: {
    image: card,
    alt: "AI prototyping kit",
  },
  hero: {
    image: hero,
    alt: "Editor showing the AI prototyping kit repository",
  },
} satisfies CaseStudyMeta;
