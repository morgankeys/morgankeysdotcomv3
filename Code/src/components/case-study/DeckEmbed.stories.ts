import { sampleImage } from "../story-samples";
import DeckEmbed from "./DeckEmbed.astro";

const meta = {
  title: "Components/Case study/DeckEmbed",
  component: DeckEmbed,
  argTypes: {
    kind: { control: "select", options: ["deck", "prototype"] },
  },
  args: {
    title: "Prototyping kit deck",
    href: "https://www.figma.com/deck/example",
    cover: sampleImage,
    coverAlt: "The first slide",
    kind: "deck",
  },
};

export default meta;

export const Deck = {};

export const Prototype = {
  args: {
    kind: "prototype",
    title: "Prototyping kit prototype",
    href: "https://www.figma.com/proto/example",
  },
};
