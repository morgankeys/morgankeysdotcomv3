import { openDialog } from "../../.storybook/open-dialog";
import { sampleImage } from "./story-samples";
import IntroOverlay from "./IntroOverlay.astro";

const meta = {
  title: "Components/IntroOverlay",
  component: IntroOverlay,
  args: {
    id: "intro-overlay-story",
    title: "Hi, I'm Morgan",
    subtitle: "Product designer",
    body: "I design tools for people who build things, and I build some of them too.",
    sections: [
      {
        heading: "Now",
        body: "Building a prototyping kit so a case study and its components stay in one place.",
      },
    ],
    image: sampleImage,
    imageAlt: "Portrait",
  },
};

export default meta;

export const Default = { play: openDialog };
