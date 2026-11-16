/**
 * React port of src/components/Button.vue for design-system exports.
 *
 * Markup, class names, and data attributes mirror the Vue component exactly,
 * because the stylesheet is not ported: the exporter lifts it straight out of
 * Button.vue. Change styling there; change this file only when the Vue
 * template's structure or props change.
 */
import type { HTMLAttributes, JSX, ReactNode } from "react";

export interface ButtonProps extends HTMLAttributes<HTMLElement> {
  variant?: "filled" | "tonal" | "outlined" | "elevated" | "text";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  shape?: "round" | "square";
  /** Render a link styled as a button. Requires `href`. */
  as?: "button" | "a";
  href?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  /** Leading icon. Pass an inline SVG; it inherits size and color. */
  icon?: ReactNode;
}

export function Button({
  variant = "filled",
  size = "sm",
  shape = "round",
  as = "button",
  href,
  type = "button",
  disabled = false,
  icon,
  className,
  children,
  ...rest
}: ButtonProps): JSX.Element {
  const shared = {
    ...rest,
    className: className ? `button ${className}` : "button",
    "data-component": "Button",
    "data-variant": variant,
    "data-size": size,
    "data-shape": shape,
  };

  const content = (
    <>
      <span className="button__state" aria-hidden="true">
        <span className="button__ripple" />
      </span>
      {(size === "xs" || size === "sm") && (
        <span className="button__touch-target" aria-hidden="true" />
      )}
      <span className="button__content">
        {icon ? <span className="button__icon">{icon}</span> : null}
        <span className="button__label">{children}</span>
      </span>
    </>
  );

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
