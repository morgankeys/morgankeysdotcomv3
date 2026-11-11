import type { CaseStudyMeta } from "./types";
import card from "../../assets/case-studies/ai-prototyping-kit/card.png";
import hero from "../../assets/case-studies/ai-prototyping-kit/hero.png";

export const aiPrototypingKit = {
  id: "ai-prototyping-kit",
  tone: "dusk",
  title: "AI Prototyping Kit",
  subtitle: "Google | Summer 2026",
  preview:
    "As part of an internal push to transform design workflows, I developed a customized AI prototyping kit. I built a well-structured codebase, using design tokens and skills to improve Gemini’s outputs. The results were faster to build and more consistent, enabling deeper design review and better engineering handoff.",
  standfirst:
    "I built a prototyping kit that kept AI-generated prototypes true to our new design library, and used it to prototype the core generative AI flows for Business Home, Google’s next-generation merchant experience.",
  role: "Job role: UX Designer II (Contract), owning a product pillar (Discovery & Engagement).",
  highlights: [
    {
      value: "On-brand",
      detail:
        "Layers of context and tooling locked-in the design system, resulting in near pixel-perfect, on-brand outputs.",
    },
    {
      value: "8 weeks",
      detail:
        "Developing the kit during the Business Home project, alongside and supporting my core design work.",
    },
    {
      value: "Inspiration",
      detail:
        "Walkthroughs with my teammates and engineering, shared with the broader Business Home team. Meant to inspire best practices.",
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
