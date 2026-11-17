import FabMenu from "./FabMenu.vue";
import { plusIcon } from "../../.storybook/icons";

const meta = {
  title: "Components/FabMenu",
  component: FabMenu,
  parameters: { renderer: "vue" },
  argTypes: {
    color: { control: "select", options: ["primary", "secondary", "tertiary"] },
  },
  args: {
    label: "Add",
    closeLabel: "Close menu",
    color: "primary",
    items: [
      { label: "Note", value: "note" },
      { label: "Photo", value: "photo" },
      { label: "Site", href: "#fab-menu-link" },
    ],
  },
  render: (args: Record<string, unknown>) => ({
    components: { FabMenu },
    setup: () => ({ args, plusIcon }),
    template: `
      <div class="story-room">
        <FabMenu v-bind="args">
          <span v-html="plusIcon" />
          <template #icon><span v-html="plusIcon" /></template>
        </FabMenu>
      </div>
    `,
  }),
};

export default meta;

export const Default = {};

export const Secondary = {
  args: { color: "secondary", label: "Share" },
};
