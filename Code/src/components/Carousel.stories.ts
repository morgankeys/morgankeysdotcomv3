import Carousel from "./Carousel.vue";

const meta = {
  title: "Components/Carousel",
  component: Carousel,
  parameters: { renderer: "vue" },
  render: () => ({
    components: { Carousel },
    template: `
      <Carousel>
        <div class="story-slide"><p class="title">First</p></div>
        <div class="story-slide"><p class="title">Second</p></div>
        <div class="story-slide"><p class="title">Third</p></div>
      </Carousel>
    `,
  }),
};

export default meta;

export const Default = {};

export const OneSlide = {
  render: () => ({
    components: { Carousel },
    template: `<Carousel><div class="story-slide"><p class="title">Only</p></div></Carousel>`,
  }),
};
