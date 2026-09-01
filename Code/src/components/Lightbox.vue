<script setup lang="ts">
/**
 * Lightbox.vue
 * 
 * Vue island for image lightbox/gallery. Displays full-size images in an overlay
 * with keyboard navigation (arrow keys, escape) and click-to-close.
 */

import { ref, computed, onMounted, onUnmounted } from 'vue';

export interface LightboxImage {
  src: string;
  alt: string;
  caption?: string;
}

interface Props {
  images: LightboxImage[];
  initialIndex?: number;
}

const props = withDefaults(defineProps<Props>(), {
  initialIndex: 0,
});

const isOpen = ref(false);
const currentIndex = ref(props.initialIndex);

const currentImage = computed(() => props.images[currentIndex.value]);
const hasPrev = computed(() => currentIndex.value > 0);
const hasNext = computed(() => currentIndex.value < props.images.length - 1);

function open(index = 0) {
  currentIndex.value = index;
  isOpen.value = true;
  document.body.style.overflow = 'hidden';
}

function close() {
  isOpen.value = false;
  document.body.style.overflow = '';
}

function prev() {
  if (hasPrev.value) {
    currentIndex.value--;
  }
}

function next() {
  if (hasNext.value) {
    currentIndex.value++;
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (!isOpen.value) return;
  
  if (e.key === 'Escape') {
    close();
  } else if (e.key === 'ArrowLeft') {
    prev();
  } else if (e.key === 'ArrowRight') {
    next();
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
  document.body.style.overflow = '';
});

// Expose open method for parent components
defineExpose({ open });
</script>

<template>
  <div v-if="isOpen" class="lightbox" @click.self="close">
    <div class="lightbox-content">
      <button
        class="lightbox-close"
        type="button"
        aria-label="Close lightbox"
        @click="close"
      >
        <svg
          class="icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <div class="lightbox-image">
        <img :src="currentImage.src" :alt="currentImage.alt" />
      </div>

      <div v-if="currentImage.caption" class="lightbox-caption">
        {{ currentImage.caption }}
      </div>

      <div v-if="images.length > 1" class="lightbox-nav">
        <button
          class="lightbox-nav-button"
          type="button"
          aria-label="Previous image"
          :disabled="!hasPrev"
          @click="prev"
        >
          <svg
            class="icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span class="lightbox-counter">
          {{ currentIndex + 1 }} / {{ images.length }}
        </span>
        <button
          class="lightbox-nav-button"
          type="button"
          aria-label="Next image"
          :disabled="!hasNext"
          @click="next"
        >
          <svg
            class="icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lightbox {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: color-mix(in srgb, var(--md-sys-color-scrim) 90%, transparent);
  backdrop-filter: blur(8px);
}

.lightbox-content {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--md-sys-spacing-body-to-body);
  max-width: 90vw;
  max-height: 90vh;
  padding: var(--md-sys-spacing-body-to-section);
}

.lightbox-close {
  position: absolute;
  top: var(--md-sys-spacing-body-to-body);
  right: var(--md-sys-spacing-body-to-body);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  padding: 0;
  border: none;
  border-radius: var(--md-sys-shape-corner-full);
  background-color: var(--md-sys-color-surface-container);
  color: var(--md-sys-color-on-surface);
  cursor: pointer;
  transition: background-color 0.2s;
}

.lightbox-close:hover {
  background-color: var(--md-sys-color-state-layers-primary-opacity-16);
}

.lightbox-image {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.lightbox-image img {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
  border-radius: var(--md-sys-shape-corner-medium);
}

.lightbox-caption {
  font-family: var(--md-sys-typescale-caption-font);
  font-size: var(--md-sys-typescale-caption-size);
  font-weight: var(--md-sys-typescale-caption-weight);
  line-height: var(--md-sys-typescale-caption-line-height);
  letter-spacing: var(--md-sys-typescale-caption-tracking);
  color: var(--md-sys-color-surface-container);
  text-align: center;
}

.lightbox-nav {
  display: flex;
  align-items: center;
  gap: var(--md-sys-spacing-body-to-subsection);
}

.lightbox-nav-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  padding: 0;
  border: none;
  border-radius: var(--md-sys-shape-corner-full);
  background-color: var(--md-sys-color-surface-container);
  color: var(--md-sys-color-on-surface);
  cursor: pointer;
  transition: background-color 0.2s;
}

.lightbox-nav-button:hover:not(:disabled) {
  background-color: var(--md-sys-color-state-layers-primary-opacity-16);
}

.lightbox-nav-button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.lightbox-counter {
  font-family: var(--md-sys-typescale-label-medium-font);
  font-size: var(--md-sys-typescale-label-medium-size);
  font-weight: var(--md-sys-typescale-label-medium-weight);
  line-height: var(--md-sys-typescale-label-medium-line-height);
  letter-spacing: var(--md-sys-typescale-label-medium-tracking);
  color: var(--md-sys-color-surface-container);
}

.icon {
  width: 1.25rem;
  height: 1.25rem;
}
</style>
