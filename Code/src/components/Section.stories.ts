import Section from "./Section.astro";

const meta = {
  title: "Components/Section",
  component: Section,
  argTypes: {
    as: {
      control: "select",
      options: ["section", "div", "article", "aside", "nav"],
    },
  },
  args: {
    as: "section",
    slots: { default: "<p>A section of the page.</p>" },
  },
};

export default meta;

export const Default = {};

export const Article = {
  args: { as: "article" },
};
