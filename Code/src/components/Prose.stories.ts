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

export const Blockquote = {
  args: {
    slots: {
      default: `<p>Copy before the quote sets it up.</p><blockquote><p>A bare blockquote in Prose matches the pull quote's rule.</p></blockquote><p>Copy after the quote picks the thread back up.</p>`,
    },
  },
};
