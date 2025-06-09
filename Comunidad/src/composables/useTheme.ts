import { ref, watch } from 'vue';

type Theme = 'light' | 'dark' | 'system';

const THEME_KEY = 'soundconnect-theme';
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

export function useTheme() {
  const theme = ref<Theme>(localStorage.getItem(THEME_KEY) as Theme || 'system');

  const applyTheme = (newTheme: Theme) => {
    const isDark = 
      newTheme === 'dark' || 
      (newTheme === 'system' && prefersDark.matches);

    document.documentElement.classList.toggle('dark', isDark);
  };

  const setTheme = (newTheme: Theme) => {
    theme.value = newTheme;
    localStorage.setItem(THEME_KEY, newTheme);
    applyTheme(newTheme);
  };

  // Escuchar cambios en las preferencias del sistema
  prefersDark.addEventListener('change', () => {
    if (theme.value === 'system') {
      applyTheme('system');
    }
  });

  // Aplicar tema inicial
  applyTheme(theme.value);

  return {
    theme,
    setTheme
  };
} 