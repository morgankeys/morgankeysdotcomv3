import type { CaseStudyMeta } from "./types";
import card from "../../assets/case-studies/opengov-coa/card.png";
import hero from "../../assets/case-studies/opengov-coa/hero.png";

export const chartOfAccounts = {
  id: "chart-of-accounts",
  tone: "sun",
  title: "Chart of Accounts",
  subtitle: "OpenGov | 2016",
  preview:
    "Redesigned the tool local governments use to structure their financial data. Months of research into an esoteric accounting concept led to the \u201Cslot machine\u201D \u2014 a dynamic, spreadsheet-like view of nested taxonomies that users picked up naturally and that earned OpenGov a patent.",
  card: {
    image: card,
    alt: "Chart of accounts manager",
  },
  hero: {
    image: hero,
    alt: "The OpenGov chart of accounts manager",
  },
} satisfies CaseStudyMeta;
