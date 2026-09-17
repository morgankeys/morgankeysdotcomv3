/**
 * crop.ts
 *
 * Figma image-crop transforms. Figma lets a fill be zoomed and panned inside its
 * frame, which `object-fit: cover` cannot reproduce (cover always centers). We
 * express the crop the same way Figma does — as the scaled image's size and
 * offset in percentages of the containing frame — and apply it to an absolutely
 * positioned `<img>`.
 */

export interface ImageCrop {
  /** Scaled image width, as a percentage of the frame width. */
  width: number;
  /** Scaled image height, as a percentage of the frame height. */
  height: number;
  /** Horizontal offset from the frame's left edge, as a percentage of its width. */
  left: number;
  /** Vertical offset from the frame's top edge, as a percentage of its height. */
  top: number;
}

/**
 * Inline style for a cropped image. Returns `undefined` when there is no crop,
 * so the image falls back to whatever the stylesheet specifies (a `cover` fill).
 *
 * Only `width`/`height`/`left`/`top` are set — never `right`/`bottom` — so the
 * declared size always wins over the frame's edges.
 */
export function cropStyle(crop?: ImageCrop): string | undefined {
  if (!crop) return undefined;

  return `width:${crop.width}%;height:${crop.height}%;left:${crop.left}%;top:${crop.top}%`;
}

/**
 * Width in CSS pixels at which a cropped image actually renders, given the
 * frame width it sits in. Use it to size a responsive `srcset`: a zoomed crop
 * needs a larger source than the frame it fills.
 */
export function croppedRenderWidth(frameWidth: number, crop?: ImageCrop): number {
  return Math.round((frameWidth * (crop?.width ?? 100)) / 100);
}
