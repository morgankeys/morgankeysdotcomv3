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
  card: {
    image: card,
    alt: "AI prototyping kit",
  },
  hero: {
    image: hero,
    alt: "Editor showing the AI prototyping kit repository",
  },
} satisfies CaseStudyMeta;
