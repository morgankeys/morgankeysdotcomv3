import landscapeUrl from "../assets/unsplash-landscape.jpg?url";
import landscapeFile from "../assets/unsplash-landscape.jpg";
import Asset from "./Asset.astro";

// David Marcu, Unsplash (photo-1469474968028-56623f02e42e). Story sample only.
// The file import's src is an absolute /@fs path, which 404s from the dev
// server. The base URL is the file Storybook actually serves.
const landscape = { ...landscapeFile, src: landscapeUrl };

const meta = {
  title: "Components/Asset",
  component: Asset,
  argTypes: {
    fit: { control: "select", options: ["cover", "contain"] },
    elevation: { control: "select", options: ["container", "image"] },
    zoomable: { control: "boolean" },
  },
  args: {
    image: landscape,
    alt: "Sunlight across a forested mountain ridge",
    fit: "cover",
    elevation: "container",
    zoomable: false,
  },
};

export default meta;

export const Default = {};

export const Contain = { args: { fit: "contain" } };

export const Zoomable = { args: { zoomable: true } };
