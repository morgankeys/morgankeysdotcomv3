<script setup lang="ts">
/**
 * ThemeToggle.vue
 * 
 * Vue island for toggling between light/dark themes. Flips data-theme on :root,
 * persists preference to localStorage, respects prefers-color-scheme, and avoids FOUC
 * (flash of unstyled content) via inline script in BaseLayout.
 */

import { ref, onMounted } from 'vue';

const theme = ref<'light' | 'dark'>('light');

function toggleTheme() {
  const newTheme = theme.value === 'light' ? 'dark' : 'light';
  theme.value = newTheme;
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
}

onMounted(() => {
  // Sync with current theme (set by inline script in BaseLayout)
  const current = document.documentElement.getAttribute('data-theme') as 'light' | 'dark';
  theme.value = current || 'light';
});
</script>

<template>
  <button
    class="theme-toggle"
    type="button"
    :aria-label="`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`"
    @click="toggleTheme"
  >
    <svg
      v-if="theme === 'light'"
      class="icon"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
    <svg
      v-else
      class="icon"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  </button>
</template>

<style scoped>
.theme-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  padding: 0;
  border: none;
  border-radius: var(--md-sys-shape-corner-full);
  background-color: transparent;
  color: var(--md-sys-color-on-surface-variant);
  cursor: pointer;
  transition: background-color 0.2s;
}

.theme-toggle:hover {
  background-color: var(--md-sys-color-state-layers-primary-opacity-08);
  color: var(--md-sys-color-primary);
}

.theme-toggle:active {
  background-color: var(--md-sys-color-state-layers-primary-opacity-10);
}

.icon {
  width: 1.25rem;
  height: 1.25rem;
}
</style>
