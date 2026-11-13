/**
 * React port of src/components/IconButton.vue for design-system exports.
 *
 * Markup, class names, and data attributes mirror the Vue component exactly,
 * because the stylesheet is not ported: the exporter lifts it straight out of
 * IconButton.vue. Change styling there; change this file only when the Vue
 * template's structure or props change.
 */
import type { HTMLAttributes, JSX } from "react";

export interface IconButtonProps extends HTMLAttributes<HTMLElement> {
  /** Accessible name. Required, because the button has no visible text. */
  label: string;
  variant?: "filled" | "tonal" | "outlined" | "standard";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  shape?: "round" | "square";
  width?: "narrow" | "default" | "wide";
  /** Render a link styled as an icon button. Requires `href`. */
  as?: "button" | "a";
  href?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

export function IconButton({
  label,
  variant = "tonal",
  size = "sm",
  shape = "round",
  width = "default",
  as = "button",
  href,
  type = "button",
  disabled = false,
  className,
  children,
  ...rest
}: IconButtonProps): JSX.Element {
  const shared = {
    ...rest,
    className: className ? `icon-button ${className}` : "icon-button",
    "data-component": "IconButton",
    "data-variant": variant,
    "data-size": size,
    "data-shape": shape,
    "data-width": width,
    "aria-label": label,
  };

  const content = <span className="icon-button__container">{children}</span>;

  if (as === "a") {
    return (
      <a
        {...shared}
        href={disabled ? undefined : href}
        aria-disabled={disabled || undefined}
      >
        {content}
      </a>
    );
  }

  return (
    <button {...shared} type={type} disabled={disabled}>
      {content}
    </button>
  );
}
