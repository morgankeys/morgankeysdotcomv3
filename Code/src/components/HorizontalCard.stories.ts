import { sampleImage } from "./story-samples";
import HorizontalCard from "./HorizontalCard.astro";

const meta = {
  title: "Components/HorizontalCard",
  component: HorizontalCard,
  args: {
    title: "Case study deck",
    subtitle: "Twelve slides",
    href: "https://www.figma.com",
    image: sampleImage,
    imageAlt: "The first slide",
  },
};

export default meta;

export const Link = {};

export const Static = { args: { href: undefined } };
