import { sampleImage } from "./story-samples";
import CaseStudyCard from "./CaseStudyCard.astro";

const tones = ["night", "dusk", "teal", "rust", "ochre", "sun"] as const;

const meta = {
  title: "Components/CaseStudyCard",
  component: CaseStudyCard,
  argTypes: { tone: { control: "select", options: [...tones] } },
  args: {
    tone: "teal",
    title: "A kit for prototyping",
    subtitle: "Boardable | Summer 2025",
    body: "Designers needed a sandbox that already knew the design system.",
    href: "#study",
    image: sampleImage,
    imageAlt: "The kit's home screen",
    ctaLabel: "Read more...",
  },
};

export default meta;

export const Default = {};

export const OverlayTrigger = { args: { overlayId: "study-story" } };
