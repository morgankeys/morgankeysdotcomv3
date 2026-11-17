import { openDialog } from "../../.storybook/open-dialog";
import { sampleHighlights, sampleImage } from "./story-samples";
import CaseStudyOverlay from "./CaseStudyOverlay.astro";

const tones = ["night", "dusk", "teal", "rust", "ochre", "sun"] as const;

const meta = {
  title: "Components/CaseStudyOverlay",
  component: CaseStudyOverlay,
  argTypes: { tone: { control: "select", options: [...tones] } },
  args: {
    id: "study-overlay-story",
    tone: "teal",
    title: "A kit for prototyping",
    subtitle: "Boardable | Summer 2025",
    standfirst:
      "Designers needed a sandbox that already knew the design system.",
    role: "Design and build",
    highlights: sampleHighlights,
    summary: true,
    image: sampleImage,
    imageAlt: "The kit's home screen",
    slots: {
      default:
        "<p>The study body sits in the default slot, under the summary.</p>",
    },
  },
};

export default meta;

export const Default = { play: openDialog };

export const Hidden = { args: { hidden: true } };
