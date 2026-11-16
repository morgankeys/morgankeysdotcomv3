import FactsList from "./FactsList.astro";

const items = [
  "Shipped with the design tokens",
  "Reviewed in a feature preview",
  "Hidden on staging and production",
];

const meta = {
  title: "Components/FactsList",
  component: FactsList,
  argTypes: {
    variant: { control: "select", options: ["compact", "card"] },
  },
  args: {
    heading: "What this includes",
    items,
    variant: "compact",
  },
};

export default meta;

export const Compact = {};

export const Card = { args: { variant: "card" } };
