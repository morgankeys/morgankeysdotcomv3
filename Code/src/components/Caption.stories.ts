import Caption from "./Caption.astro";

const meta = {
  title: "Components/Caption",
  component: Caption,
  argTypes: {
    as: { control: "select", options: ["figcaption", "p"] },
    color: { control: "select", options: ["inherit", "muted"] },
    stacked: { control: "boolean" },
  },
  args: {
    as: "p",
    color: "muted",
    stacked: false,
    slots: { default: "The first slide of the deck." },
  },
};

export default meta;

export const Default = {};

export const Stacked = {
  args: {
    stacked: true,
    slots: {
      default:
        "<span>The first slide of the deck.</span><span>Morgan Keys</span>",
    },
  },
};
