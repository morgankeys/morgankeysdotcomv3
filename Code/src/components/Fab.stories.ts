import Fab from "./Fab.vue";
import { plusIcon } from "../../.storybook/icons";

const colors = [
  "primary-container",
  "secondary-container",
  "tertiary-container",
  "primary",
  "secondary",
  "tertiary",
] as const;
const sizes = ["sm", "md", "lg"] as const;

const meta = {
  title: "Components/Fab",
  component: Fab,
  parameters: { renderer: "vue" },
  argTypes: {
    color: { control: "select", options: [...colors] },
    size: { control: "select", options: [...sizes] },
    extended: { control: "boolean" },
    as: { control: "select", options: ["button", "a"] },
  },
  args: {
    label: "Create",
    size: "sm",
    color: "primary-container",
    extended: false,
    as: "button",
  },
  render: (args: Record<string, unknown>) => ({
    components: { Fab },
    setup: () => ({ args, plusIcon }),
    template: `<Fab v-bind="args"><span v-html="plusIcon" /></Fab>`,
  }),
};

export default meta;

export const Default = {};

export const Extended = {
  args: { extended: true, label: "Create" },
};

export const Link = {
  args: { as: "a", href: "#fab-link", extended: true, label: "Write" },
};

export const AllVariants = {
  render: () => ({
    components: { Fab },
    setup: () => ({ colors, sizes, plusIcon }),
    template: `
      <div>
        <section v-for="size in sizes" :key="size" class="specimen__section">
          <h2 class="specimen__heading">{{ size }}</h2>
          <div class="specimen__grid">
            <Fab
              v-for="color in colors"
              :key="color"
              :label="color"
              :size="size"
              :color="color"
            ><span v-html="plusIcon" /></Fab>
          </div>
          <div class="specimen__grid">
            <Fab
              v-for="color in colors"
              :key="color + '-extended'"
              :label="color"
              :size="size"
              :color="color"
              extended
            ><span v-html="plusIcon" /></Fab>
          </div>
        </section>
      </div>
    `,
  }),
};
