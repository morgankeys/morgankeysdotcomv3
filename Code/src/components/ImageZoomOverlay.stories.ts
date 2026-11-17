import { openDialog } from "../../.storybook/open-dialog";
import ImageZoomOverlay from "./ImageZoomOverlay.astro";

const meta = {
  title: "Components/ImageZoomOverlay",
  component: ImageZoomOverlay,
};

export default meta;

export const Default = { play: openDialog };
