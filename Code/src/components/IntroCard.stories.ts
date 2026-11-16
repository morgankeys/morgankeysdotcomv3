import { sampleImage } from "./story-samples";
import IntroCard from "./IntroCard.astro";

const meta = {
  title: "Components/IntroCard",
  component: IntroCard,
  args: {
    title: "Hi, I'm Morgan",
    subtitle: "Product designer",
    body: "I design tools for people who build things, and I build some of them too.",
    href: "#intro",
    image: sampleImage,
    imageAlt: "Portrait",
    ctaLabel: "Read more...",
  },
};

export default meta;

export const Default = {};

export const OverlayTrigger = { args: { overlayId: "intro-story" } };
