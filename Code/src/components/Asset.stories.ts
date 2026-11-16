import { sampleImage } from "./story-samples";
import Asset from "./Asset.astro";

const meta = {
  title: "Components/Asset",
  component: Asset,
  argTypes: {
    fit: { control: "select", options: ["cover", "contain"] },
    elevation: { control: "select", options: ["container", "image"] },
    zoomable: { control: "boolean" },
  },
  args: {
    image: sampleImage,
    alt: "A sample photograph",
    fit: "cover",
    elevation: "container",
    zoomable: false,
  },
};

export default meta;

export const Default = {};

export const Contain = { args: { fit: "contain" } };

export const Zoomable = { args: { zoomable: true } };
