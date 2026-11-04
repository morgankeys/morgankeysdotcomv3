/**
 * zoom.ts
 *
 * The full-resolution rendition a zoomable image opens with. A tile's own
 * `srcset` tops out at the size it's shown at in the page (900px for Asset),
 * which looks soft once the zoom overlay scales it up. Figure and Asset spread
 * these attributes onto their trigger; image-zoom.ts only fetches the file when
 * the overlay opens, so the page itself never downloads it. The dimensions let
 * the overlay size the image before that file arrives, so the smaller preview
 * it shows first takes the same box and nothing jumps when it swaps in.
 */
import { getImage } from "astro:assets";
import type { ImageMetadata } from "astro";

/**
 * Widest zoom rendition. Above this the file gets heavy for little visible gain
 * even at the deepest zoom step. Narrower sources are never upscaled.
 */
export const ZOOM_MAX_WIDTH = 2880;

export interface ZoomAttributes {
  "data-zoom-src": string;
  "data-zoom-width": number;
  "data-zoom-height": number;
}

export async function zoomAttributes(
  image: ImageMetadata,
): Promise<ZoomAttributes> {
  const width = Math.min(image.width, ZOOM_MAX_WIDTH);
  const height = Math.round((image.height * width) / image.width);
  const rendition = await getImage({
    src: image,
    width,
    format: "webp",
    quality: 85,
  });
  return {
    "data-zoom-src": rendition.src,
    "data-zoom-width": width,
    "data-zoom-height": height,
  };
}
