import { ref } from "vue";
import SegmentedButton from "./SegmentedButton.vue";
import { starIcon } from "../../.storybook/icons";

const options = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
];

const meta = {
  title: "Components/SegmentedButton",
  component: SegmentedButton,
  parameters: { renderer: "vue" },
  args: {
    label: "Range",
    options,
    modelValue: "week",
    iconOnly: false,
  },
  render: (args: Record<string, unknown>) => ({
    components: { SegmentedButton },
    setup() {
      const value = ref(args.modelValue);
      return { args, value, starIcon };
    },
    template: `
      <SegmentedButton
        v-bind="args"
        :model-value="value"
        @update:model-value="value = $event"
      >
        <template #icon><span v-html="starIcon" /></template>
      </SegmentedButton>
    `,
  }),
};

export default meta;

export const Default = {};

export const IconOnly = {
  args: { iconOnly: true },
};
