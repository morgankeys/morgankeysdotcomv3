<script setup lang="ts">
/**
 * TextField.vue
 *
 * Dune "Text field", Outlined (default) or Filled, single-line or `multiline`.
 * The label rests inside the field and floats up when the field has focus or a
 * value. Supporting text sits under the field; `errorText` replaces it, turns
 * the field to the error color, and sets `aria-invalid`.
 *
 * Outlined cuts a real notch in the border for the floated label (a
 * fieldset + legend, the technique Material Web uses), so it works on any
 * background without painting a patch behind the label.
 *
 * State colors follow Dune: outline on rest, on-surface on hover, primary at
 * the focus indicator's thickness on focus, error when invalid, and on-surface
 * at 38% when disabled.
 *
 * Size is fixed, as in Dune: one line makes a 56px field at every width. The
 * responsive UI roles from ui-md up grow at Medium and Expanded, so spacing
 * here is built from the fixed ones instead: 12px = 3 × ui-xs, 16px = 2 × ui-sm,
 * 24px = 3 × ui-sm.
 *
 * Attributes not declared as props (`name`, `autocomplete`, `inputmode`, ...)
 * land on the <input> or <textarea>, not the wrapper.
 */

import { computed } from "vue";

defineOptions({ inheritAttrs: false });

interface Props {
  /** Required: the field's id, which ties the label and messages to it. */
  id: string;
  label: string;
  modelValue?: string;
  variant?: "outlined" | "filled";
  type?: "text" | "email" | "tel" | "url" | "search" | "password";
  multiline?: boolean;
  rows?: number;
  supportingText?: string;
  /** Shown in place of the supporting text; marks the field invalid. */
  errorText?: string;
  required?: boolean;
  disabled?: boolean;
  autofocus?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: "",
  variant: "outlined",
  type: "text",
  multiline: false,
  rows: 5,
  supportingText: "",
  errorText: "",
  required: false,
  disabled: false,
  autofocus: false,
});

const emit = defineEmits<{ "update:modelValue": [value: string] }>();

const hasError = computed(() => props.errorText.length > 0);
const message = computed(() => props.errorText || props.supportingText);
const messageId = computed(() => `${props.id}-supporting`);

function onInput(event: Event) {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement;
  emit("update:modelValue", target.value);
}
</script>

<template>
  <div
    class="text-field"
    data-component="TextField"
    :data-variant="variant"
    :data-populated="modelValue ? 'true' : undefined"
    :data-error="hasError ? 'true' : undefined"
    :data-disabled="disabled ? 'true' : undefined"
    :data-multiline="multiline ? 'true' : undefined"
  >
    <div class="text-field__field">
      <fieldset
        v-if="variant === 'outlined'"
        class="text-field__outline"
        aria-hidden="true"
      >
        <legend class="text-field__notch">
          <span>{{ label }}</span>
        </legend>
      </fieldset>
      <span v-else class="text-field__container" aria-hidden="true" />

      <label :for="id" class="text-field__label">
        <span>{{ label }}</span>
      </label>

      <textarea
        v-if="multiline"
        :id="id"
        class="text-field__input"
        :value="modelValue"
        :rows="rows"
        :required="required || undefined"
        :disabled="disabled || undefined"
        :autofocus="autofocus || undefined"
        :aria-invalid="hasError || undefined"
        :aria-describedby="message ? messageId : undefined"
        v-bind="$attrs"
        @input="onInput"
      />
      <input
        v-else
        :id="id"
        class="text-field__input"
        :type="type"
        :value="modelValue"
        :required="required || undefined"
        :disabled="disabled || undefined"
        :autofocus="autofocus || undefined"
        :aria-invalid="hasError || undefined"
        :aria-describedby="message ? messageId : undefined"
        v-bind="$attrs"
        @input="onInput"
      />
    </div>

    <p v-if="message" :id="messageId" class="text-field__supporting">
      {{ message }}
    </p>
  </div>
</template>

