import StoryFrame from "./StoryFrame.astro";

/**
 * A Controls slider that sets the story frame width. Spread its decorators,
 * argTypes, and args into a story's meta.
 */
export function storyFrame(options?: {
  tile?: boolean;
  min?: number;
  max?: number;
  initial?: number;
}) {
  const min = options?.min ?? 240;
  const max = options?.max ?? 960;
  const initial = options?.initial ?? 640;
  const tile = options?.tile ?? false;

  return {
    decorators: [
      (Story: () => unknown, { args }: { args: { width?: number } }) => ({
        component: StoryFrame,
        props: { width: args.width, tile },
        slots: { default: Story() },
      }),
    ],
    argTypes: {
      width: {
        control: { type: "range", min, max, step: 20 },
        description:
          "Width of this story's frame, in pixels. The image file's own width does not resize the tile.",
        table: { category: "Story" },
      },
    },
    args: {
      width: initial,
    },
  };
}
