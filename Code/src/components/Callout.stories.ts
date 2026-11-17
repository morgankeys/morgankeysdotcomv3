import Callout from "./Callout.astro";

const meta = {
  title: "Components/Callout",
  component: Callout,
  args: {
    heading: "A constraint worth stating",
    slots: {
      default:
        "<p>For asides and constraints, not for warnings. The heading is optional.</p>",
    },
  },
};

export default meta;

export const Default = {};

export const BodyOnly = { args: { heading: undefined } };
