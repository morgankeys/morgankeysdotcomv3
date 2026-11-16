import { sampleImage } from "./story-samples";
import Figure from "./Figure.astro";

const meta = {
  title: "Components/Figure",
  component: Figure,
  args: {
    src: sampleImage,
    alt: "A sample photograph",
    caption: "The frame the study opens on.",
    credit: "Morgan Keys",
    zoomable: true,
  },
};

export default meta;

export const Default = {};

export const CaptionOnly = { args: { credit: undefined } };

export const NotZoomable = { args: { zoomable: false } };
