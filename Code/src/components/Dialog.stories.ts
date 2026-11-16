import { openDialog } from "../../.storybook/open-dialog";
import Dialog from "./Dialog.astro";

const meta = {
  title: "Components/Dialog",
  component: Dialog,
  argTypes: {
    width: { control: "select", options: ["lg", "sm"] },
    surface: { control: "select", options: ["tone", "container"] },
    sheet: { control: "select", options: ["fill", "hug"] },
  },
  args: {
    id: "dialog-story",
    closeLabel: "Close dialog",
    width: "sm",
    surface: "container",
    sheet: "hug",
    slots: {
      default: `<h2 id="dialog-story-title">A short dialog</h2><p>The shell owns the scrim, the close button, and the card.</p>`,
    },
  },
};

export default meta;

export const Default = { play: openDialog };

export const WideTone = {
  args: {
    id: "dialog-story-wide",
    width: "lg",
    surface: "tone",
    class: "tone-teal",
    slots: {
      default: `<h2 id="dialog-story-wide-title">A long read</h2><p>Tone surfaces pick up the brand color passed on the dialog.</p>`,
    },
  },
  play: openDialog,
};
