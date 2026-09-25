<script setup lang="ts">
/**
 * ContactForm.vue
 *
 * Vue island for contact form submission via Web3Forms.
 * Provides name, email, and message fields with validation.
 */

import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import Button from "./Button.vue";

const props = withDefaults(
  defineProps<{
    /** Prefix for field ids so two forms on one page stay unique. */
    idPrefix?: string;
    /** Drop the page-footer margin when the form sits in a tight container. */
    compact?: boolean;
    /** Focus the name field when the surrounding dialog opens. */
    autofocus?: boolean;
    /** After a send, show Done. Reopening the overlay swaps it for a reset. */
    showDone?: boolean;
    /** Prompt shown above the fields. Removed after a successful send. */
    title?: string;
  }>(),
  {
    idPrefix: "",
    compact: false,
    autofocus: false,
    showDone: false,
    title: "",
  },
);

function fieldId(name: string): string {
  return props.idPrefix ? `${props.idPrefix}-${name}` : name;
}

// Public by design — Web3Forms access keys are meant to be exposed to the
// browser. Set via PUBLIC_WEB3FORMS_ACCESS_KEY (see Code/.env.example).
const ACCESS_KEY = import.meta.env.PUBLIC_WEB3FORMS_ACCESS_KEY ?? "";
const isConfigured = computed(() => ACCESS_KEY.length > 0);

type FormStatus = "idle" | "submitting" | "success" | "error";

const name = ref("");
const email = ref("");
const message = ref("");
const botcheck = ref(false);
const status = ref<FormStatus>("idle");
const errorMessage = ref("");

const nameError = ref("");
const emailError = ref("");
const messageError = ref("");

/** Overlay was closed after a send, so the next open offers a reset. */
const dismissed = ref(false);
const root = ref<HTMLElement | null>(null);
let dialog: HTMLDialogElement | null = null;

function onDialogClose(): void {
  if (props.showDone && status.value === "success") dismissed.value = true;
}

function contactSection(): HTMLElement | null {
  const section = root.value?.closest("#contact");
  return section instanceof HTMLElement ? section : null;
}

function rememberFormHeight(): void {
  const section = contactSection();
  const block = section?.querySelector(".contact-message");
  if (!section || !(block instanceof HTMLElement)) return;
  section.style.setProperty("--contact-form-height", `${block.offsetHeight}px`);
}

function resetForm(): void {
  status.value = "idle";
  dismissed.value = false;
  errorMessage.value = "";
  nameError.value = "";
  emailError.value = "";
  messageError.value = "";
  contactSection()?.style.removeProperty("--contact-form-height");
}

onMounted(() => {
  dialog = root.value?.closest("dialog") ?? null;
  dialog?.addEventListener("close", onDialogClose);
});

onUnmounted(() => {
  dialog?.removeEventListener("close", onDialogClose);
  const section = contactSection();
  section?.removeAttribute("data-sent");
  section?.style.removeProperty("--contact-form-height");
});

watch(status, (value) => {
  const section = root.value?.closest("#contact");
  if (!(section instanceof HTMLElement)) return;
  section.toggleAttribute("data-sent", value === "success");
});

function validateEmail(value: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

function validate(): boolean {
  let isValid = true;

  // Reset errors
  nameError.value = "";
  emailError.value = "";
  messageError.value = "";

  // Name validation
  if (!name.value.trim()) {
    nameError.value = "Name is required";
    isValid = false;
  }

  // Email validation
  if (!email.value.trim()) {
    emailError.value = "Email is required";
    isValid = false;
  } else if (!validateEmail(email.value)) {
    emailError.value = "Please enter a valid email";
    isValid = false;
  }

  // Message validation
  if (!message.value.trim()) {
    messageError.value = "Message is required";
    isValid = false;
  }

  return isValid;
}

async function handleSubmit() {
  if (!validate()) return;

  status.value = "submitting";
  errorMessage.value = "";

  try {
    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        access_key: ACCESS_KEY,
        name: name.value,
        email: email.value,
        message: message.value,
        from_name: name.value,
        botcheck: botcheck.value,
      }),
    });

    const result = await response.json();

    if (result.success) {
      if (!props.showDone) rememberFormHeight();
      status.value = "success";
      dismissed.value = false;
      name.value = "";
      email.value = "";
      message.value = "";
    } else {
      status.value = "error";
      errorMessage.value =
        result.message || "Something went wrong. Please try again.";
    }
  } catch {
    status.value = "error";
    errorMessage.value = "Failed to send message. Please try again.";
  }
}
</script>

