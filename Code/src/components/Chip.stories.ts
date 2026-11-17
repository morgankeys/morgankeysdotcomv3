import Chip from "./Chip.vue";
import { starIcon } from "../../.storybook/icons";

const meta = {
  title: "Components/Chip",
  component: Chip,
  parameters: { renderer: "vue" },
  argTypes: {
    variant: { control: "select", options: ["assist", "filter"] },
    as: { control: "select", options: ["span", "button", "a"] },
    elevated: { control: "boolean" },
    selected: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: {
    variant: "assist",
    as: "span",
    elevated: false,
    selected: false,
    disabled: false,
  },
  render: (args: Record<string, unknown>) => ({
    components: { Chip },
    setup: () => ({ args }),
    template: `<Chip v-bind="args">Design systems</Chip>`,
  }),
};

export default meta;

export const Default = {};

export const Filter = {
  args: { as: "button", variant: "filter", selected: true },
};

export const AllVariants = {
  render: () => ({
    components: { Chip },
    setup: () => ({ starIcon }),
    template: `
      <div class="story-stack">
        <section class="specimen__section">
          <h2 class="specimen__heading">Static</h2>
          <div class="specimen__grid">
            <Chip>Design systems</Chip>
            <Chip elevated>Prototyping</Chip>
            <Chip><template #icon><span v-html="starIcon" /></template>With icon</Chip>
          </div>
        </section>
        <section class="specimen__section">
          <h2 class="specimen__heading">Assist</h2>
          <div class="specimen__grid">
            <Chip as="button">Outlined</Chip>
            <Chip as="button" elevated>Elevated</Chip>
            <Chip as="a" href="#chip-link"><template #icon><span v-html="starIcon" /></template>Link</Chip>
            <Chip as="button" disabled>Disabled</Chip>
          </div>
        </section>
        <section class="specimen__section">
          <h2 class="specimen__heading">Filter</h2>
          <div class="specimen__grid">
            <Chip as="button" variant="filter">Unselected</Chip>
            <Chip as="button" variant="filter" selected>Selected</Chip>
            <Chip as="button" variant="filter" elevated>Elevated</Chip>
            <Chip as="button" variant="filter" selected disabled>Disabled</Chip>
          </div>
        </section>
      </div>
    `,
  }),
};
