<script setup lang="ts">
/**
 * ContactForm.vue
 * 
 * Vue island for contact form submission via Web3Forms.
 * Provides name, email, and message fields with validation.
 */

import { ref } from 'vue';

// Create a Web3Forms access key for morgan.keys@gmail.com at https://web3forms.com
// Messages are delivered to that address
const ACCESS_KEY = 'REPLACE_WITH_WEB3FORMS_ACCESS_KEY';

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

const name = ref('');
const email = ref('');
const message = ref('');
const status = ref<FormStatus>('idle');
const errorMessage = ref('');

const nameError = ref('');
const emailError = ref('');
const messageError = ref('');

function validateEmail(value: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

function validate(): boolean {
  let isValid = true;
  
  // Reset errors
  nameError.value = '';
  emailError.value = '';
  messageError.value = '';
  
  // Name validation
  if (!name.value.trim()) {
    nameError.value = 'Name is required';
    isValid = false;
  }
  
  // Email validation
  if (!email.value.trim()) {
    emailError.value = 'Email is required';
    isValid = false;
  } else if (!validateEmail(email.value)) {
    emailError.value = 'Please enter a valid email';
    isValid = false;
  }
  
  // Message validation
  if (!message.value.trim()) {
    messageError.value = 'Message is required';
    isValid = false;
  }
  
  return isValid;
}

async function handleSubmit() {
  if (!validate()) return;
  
  status.value = 'submitting';
  errorMessage.value = '';
  
  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        access_key: ACCESS_KEY,
        name: name.value,
        email: email.value,
        message: message.value,
        subject: 'New message from morgankeys.com',
        from_name: name.value,
      }),
    });
    
    const result = await response.json();
    
    if (result.success) {
      status.value = 'success';
      name.value = '';
      email.value = '';
      message.value = '';
    } else {
      status.value = 'error';
      errorMessage.value = result.message || 'Something went wrong. Please try again.';
    }
  } catch {
    status.value = 'error';
    errorMessage.value = 'Failed to send message. Please try again.';
  }
}
</script>

<template>
  <form class="contact-form" @submit.prevent="handleSubmit">
    <div class="field">
      <label for="name" class="label">Name</label>
      <input
        id="name"
        v-model="name"
        type="text"
        class="input"
        :class="{ 'input--error': nameError }"
        placeholder="Name"
        required
        :disabled="status === 'submitting'"
      />
      <span v-if="nameError" class="error-text">{{ nameError }}</span>
    </div>

    <div class="field">
      <label for="email" class="label">Email</label>
      <input
        id="email"
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
      <label for="message" class="label">Message</label>
      <textarea
        id="message"
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
      <button
        type="submit"
        class="submit-button"
        :disabled="status === 'submitting'"
      >
        {{ status === 'submitting' ? 'Sending...' : 'Send' }}
      </button>
    </div>

    <div v-if="status === 'success'" class="success-message">
      Thanks — I'll be in touch.
    </div>

    <div v-if="status === 'error'" class="error-message">
      {{ errorMessage }}
    </div>
  </form>
</template>

<style scoped>
.contact-form {
  display: flex;
  flex-direction: column;
  gap: var(--md-sys-spacing-body-to-subsection);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
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
  padding: 1rem;
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

.submit-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.625rem 1.5rem;
  border: none;
  border-radius: var(--md-sys-shape-corner-full);
  background-color: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
  font-family: var(--md-sys-typescale-label-large-font);
  font-size: var(--md-sys-typescale-label-large-size);
  font-weight: var(--md-sys-typescale-label-large-weight);
  line-height: var(--md-sys-typescale-label-large-line-height);
  letter-spacing: var(--md-sys-typescale-label-large-tracking);
  cursor: pointer;
  transition: all 0.2s;
}

.submit-button:hover:not(:disabled) {
  background-color: var(--md-sys-color-primary);
  box-shadow: 0 1px 3px var(--md-sys-color-shadow);
}

.submit-button:active:not(:disabled) {
  background-color: var(--md-sys-color-primary);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.success-message {
  padding: 1rem;
  border-radius: var(--md-sys-shape-corner-medium);
  background-color: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
  font-family: var(--md-sys-typescale-body-large-font);
  font-size: var(--md-sys-typescale-body-large-size);
  font-weight: var(--md-sys-typescale-body-large-weight);
  line-height: var(--md-sys-typescale-body-large-line-height);
  letter-spacing: var(--md-sys-typescale-body-large-tracking);
}

.error-message {
  padding: 1rem;
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
