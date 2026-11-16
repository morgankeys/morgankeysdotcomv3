import Tag from "./Tag.astro";

const meta = {
  title: "Components/Tag",
  component: Tag,
  args: { slots: { default: "Case study" } },
};

export default meta;

export const Default = {};

export const LongLabel = {
  args: { slots: { default: "Interactive prototype" } },
};
