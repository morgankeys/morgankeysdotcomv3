import { sampleHighlights } from "../story-samples";
import Highlights from "./Highlights.astro";

const meta = {
  title: "Components/Case study/Highlights",
  component: Highlights,
  args: { items: sampleHighlights },
};

export default meta;

export const Default = {};
