import Prose from "./Prose.astro";

const meta = {
  title: "Components/Prose",
  component: Prose,
  args: {
    slots: {
      default: `<h2>A short section</h2><p>Prose sets the vertical rhythm between headings and paragraphs.</p><p>A second paragraph sits a body step below the first.</p>`,
    },
  },
};

export default meta;

export const Default = {};
