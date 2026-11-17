import MetricGroup from "./MetricGroup.astro";
import { sampleHighlights } from "./story-samples";

const meta = {
  title: "Components/MetricGroup",
  component: MetricGroup,
  args: {
    items: sampleHighlights.map(({ value, detail }) => ({
      value,
      label: detail,
    })),
  },
};

export default meta;

export const Default = {};

export const TwoMetrics = {
  args: { items: meta.args.items.slice(0, 2) },
};
