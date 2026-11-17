import { sampleImage } from "../story-samples";
import Banner from "./Banner.astro";

const meta = {
  title: "Components/Case study/Banner",
  component: Banner,
  argTypes: {
    variant: { control: "select", options: ["card", "section"] },
  },
  args: {
    title: "Read the deck",
    body: "The full walkthrough lives in Figma, beside this study.",
    href: "https://www.figma.com",
    actionLabel: "Open in Figma",
    image: sampleImage,
    imageAlt: "The first slide",
    variant: "card",
  },
};

export default meta;

export const Card = {};

export const Section = { args: { variant: "section", image: undefined } };
