import { openDialog } from "../../.storybook/open-dialog";
import ContactOverlay from "./ContactOverlay.astro";

const meta = {
  title: "Components/ContactOverlay",
  component: ContactOverlay,
  args: {
    id: "contact-story",
    title: "What do you want to chat about?",
  },
};

export default meta;

export const Default = { play: openDialog };
