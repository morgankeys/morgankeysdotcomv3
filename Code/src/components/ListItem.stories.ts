import ListItem from "./ListItem.astro";

const meta = {
  title: "Components/ListItem",
  component: ListItem,
  args: { slots: { default: "A single point in a longer list." } },
};

export default meta;

export const Default = {};
