import { sampleLogo } from "./story-samples";
import CompanyLabel from "./CompanyLabel.astro";

const meta = {
  title: "Components/CompanyLabel",
  component: CompanyLabel,
  args: { label: "OpenGov", logo: sampleLogo },
};

export default meta;

export const WithLogo = {};

export const TextOnly = { args: { logo: undefined } };
