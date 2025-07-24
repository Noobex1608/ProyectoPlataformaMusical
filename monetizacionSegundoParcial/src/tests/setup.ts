// src/tests/setup.ts
/**
 * Configuración de pruebas para Angular con Jest
 */

import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';
import '@testing-library/jest-dom';

// Configurar el entorno de pruebas con Zone.js
setupZoneTestEnv();

// Mock del StateManager para pruebas
const mockStateManager = {
  getState: () => ({
    auth: {
      user: null,
      isAuthenticated: false,
      token: null,
      refreshToken: null,
      lastLoginTime: null
    },
    ui: {
      theme: 'light',
      language: 'es',
      primaryColor: '#348e91',
      sidebarCollapsed: false,
      notifications: []
    },
    navigation: {
      currentRoute: '/',
      activeModule: 'monetizacion',
      breadcrumbs: [],
      lastVisitedRoutes: []
    },
    business: {
      selectedArtist: null,
      selectedClub: null,
      monetizationContext: null,
      sharedContent: []
    },
    system: {
      onlineStatus: true,
      lastSyncTime: null,
      pendingActions: [],
      errorQueue: []
    }
  }),
  setState: () => {},
  setBatch: () => {},
  subscribe: () => () => {}, // Mock unsubscribe function
  login: () => {},
  logout: () => {},
  setTheme: () => {},
  setLanguage: () => {},
  addNotification: () => {},
  markNotificationRead: () => {},
  clearNotifications: () => {},
  navigateTo: () => {}
};

// Mock de window.shellServices
Object.defineProperty(window, 'shellServices', {
  writable: true,
  value: {
    stateManager: mockStateManager,
    navigate: () => {},
    layout: {
      showLoading: () => {},
      hideLoading: () => {},
    }
  }
});

// Mock del localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
  },
  writable: true,
});

// Mock de console para tests más limpios
global.console = {
  ...console,
  log: () => {},
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
};
