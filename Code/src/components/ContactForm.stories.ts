import ContactForm from "./ContactForm.vue";

const meta = {
  title: "Components/ContactForm",
  component: ContactForm,
  parameters: { renderer: "vue" },
  args: {
    title: "What do you want to chat about?",
    compact: false,
    autofocus: false,
    showDone: false,
    idPrefix: "story",
  },
};

export default meta;

export const Default = {};

export const Compact = {
  args: { compact: true, title: "Say hello" },
};
