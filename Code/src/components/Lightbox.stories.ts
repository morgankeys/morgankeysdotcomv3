import { ref } from "vue";
import photoUrl from "../assets/placeholder-raster.jpg?url";
import Lightbox from "./Lightbox.vue";

const images = [
  { src: photoUrl, alt: "A sample photograph", caption: "First frame" },
  { src: photoUrl, alt: "A sample photograph", caption: "Second frame" },
];

const meta = {
  title: "Components/Lightbox",
  component: Lightbox,
  parameters: { renderer: "vue" },
  args: { images, initialIndex: 0 },
  render: (args: Record<string, unknown>) => ({
    components: { Lightbox },
    setup() {
      const box = ref<{ open: (index?: number) => void } | null>(null);
      return { args, box };
    },
    template: `
      <div>
        <button type="button" @click="box?.open(0)">Open lightbox</button>
        <Lightbox ref="box" v-bind="args" />
      </div>
    `,
  }),
};

export default meta;

export const Default = {};
