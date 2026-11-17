import { ref } from "vue";
import TextField from "./TextField.vue";

const variants = ["outlined", "filled"] as const;

const meta = {
  title: "Components/TextField",
  component: TextField,
  parameters: { renderer: "vue" },
  argTypes: {
    variant: { control: "select", options: [...variants] },
    type: {
      control: "select",
      options: ["text", "email", "tel", "url", "search", "password"],
    },
    multiline: { control: "boolean" },
    required: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: {
    id: "story-field",
    label: "Name",
    modelValue: "",
    variant: "outlined",
    type: "text",
    multiline: false,
    rows: 5,
    supportingText: "Supporting text",
    errorText: "",
    required: false,
    disabled: false,
  },
};

export default meta;

export const Default = {};

export const Filled = { args: { variant: "filled", id: "story-field-filled" } };

export const Error = {
  args: {
    id: "story-field-error",
    label: "Email",
    modelValue: "morgan@",
    errorText: "Please enter a valid email",
  },
};

export const Disabled = {
  args: {
    id: "story-field-disabled",
    modelValue: "Can't edit",
    disabled: true,
  },
};

export const Multiline = {
  args: {
    id: "story-field-multiline",
    label: "Message",
    multiline: true,
    rows: 3,
  },
};

export const States = {
  render: () => ({
    components: { TextField },
    setup: () => {
      const live = ref("");
      return { variants, live };
    },
    template: `
      <div class="story-stack">
        <section v-for="variant in variants" :key="variant" class="specimen__section">
          <h2 class="specimen__heading">{{ variant }}</h2>
          <div class="story-fields">
            <TextField :id="variant + '-empty'" label="Empty" :variant="variant" />
            <TextField :id="variant + '-populated'" label="Populated" model-value="Morgan" supporting-text="Supporting text" :variant="variant" />
            <TextField :id="variant + '-error'" label="Email" model-value="morgan@" error-text="Please enter a valid email" :variant="variant" />
            <TextField :id="variant + '-disabled'" label="Disabled" model-value="Can't edit" disabled :variant="variant" />
            <TextField :id="variant + '-live'" label="Type here" supporting-text="The label floats as you type" :variant="variant" v-model="live" />
            <TextField :id="variant + '-multiline'" label="Message" multiline :rows="3" :variant="variant" />
          </div>
        </section>
      </div>
    `,
  }),
};
