import { sampleLogo } from "../story-samples";
import EndMark from "./EndMark.astro";

const meta = {
  title: "Components/Case study/EndMark",
  component: EndMark,
  args: { logo: sampleLogo, label: "OpenGov 2024" },
};

export default meta;

export const Default = {};

export const LogoOnly = { args: { label: undefined } };
