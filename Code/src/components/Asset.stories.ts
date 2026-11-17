import landscapeUrl from "../assets/unsplash-landscape.jpg?url";
import landscapeFile from "../assets/unsplash-landscape.jpg";
import { storyFrame } from "../../.storybook/story-frame";
import Asset from "./Asset.astro";

// David Marcu, Unsplash (photo-1469474968028-56623f02e42e). Story sample only.
// The file import's src is an absolute /@fs path, which 404s from the dev
// server. The base URL is the file Storybook actually serves.
const landscape = { ...landscapeFile, src: landscapeUrl };
const frame = storyFrame({ tile: true, initial: 640 });

const meta = {
  title: "Components/Asset",
  component: Asset,
  decorators: frame.decorators,
  argTypes: {
    ...frame.argTypes,
    // ImageMetadata is the file, not the tile size. Its width field does not
    // resize what is on screen, so it is not a control.
    image: { control: false },
    fit: { control: "select", options: ["cover", "contain"] },
    elevation: { control: "select", options: ["container", "image"] },
    zoomable: { control: "boolean" },
  },
  args: {
    ...frame.args,
    image: landscape,
    alt: "Sunlight across a forested mountain ridge",
    fit: "cover",
    elevation: "container",
    zoomable: true,
  },
};

export default meta;

export const Default = {};

export const Contain = { args: { fit: "contain" } };

export const Zoomable = { args: { zoomable: true } };

export const NotZoomable = { args: { zoomable: false } };
