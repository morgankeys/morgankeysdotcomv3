import { sampleImage } from "./story-samples";
import AssetGrid from "./AssetGrid.astro";

const tile = {
  image: sampleImage,
  alt: "A sample photograph",
  zoomable: false,
};

const meta = {
  title: "Components/AssetGrid",
  component: AssetGrid,
  argTypes: {
    layout: { control: "select", options: ["solo", "duo", "primary-pair"] },
    zoomable: { control: "boolean" },
  },
  args: {
    layout: "solo",
    assets: [tile],
    zoomable: false,
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
