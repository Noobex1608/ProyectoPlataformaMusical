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
  position: relative;
}

.theme-button {
  padding: 0.5rem;
  border-radius: 9999px;
  transition-property: background-color, color;
  transition-duration: 200ms;
}
.theme-button:hover {
  background-color: #f3f4f6; 
}
.theme-button:dark:hover {
  background-color: #23272f; 
}

.theme-menu {
  position: absolute;
  right: 0;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  width: 12rem;
  background-color: #fff;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
  border: 1px solid #e5e7eb; 
  z-index: 50;
}
.theme-menu:dark {
  background-color: #23272f; 
  border-color: #374151; 
}

.theme-option {
  width: 100%;
  padding-left: 1rem;
  padding-right: 1rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition-property: background-color, color;
  transition-duration: 200ms;
}
.theme-option:hover {
  background-color: #f3f4f6; 
}
.theme-option:dark:hover {
  background-color: #374151; 
}

.theme-option.active {
  color: #3b82f6; 
  background-color: #eff6ff; 
}
.theme-option.active:dark {
  background-color: #374151; 
}

.theme-option i {
  width: 1.25rem;
}
</style> 