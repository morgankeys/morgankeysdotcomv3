import Logo from "./Logo.astro";

const names = ["github", "linkedin", "threads", "x", "substack"] as const;

const meta = {
  title: "Components/Logo",
  component: Logo,
  argTypes: { name: { control: "select", options: [...names] } },
  args: { name: "github" },
};

export default meta;

export const Default = {};

export const Github = { args: { name: "github" } };
export const Linkedin = { args: { name: "linkedin" } };
export const Threads = { args: { name: "threads" } };
export const X = { args: { name: "x" } };
export const Substack = { args: { name: "substack" } };
