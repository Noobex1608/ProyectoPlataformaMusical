// Declaraciones globales para funciones de navegación entre microfrontends
interface StateManager {
  getState: (key?: string) => any;
  setState: (key: string, value: any) => void;
  setBatch: (updates: any) => void;
  subscribe: (key: string | '*', callback: (value: any) => void) => () => void;
  login: (user: any, token: string, refreshToken?: string) => void;
  logout: () => void;
  setTheme: (theme: string) => void;
  setLanguage: (language: string) => void;
  addNotification: (notification: any) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  navigateTo: (route: string, module?: string) => void;
}

interface ShellServices {
  stateManager: StateManager;
  navigate: (path: string) => void;
  layout: {
    showLoading: () => void;
    hideLoading: () => void;
  };
}

declare global {
  interface Window {
    navigateToArtista?: () => void;
    navigateToArtistaV2?: () => void;
    navigateToMonetizacion?: () => void;
    navigateToMonetizacionV2?: () => void;
    navigateToComunidad?: () => void;
    navigateToHome?: () => void;
    navigateToSPA?: (path: string) => void;
    shellServices: ShellServices;
    monetizacionAPI?: any;
  }
}

export {};