<template>
  <div ref="root">
  <h2 v-if="title && status !== 'success'" :id="fieldId('title')" class="title">
    {{ title }}
  </h2>
  <div
    v-if="status === 'success' && showDone"
    class="success"
    :class="{ 'success--compact': compact }"
  >
    <p :id="title ? fieldId('title') : undefined" class="success-message">
      Thanks, I'll be in touch.
    </p>
    <div v-if="!dismissed" data-overlay-close>
      <Button type="button" size="md">Done</Button>
    </div>
    <Button v-else type="button" size="md" @click="resetForm">
      Send another message
    </Button>
  </div>
  <Teleport v-if="status === 'success' && !showDone" to="#contact-thanks">
    <div class="success success--compact">
      <p class="success-message">Thanks, I'll be in touch.</p>
    </div>
  </Teleport>
  <Teleport v-if="status === 'success' && !showDone" to="#contact-again">
    <div class="page-resend">
      <Button type="button" variant="outlined" size="sm" @click="resetForm">
        Send another message
      </Button>
    </div>
  </Teleport>
  <p
    v-if="status !== 'success' && !isConfigured"
    class="unconfigured-message"
    :class="{ 'unconfigured-message--compact': compact }"
  >
    This contact form isn't set up yet — please reach out another way for now.
  </p>
  <form
    v-else-if="status !== 'success'"
    class="contact-form"
    :class="{ 'contact-form--compact': compact }"
    @submit.prevent="handleSubmit"
  >
    <div class="field botcheck-field">
      <label :for="fieldId('botcheck')" class="label">Leave this field blank</label>
      <input
        :id="fieldId('botcheck')"
        v-model="botcheck"
        type="checkbox"
        name="botcheck"
        tabindex="-1"
        autocomplete="off"
      />
    </div>

    <div class="field">
      <label :for="fieldId('name')" class="label">Name</label>
      <input
        :id="fieldId('name')"
        v-model="name"
        type="text"
        class="input"
        :class="{ 'input--error': nameError }"
        placeholder="Name"
        required
        :autofocus="autofocus || undefined"
        :disabled="status === 'submitting'"
      />
      <span v-if="nameError" class="error-text">{{ nameError }}</span>
    </div>

    <div class="field">
      <label :for="fieldId('email')" class="label">Email</label>
      <input
        :id="fieldId('email')"
        v-model="email"
        type="email"
        class="input"
        :class="{ 'input--error': emailError }"
        placeholder="Email"
        required
        :disabled="status === 'submitting'"
      />
      <span v-if="emailError" class="error-text">{{ emailError }}</span>
    </div>

    <div class="field">
      <label :for="fieldId('message')" class="label">Message</label>
      <textarea
        :id="fieldId('message')"
        v-model="message"
        class="input input--textarea"
        :class="{ 'input--error': messageError }"
        placeholder="Message"
        rows="5"
        required
        :disabled="status === 'submitting'"
      />
      <span v-if="messageError" class="error-text">{{ messageError }}</span>
    </div>

    <div class="actions">
      <Button type="submit" :disabled="status === 'submitting'">
        {{ status === "submitting" ? "Sending..." : "Send" }}
      </Button>
    </div>

    <div v-if="status === 'error'" class="error-message">
      {{ errorMessage }}
    </div>
  </form>
  </div>
</template>

<style scoped>
.unconfigured-message {
  font-family: var(--md-sys-typescale-body-large-font);
  font-size: var(--md-sys-typescale-body-large-size);
  font-weight: var(--md-sys-typescale-body-large-weight);
  line-height: var(--md-sys-typescale-body-large-line-height);
  letter-spacing: var(--md-sys-typescale-body-large-tracking);
  color: var(--md-sys-color-on-surface-variant);
  margin-bottom: var(--md-sys-spacing-ui-5xl);
}

