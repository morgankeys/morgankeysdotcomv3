import Divider from "./Divider.astro";

const meta = {
  title: "Components/Divider",
  component: Divider,
  argTypes: {
    inset: { control: "select", options: ["none", "start", "middle"] },
    vertical: { control: "boolean" },
  },
  args: {
    inset: "none",
    vertical: false,
  },
};

export default meta;

export const Default = {};

export const Start = { args: { inset: "start" } };

export const Middle = { args: { inset: "middle" } };

export const Vertical = {
  args: { vertical: true },
  decorators: [
    (Story: () => string) =>
      `<div class="story-split"><span>Left</span>${Story()}<span>Right</span></div>`,
  ],
};
