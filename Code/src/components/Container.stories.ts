import Container from "./Container.astro";

const meta = {
  title: "Components/Container",
  component: Container,
  argTypes: {
    size: { control: "select", options: ["default", "wide", "narrow"] },
  },
  args: {
    size: "default",
    slots: { default: "<p>Content inside the container.</p>" },
  },
};

export default meta;

export const Default = {};

export const Narrow = { args: { size: "narrow" } };

export const Wide = { args: { size: "wide" } };
