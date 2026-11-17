import DraftNote from "./DraftNote.astro";

const meta = {
  title: "Components/Case study/DraftNote",
  component: DraftNote,
  args: {
    label: "Open item",
    slots: { default: "Confirm the launch date before this ships." },
  },
};

export default meta;

export const Default = {};

export const Confirm = { args: { label: "Confirm" } };
