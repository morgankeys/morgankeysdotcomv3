import PullQuote from "./PullQuote.astro";

const quote =
  "If someone has to read the manual, the screen has already failed.";

const meta = {
  title: "Components/PullQuote",
  component: PullQuote,
  argTypes: {
    variant: { control: "select", options: ["rule", "centered"] },
  },
  args: {
    variant: "rule",
    attribution: "Field note, week three",
    slots: { default: quote },
  },
};

export default meta;

export const Default = {};

export const Centered = { args: { variant: "centered" } };

export const QuoteOnly = { args: { attribution: undefined } };
