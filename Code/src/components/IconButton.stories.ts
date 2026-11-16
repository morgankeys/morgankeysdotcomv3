import IconButton from "./IconButton.vue";
import { plusIcon } from "../../.storybook/icons";

const variants = ["filled", "tonal", "outlined", "standard"] as const;
const sizes = ["xs", "sm", "md", "lg", "xl"] as const;
const shapes = ["round", "square"] as const;
const widths = ["narrow", "default", "wide"] as const;

const meta = {
  title: "Components/IconButton",
  component: IconButton,
  parameters: { renderer: "vue" },
  argTypes: {
    variant: { control: "select", options: [...variants] },
    size: { control: "select", options: [...sizes] },
    shape: { control: "select", options: [...shapes] },
    width: { control: "select", options: [...widths] },
    as: { control: "select", options: ["button", "a"] },
    disabled: { control: "boolean" },
    toggle: { control: "boolean" },
    selected: { control: "boolean" },
  },
  args: {
    label: "Add",
    variant: "tonal",
    size: "sm",
    shape: "round",
    width: "default",
    as: "button",
    disabled: false,
    toggle: false,
    selected: false,
  },
  render: (args: Record<string, unknown>) => ({
    components: { IconButton },
    setup: () => ({ args, plusIcon }),
    template: `<IconButton v-bind="args"><span v-html="plusIcon" /></IconButton>`,
  }),
};

export default meta;

export const Default = {};

export const Disabled = {
  args: { disabled: true },
};

export const Toggle = {
  args: { toggle: true, selected: true, label: "Selected" },
};

export const Link = {
  args: { as: "a", href: "#icon-button-link", label: "Add link" },
};

export const AllVariants = {
  render: () => ({
    components: { IconButton },
    setup: () => ({ variants, shapes, sizes, widths, plusIcon }),
    template: `
      <div>
        <section v-for="variant in variants" :key="variant" class="specimen__section">
          <h2 class="specimen__heading">{{ variant }}</h2>
          <div v-for="shape in shapes" :key="shape">
            <h3 class="specimen__subheading">{{ shape }}</h3>
            <div v-for="size in sizes" :key="size" class="specimen__row">
              <span class="specimen__label">{{ size }}</span>
              <div class="specimen__grid">
                <IconButton
                  v-for="width in widths"
                  :key="width"
                  :label="variant + ' ' + size + ' ' + shape + ' ' + width"
                  :variant="variant"
                  :size="size"
                  :shape="shape"
                  :width="width"
                ><span v-html="plusIcon" /></IconButton>
              </div>
            </div>
          </div>
        </section>
        <section class="specimen__section">
          <h2 class="specimen__heading">disabled</h2>
          <div class="specimen__grid">
            <IconButton
              v-for="variant in variants"
              :key="variant"
              :label="variant + ' disabled'"
              :variant="variant"
              size="sm"
              disabled
            ><span v-html="plusIcon" /></IconButton>
          </div>
        </section>
      </div>
    `,
  }),
};
