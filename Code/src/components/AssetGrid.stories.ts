import { storyFrame } from "../../.storybook/story-frame";
import { sampleImage } from "./story-samples";
import AssetGrid from "./AssetGrid.astro";

const tile = {
  image: sampleImage,
  alt: "A sample photograph",
};

const frame = storyFrame({ min: 320, max: 1100, initial: 720 });

const meta = {
  title: "Components/AssetGrid",
  component: AssetGrid,
  decorators: frame.decorators,
  argTypes: {
    ...frame.argTypes,
    layout: { control: "select", options: ["solo", "duo", "primary-pair"] },
    // Each tile's image is a file, not something the grid lays out.
    assets: { control: false },
    zoomable: { control: "boolean" },
  },
  args: {
    ...frame.args,
    layout: "solo",
    assets: [tile],
    zoomable: true,
  },
};

export default meta;

export const Solo = {};

export const Duo = {
  args: {
    layout: "duo",
    assets: [tile, { ...tile, alt: "A second photograph" }],
  },
};

export const PrimaryPair = {
  args: {
    layout: "primary-pair",
    assets: [
      tile,
      { ...tile, alt: "A second photograph" },
      { ...tile, alt: "A third photograph" },
    ],
  },
};
