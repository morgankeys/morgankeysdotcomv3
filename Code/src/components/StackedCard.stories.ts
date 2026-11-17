import { sampleImage } from "./story-samples";
import StackedCard from "./StackedCard.astro";

const meta = {
  title: "Components/StackedCard",
  component: StackedCard,
  args: {
    title: "Interactive demo",
    subtitle: "Prototype",
    body: "A clickable walkthrough of the flow, built beside the case study.",
    image: sampleImage,
    imageAlt: "The prototype's first screen",
    href: "https://example.com",
    actionLabel: "Open prototype",
  },
};

export default meta;

export const Default = {};
