import { sampleImage } from "../story-samples";
import ProseBlock from "./ProseBlock.astro";

const copy =
  "<p>The copy sits beside the image on a wide screen and stacks under it when the section gets narrow.</p>";

const meta = {
  title: "Components/Case study/ProseBlock",
  component: ProseBlock,
  argTypes: {
    layout: { control: "select", options: ["beside", "stacked"] },
    fit: { control: "select", options: ["cover", "contain"] },
  },
  args: {
    heading: "What changed",
    image: sampleImage,
    imageAlt: "The screen after the change",
    imageCaption: "The shipped layout.",
    layout: "beside",
    slots: { default: copy },
  },
};

export default meta;

export const Beside = {};

export const Stacked = { args: { layout: "stacked" } };

export const CopyOnly = {
  args: {
    image: undefined,
    imageCaption: undefined,
    heading: "Without an image",
  },
};
