import Button from "./Button.vue";
import { starIcon } from "../../.storybook/icons";

const variants = ["filled", "tonal", "outlined", "elevated", "text"] as const;
const sizes = ["xs", "sm", "md", "lg", "xl"] as const;
const shapes = ["round", "square"] as const;

const meta = {
  title: "Components/Button",
  component: Button,
  parameters: { renderer: "vue" },
  argTypes: {
    variant: { control: "select", options: [...variants] },
    size: { control: "select", options: [...sizes] },
    shape: { control: "select", options: [...shapes] },
    as: { control: "select", options: ["button", "a"] },
    disabled: { control: "boolean" },
  },
  args: {
    variant: "filled",
    size: "sm",
    shape: "round",
    as: "button",
    disabled: false,
  },
  render: (args: Record<string, unknown>) => ({
    components: { Button },
    setup: () => ({ args, starIcon }),
    template: `<Button v-bind="args"><template #icon><span v-html="starIcon" /></template>Label</Button>`,
  }),
};

export default meta;

export const Default = {};

export const LabelOnly = {
  render: (args: Record<string, unknown>) => ({
    components: { Button },
    setup: () => ({ args }),
    template: `<Button v-bind="args">Label</Button>`,
  }),
};

export const Disabled = {
  args: { disabled: true },
};

export const Link = {
  args: { as: "a", href: "#button-link" },
};

export const AllVariants = {
  render: () => ({
    components: { Button },
    setup: () => ({ variants, shapes, sizes, starIcon }),
    template: `
      <div>
        <section v-for="variant in variants" :key="variant" class="specimen__section">
          <h2 class="specimen__heading">{{ variant }}</h2>
          <div v-for="shape in shapes" :key="shape">
            <h3 class="specimen__subheading">{{ shape }}</h3>
            <div v-for="size in sizes" :key="size" class="specimen__row">
              <span class="specimen__label">{{ size }}</span>
              <Button :variant="variant" :size="size" :shape="shape">
                <template #icon><span v-html="starIcon" /></template>
                Label
              </Button>
            </div>
          </div>
        </section>
      </div>
    `,
  }),
};
