import IconButton from "./IconButton.vue";
import Tooltip from "./Tooltip.vue";
import { plusIcon } from "../../.storybook/icons";

const meta = {
  title: "Components/Tooltip",
  component: Tooltip,
  parameters: { renderer: "vue" },
  argTypes: {
    align: { control: "select", options: ["start", "center", "end"] },
  },
  args: {
    text: "Add",
    align: "center",
  },
  render: (args: Record<string, unknown>) => ({
    components: { Tooltip, IconButton },
    setup: () => ({ args, plusIcon }),
    template: `
      <div class="story-room">
        <Tooltip v-bind="args">
          <IconButton label="Add" variant="tonal"><span v-html="plusIcon" /></IconButton>
        </Tooltip>
      </div>
    `,
  }),
};

export default meta;

export const Default = {};

export const Alignments = {
  render: () => ({
    components: { Tooltip, IconButton },
    setup: () => ({ plusIcon, aligns: ["start", "center", "end"] }),
    template: `
      <div class="story-inline story-room">
        <Tooltip v-for="align in aligns" :key="align" :text="'Aligned ' + align" :align="align">
          <IconButton :label="'Tooltip aligned ' + align" variant="tonal">
            <span v-html="plusIcon" />
          </IconButton>
        </Tooltip>
      </div>
    `,
  }),
};
