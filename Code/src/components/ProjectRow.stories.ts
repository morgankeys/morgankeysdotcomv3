import { sampleImage, sampleLogo } from "./story-samples";
import ProjectRow from "./ProjectRow.astro";

const tile = {
  image: sampleImage,
  alt: "A project screenshot",
  zoomable: false,
};

const meta = {
  title: "Components/ProjectRow",
  component: ProjectRow,
  argTypes: {
    layout: { control: "select", options: ["solo", "duo", "primary-pair"] },
  },
  args: {
    title: "Earlier work",
    company: "OpenGov",
    companyLogo: sampleLogo,
    layout: "solo",
    assets: [tile],
    slots: {
      default:
        "<p>A short description of the project, with room for a second paragraph.</p>",
    },
  },
};

export default meta;

export const Solo = {};

export const Duo = {
  args: {
    layout: "duo",
    assets: [tile, { ...tile, alt: "A second screenshot" }],
  },
};
