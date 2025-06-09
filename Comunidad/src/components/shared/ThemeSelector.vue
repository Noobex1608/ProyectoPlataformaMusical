<template>
  <div class="theme-selector">
    <button
      @click="toggleMenu"
      class="theme-button"
      :aria-label="'Tema actual: ' + theme"
    >
      <i class="fas" :class="themeIcon"></i>
    </button>

    <div
      v-if="isOpen"
      class="theme-menu animate-fade-in"
      @click.stop
    >
      <button
        class="theme-option"
        :class="{ active: theme === 'light' }"
        @click="selectTheme('light')"
      >
        <i class="fas fa-sun"></i>
        <span>Claro</span>
      </button>

      <button
        class="theme-option"
        :class="{ active: theme === 'dark' }"
        @click="selectTheme('dark')"
      >
        <i class="fas fa-moon"></i>
        <span>Oscuro</span>
      </button>

      <button
        class="theme-option"
        :class="{ active: theme === 'system' }"
        @click="selectTheme('system')"
      >
        <i class="fas fa-desktop"></i>
        <span>Sistema</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useTheme } from '@/composables/useTheme';

const { theme, setTheme } = useTheme();
const isOpen = ref(false);

const themeIcon = computed(() => {
  switch (theme.value) {
    case 'light':
      return 'fa-sun';
    case 'dark':
      return 'fa-moon';
    default:
      return 'fa-desktop';
  }
});

const toggleMenu = () => {
  isOpen.value = !isOpen.value;
};

const selectTheme = (newTheme: 'light' | 'dark' | 'system') => {
  setTheme(newTheme);
  isOpen.value = false;
};

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (!target.closest('.theme-selector')) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.theme-selector {
  @apply relative;
}

.theme-button {
  @apply p-2 rounded-full transition-colors duration-200
         hover:bg-gray-100 dark:hover:bg-dark-200;
}

.theme-menu {
  @apply absolute right-0 mt-2 py-2 w-48 bg-white dark:bg-dark-200
         rounded-lg shadow-lg border border-gray-200 dark:border-dark-300
         z-50;
}

.theme-option {
  @apply w-full px-4 py-2 text-left flex items-center gap-3
         hover:bg-gray-100 dark:hover:bg-dark-300 transition-colors duration-200;
}

.theme-option.active {
  @apply text-primary-500 bg-primary-50 dark:bg-dark-300;
}

.theme-option i {
  @apply w-5;
}
</style> 