.unconfigured-message--compact {
  margin-bottom: 0;
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: var(--md-sys-spacing-ui-md);
  margin-bottom: var(--md-sys-spacing-ui-5xl);
}

.contact-form--compact {
  margin-bottom: 0;
}

.field {
  display: flex;
  flex-direction: column;
  gap: var(--md-sys-spacing-subsection-to-body);
}

.botcheck-field {
  display: none;
}

.label {
  font-family: var(--md-sys-typescale-label-large-font);
  font-size: var(--md-sys-typescale-label-large-size);
  font-weight: var(--md-sys-typescale-label-large-weight);
  line-height: var(--md-sys-typescale-label-large-line-height);
  letter-spacing: var(--md-sys-typescale-label-large-tracking);
  color: var(--md-sys-color-on-surface);
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  white-space: nowrap;
  width: 1px;
}

.input {
  padding: var(--md-sys-spacing-title-to-standfirst);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: var(--md-sys-shape-corner-medium);
  background-color: var(--md-sys-color-surface-container-low);
  color: var(--md-sys-color-on-surface);
  font-family: var(--md-sys-typescale-body-large-font);
  font-size: var(--md-sys-typescale-body-large-size);
  font-weight: var(--md-sys-typescale-body-large-weight);
  line-height: var(--md-sys-typescale-body-large-line-height);
  letter-spacing: var(--md-sys-typescale-body-large-tracking);
  transition: border-color 0.2s;
}

.input::placeholder {
  color: var(--md-sys-color-on-surface-variant);
}

.input:focus {
  outline: none;
  border-color: var(--md-sys-color-primary);
}

.input--error {
  border-color: var(--md-sys-color-error);
}

.input--textarea {
  resize: vertical;
  min-height: 120px;
}

.input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-text {
  font-family: var(--md-sys-typescale-body-large-font);
  font-size: var(--md-sys-typescale-body-large-size);
  font-weight: var(--md-sys-typescale-body-large-weight);
  line-height: var(--md-sys-typescale-body-large-line-height);
  letter-spacing: var(--md-sys-typescale-body-large-tracking);
  color: var(--md-sys-color-error);
}

.actions {
  display: flex;
  justify-content: flex-end;
}

.title {
  margin: 0 0 var(--md-sys-spacing-ui-xl);
  text-align: center;
  color: var(--md-sys-color-on-surface);
  font-family: var(--md-sys-typescale-headline-small-font);
  font-size: var(--md-sys-typescale-headline-small-size);
  font-weight: var(--md-sys-typescale-headline-small-weight-emphasized);
  line-height: var(--md-sys-typescale-headline-small-line-height);
  letter-spacing: var(--md-sys-typescale-headline-small-tracking);
}

.success {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--md-sys-spacing-ui-3xl);
  margin-bottom: var(--md-sys-spacing-ui-5xl);
  text-align: center;
}

.success--compact {
  margin-bottom: 0;
}

.page-resend {
  display: flex;
  justify-content: center;
  margin-bottom: var(--md-sys-spacing-ui-5xl);
}

.success-message {
  margin: 0;
  color: var(--md-sys-color-on-surface);
  font-family: var(--md-sys-typescale-headline-medium-font);
  font-size: var(--md-sys-typescale-headline-large-size);
  font-weight: var(--md-sys-typescale-headline-medium-weight-emphasized);
  line-height: var(--md-sys-typescale-headline-medium-line-height);
  letter-spacing: var(--md-sys-typescale-headline-medium-tracking);
}

.error-message {
  padding: var(--md-sys-spacing-title-to-standfirst);
  border-radius: var(--md-sys-shape-corner-medium);
  background-color: var(--md-sys-color-error-container);
  color: var(--md-sys-color-on-error-container);
  font-family: var(--md-sys-typescale-body-large-font);
  font-size: var(--md-sys-typescale-body-large-size);
  font-weight: var(--md-sys-typescale-body-large-weight);
  line-height: var(--md-sys-typescale-body-large-line-height);
  letter-spacing: var(--md-sys-typescale-body-large-tracking);
}
</style>
