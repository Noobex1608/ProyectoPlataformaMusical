<template>
  <div 
    class="skeleton-loader"
    :class="[type, { animate: !noAnimate }]"
    :style="computedStyle"
  ></div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  type?: 'text' | 'title' | 'circle' | 'rectangle' | 'custom';
  width?: string | number;
  height?: string | number;
  noAnimate?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  width: undefined,
  height: undefined,
  noAnimate: false
});

const computedStyle = computed(() => {
  const style: Record<string, string> = {};
  
  if (props.width) {
    style.width = typeof props.width === 'number' ? `${props.width}px` : props.width;
  }
  
  if (props.height) {
    style.height = typeof props.height === 'number' ? `${props.height}px` : props.height;
  }
  
  return style;
});
</script>

<style scoped>
.skeleton-loader {
  @apply bg-gray-200 dark:bg-dark-300 rounded overflow-hidden relative;
}

.skeleton-loader.animate::after {
  content: '';
  @apply absolute inset-0 -translate-x-full;
  background-image: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0,
    rgba(255, 255, 255, 0.2) 20%,
    rgba(255, 255, 255, 0.5) 60%,
    rgba(255, 255, 255, 0)
  );
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}

.skeleton-loader.text {
  @apply h-4 w-3/4;
}

.skeleton-loader.title {
  @apply h-6 w-1/2;
}

.skeleton-loader.circle {
  @apply rounded-full h-12 w-12;
}

.skeleton-loader.rectangle {
  @apply h-32 w-full;
}

.dark .skeleton-loader.animate::after {
  background-image: linear-gradient(
    90deg,
    rgba(0, 0, 0, 0) 0,
    rgba(0, 0, 0, 0.2) 20%,
    rgba(0, 0, 0, 0.5) 60%,
    rgba(0, 0, 0, 0)
  );
}
</style> 