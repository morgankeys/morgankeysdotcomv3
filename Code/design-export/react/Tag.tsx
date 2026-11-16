/**
 * React port of src/components/Tag.astro for design-system exports.
 *
 * The stylesheet is not ported: the exporter lifts it straight out of
 * Tag.astro. Change styling there.
 */
import type { HTMLAttributes, JSX } from "react";

export type TagProps = HTMLAttributes<HTMLSpanElement>;

export function Tag({ className, children, ...rest }: TagProps): JSX.Element {
  return (
    <span {...rest} className={className ? `tag ${className}` : "tag"}>
      {children}
    </span>
  );
}
