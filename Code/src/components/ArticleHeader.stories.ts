import ArticleHeader from "./ArticleHeader.astro";

const meta = {
  title: "Components/ArticleHeader",
  component: ArticleHeader,
  argTypes: {
    level: { control: "select", options: [1, 2] },
  },
  args: {
    level: 2,
    eyebrow: "Case study · 2024",
    title: "Rebuilding the transit app",
    standfirst:
      "Nine months spent removing features, and what the riders kept asking for.",
    byline: ["Product design", "14 min read", "Case study"],
  },
};

export default meta;

export const Default = {};

export const TitleOnly = {
  args: { eyebrow: undefined, standfirst: undefined, byline: [] },
};
