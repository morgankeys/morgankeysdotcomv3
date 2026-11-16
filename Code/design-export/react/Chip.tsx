/**
 * React port of src/components/Chip.vue for design-system exports.
 *
 * Markup, class names, and data attributes mirror the Vue component exactly,
 * because the stylesheet is not ported: the exporter lifts it straight out of
 * Chip.vue. Change styling there; change this file only when the Vue
 * template's structure or props change.
 */
import type { HTMLAttributes, JSX, ReactNode } from "react";

export interface ChipProps extends HTMLAttributes<HTMLElement> {
  variant?: "assist" | "filter";
  /** `span` is a static label; `button` and `a` are interactive. */
  as?: "span" | "button" | "a";
  href?: string;
  elevated?: boolean;
  /** Filter chips only. */
  selected?: boolean;
  disabled?: boolean;
  /** Leading 18px icon; a selected filter chip shows a check mark instead. */
  icon?: ReactNode;
}

const check = (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M9.55 18 3.85 12.3l1.43-1.43 4.27 4.28 9.17-9.18 1.43 1.43z" />
  </svg>
);

export function Chip({
  variant = "assist",
  as = "span",
  href,
  elevated = false,
  selected = false,
  disabled = false,
  icon,
  className,
  children,
  ...rest
}: ChipProps): JSX.Element {
  const interactive = as !== "span";
  const isSelected = variant === "filter" && selected;
  const leading = isSelected ? check : icon;
  const shared = {
    ...rest,
    className: className ? `chip ${className}` : "chip",
    "data-component": "Chip",
    "data-variant": variant,
    "data-elevated": elevated ? "true" : undefined,
    "data-selected": isSelected ? "true" : undefined,
    "data-interactive": interactive ? "true" : undefined,
  };
  const content = (
    <>
      {leading ? (
        <span className="chip__icon" aria-hidden="true">
          {leading}
        </span>
      ) : null}
      <span className="chip__label">{children}</span>
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
  if (as === "button") {
    return (
      <button
        {...shared}
        type="button"
        disabled={disabled}
        aria-pressed={variant === "filter" ? selected : undefined}
      >
        {content}
      </button>
    );
  }
  return <span {...shared}>{content}</span>;
}
