import type { CaseStudyMeta } from "./types";
import card from "../../assets/case-studies/autodesk-sso/card.png";
import hero from "../../assets/case-studies/autodesk-sso/hero.png";

export const autodeskSso = {
  id: "autodesk-sso",
  tone: "ochre",
  title: "Autodesk SSO",
  subtitle: "Autodesk | 2020",
  preview:
    "Seamlessly integrated a critical sign-up flow, paving the way for long-term platform unification.",
  card: {
    image: card,
    alt: "Autodesk single sign-on",
  },
  hero: {
    image: hero,
    alt: "BuildingConnected sign-in screen used in Autodesk SSO",
  },
} satisfies CaseStudyMeta;
