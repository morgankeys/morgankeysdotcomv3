import { sampleImage } from "../story-samples";
import AssetRow from "./AssetRow.astro";

const meta = {
  title: "Components/Case study/AssetRow",
  component: AssetRow,
  args: {
    assets: [
      {
        image: sampleImage,
        alt: "The first frame",
        caption: "Where the flow starts.",
        zoomable: false,
      },
      {
        image: sampleImage,
        alt: "The second frame",
        caption: "Where it ends.",
        zoomable: false,
      },
    ],
  },
};

export default meta;

export const Default = {};