<style scoped>
.text-field {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.text-field__field {
  position: relative;
  display: flex;
}

/*
 * Input: body-large. A single-line field is pinned at Dune's 56px, like
 * Button's sizes: body-large's 26px line plus 16px padding would make 58.
 */
.text-field__input {
  position: relative;
  z-index: 1;
  box-sizing: border-box;
  flex: 1;
  min-width: 0;
  margin: 0;
  padding: calc(2 * var(--dune-sys-spacing-ui-sm));
  border: none;
  outline: none;
  background: transparent;
  color: var(--dune-sys-color-on-surface);
  caret-color: var(--dune-sys-color-primary);
  font-family: var(--dune-sys-typescale-body-large-font);
  font-size: var(--dune-sys-typescale-body-large-size);
  font-weight: var(--dune-sys-typescale-body-large-weight);
  line-height: var(--dune-sys-typescale-body-large-line-height);
  letter-spacing: var(--dune-sys-typescale-body-large-tracking);
}

input.text-field__input {
  height: 56px;
}

textarea.text-field__input {
  min-height: 120px;
  resize: vertical;
}

/*
 * Label. Resting, it sits on the input's first line in body-large; floated,
 * it shrinks to body-small and rides the top edge (outlined) or the top of the
 * container (filled). The inner span carries the notch's inset so the floated
 * text lines up with the gap in the border.
 */
.text-field__label {
  position: absolute;
  top: calc(2 * var(--dune-sys-spacing-ui-sm));
  left: 0;
  z-index: 2;
  max-width: 100%;
  padding-inline-start: calc(2 * var(--dune-sys-spacing-ui-sm));
  overflow: hidden;
  color: var(--dune-sys-color-on-surface-variant);
  font-family: var(--dune-sys-typescale-body-large-font);
  font-size: var(--dune-sys-typescale-body-large-size);
  font-weight: var(--dune-sys-typescale-body-large-weight);
  line-height: var(--dune-sys-typescale-body-large-line-height);
  letter-spacing: var(--dune-sys-typescale-body-large-tracking);
  white-space: nowrap;
  text-overflow: ellipsis;
  pointer-events: none;
  transition:
    top 0.15s ease,
    left 0.15s ease,
    translate 0.15s ease,
    font-size 0.15s ease,
    line-height 0.15s ease,
    padding 0.15s ease,
    color 0.15s ease;
}

.text-field__label > span {
  padding-inline-start: 0;
  transition: padding 0.15s ease;
}

.text-field__field:focus-within .text-field__label,
.text-field[data-populated] .text-field__label {
  font-size: var(--dune-sys-typescale-body-small-size);
  line-height: var(--dune-sys-typescale-body-small-line-height);
  letter-spacing: var(--dune-sys-typescale-body-small-tracking);
}

/* ---- Outlined ---------------------------------------------------------- */

/*
 * The border. Raised by half a body-small line so the legend's middle, and
 * with it the notch, sits on the field's top edge.
 */
.text-field__outline {
  position: absolute;
  inset: -0.5lh 0 0;
  margin: 0;
  padding: 0 calc(3 * var(--dune-sys-spacing-ui-xs));
  border: 1px solid var(--dune-sys-color-outline);
  border-radius: var(--dune-sys-shape-corner-extra-small);
  font-family: var(--dune-sys-typescale-body-small-font);
  font-size: var(--dune-sys-typescale-body-small-size);
  line-height: var(--dune-sys-typescale-body-small-line-height);
  letter-spacing: var(--dune-sys-typescale-body-small-tracking);
  pointer-events: none;
  transition: border-color 0.15s ease;
}

/* Invisible copy of the label that sizes the gap; collapsed until floated. */
.text-field__notch {
  max-width: 0.01px;
  padding: 0;
  visibility: hidden;
  white-space: nowrap;
  transition: max-width 0.05s ease;
}

.text-field__notch > span {
  display: inline-block;
  padding-inline: var(--dune-sys-spacing-ui-xs);
}

.text-field[data-variant="outlined"]
  .text-field__field:focus-within
  .text-field__notch,
.text-field[data-variant="outlined"][data-populated] .text-field__notch {
  max-width: 100%;
  transition-duration: 0.1s;
}

.text-field[data-variant="outlined"]
  .text-field__field:focus-within
  .text-field__label,
.text-field[data-variant="outlined"][data-populated] .text-field__label {
  top: 0;
  translate: 0 -50%;
  padding-inline-start: calc(3 * var(--dune-sys-spacing-ui-xs));
}

/*
 * The border width pushes the notch inward, so the floated label moves in by
 * the same amount: 1px at rest, the focus indicator's thickness on focus.
 */
.text-field[data-variant="outlined"][data-populated] .text-field__label {
  left: 1px;
}

.text-field[data-variant="outlined"]
  .text-field__field:focus-within
  .text-field__label {
  left: var(--dune-sys-state-focus-indicator-thickness);
}

.text-field[data-variant="outlined"]
  .text-field__field:focus-within
  .text-field__label
  > span,
.text-field[data-variant="outlined"][data-populated] .text-field__label > span {
  padding-inline-start: var(--dune-sys-spacing-ui-xs);
}

.text-field[data-variant="outlined"]
  .text-field__field:hover
  .text-field__outline {
  border-color: var(--dune-sys-color-on-surface);
}

.text-field[data-variant="outlined"]
  .text-field__field:focus-within
  .text-field__outline {
  border-color: var(--dune-sys-color-primary);
  border-width: var(--dune-sys-state-focus-indicator-thickness);
}

/* ---- Filled ------------------------------------------------------------ */

.text-field__container {
  position: absolute;
  inset: 0;
  border-radius: var(--dune-sys-shape-corner-extra-small)
    var(--dune-sys-shape-corner-extra-small) var(--dune-sys-shape-corner-none)
    var(--dune-sys-shape-corner-none);
  border-bottom: 1px solid var(--dune-sys-color-on-surface-variant);
  background-color: var(--dune-sys-color-surface-container-highest);
  pointer-events: none;
  transition: border-color 0.15s ease;
}

/* Filled leaves room above the input for the floated label. */
.text-field[data-variant="filled"] .text-field__input {
  padding-block: calc(3 * var(--dune-sys-spacing-ui-sm))
    var(--dune-sys-spacing-ui-sm);
}

.text-field[data-variant="filled"] .text-field__label {
  top: calc(2 * var(--dune-sys-spacing-ui-sm));
}

.text-field[data-variant="filled"]
  .text-field__field:focus-within
  .text-field__label,
.text-field[data-variant="filled"][data-populated] .text-field__label {
  top: var(--dune-sys-spacing-ui-sm);
}

.text-field[data-variant="filled"]
  .text-field__field:hover
  .text-field__container {
  border-bottom-color: var(--dune-sys-color-on-surface);
  background-image: linear-gradient(
    var(--dune-sys-color-state-layers-on-surface-opacity-08),
    var(--dune-sys-color-state-layers-on-surface-opacity-08)
  );
}

.text-field[data-variant="filled"]
  .text-field__field:focus-within
  .text-field__container {
  border-bottom: var(--dune-sys-state-focus-indicator-thickness) solid
    var(--dune-sys-color-primary);
}

/* ---- Focus, error, disabled -------------------------------------------- */

.text-field__field:focus-within .text-field__label {
  color: var(--dune-sys-color-primary);
}

.text-field[data-error] .text-field__label,
.text-field[data-error] .text-field__field:focus-within .text-field__label {
  color: var(--dune-sys-color-error);
}

.text-field[data-error] .text-field__input {
  caret-color: var(--dune-sys-color-error);
}

.text-field[data-error] .text-field__outline,
.text-field[data-error] .text-field__field:hover .text-field__outline {
  border-color: var(--dune-sys-color-error);
}

.text-field[data-error] .text-field__container,
.text-field[data-error] .text-field__field:hover .text-field__container {
  border-bottom-color: var(--dune-sys-color-error);
}

.text-field[data-disabled] .text-field__field {
  opacity: 0.38;
}

.text-field[data-disabled] .text-field__input,
.text-field[data-disabled] .text-field__label {
  color: var(--dune-sys-color-on-surface);
  cursor: not-allowed;
}

.text-field[data-disabled] .text-field__outline,
.text-field[data-disabled] .text-field__field:hover .text-field__outline {
  border-color: var(--dune-sys-color-on-surface);
}

.text-field[data-disabled] .text-field__container,
.text-field[data-disabled] .text-field__field:hover .text-field__container {
  border-bottom-color: var(--dune-sys-color-on-surface);
  background-image: none;
}

/* ---- Supporting text --------------------------------------------------- */

.text-field__supporting {
  margin: 0;
  padding: var(--dune-sys-spacing-ui-xs) calc(2 * var(--dune-sys-spacing-ui-sm))
    0;
  color: var(--dune-sys-color-on-surface-variant);
  font-family: var(--dune-sys-typescale-body-small-font);
  font-size: var(--dune-sys-typescale-body-small-size);
  font-weight: var(--dune-sys-typescale-body-small-weight);
  line-height: var(--dune-sys-typescale-body-small-line-height);
  letter-spacing: var(--dune-sys-typescale-body-small-tracking);
}

.text-field[data-error] .text-field__supporting {
  color: var(--dune-sys-color-error);
}

@media (prefers-reduced-motion: reduce) {
  .text-field__label,
  .text-field__label > span,
  .text-field__outline,
  .text-field__notch,
  .text-field__container {
    transition: none;
  }
}
</style>
