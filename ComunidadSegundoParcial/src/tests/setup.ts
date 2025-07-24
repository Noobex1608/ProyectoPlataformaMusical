// src/tests/setup.ts
/**
 * Configuración de pruebas para Vue 3 con Jest
 */

import { jest } from '@jest/globals';
import { createApp } from 'vue';

// Configurar Vue globalmente para @vue/test-utils
(global as any).Vue = { createApp };

// Mock del StateManager para pruebas
const mockStateManager = {
  getState: jest.fn(() => ({
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
      activeModule: 'comunidad',
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
  })),
  setState: jest.fn(),
  setBatch: jest.fn(),
  subscribe: jest.fn(() => jest.fn()), // Mock unsubscribe function
  login: jest.fn(),
  logout: jest.fn(),
  setTheme: jest.fn(),
  setLanguage: jest.fn(),
  addNotification: jest.fn(),
  markNotificationRead: jest.fn(),
  clearNotifications: jest.fn(),
  navigateTo: jest.fn()
};

// Mock de window.shellServices
Object.defineProperty(window, 'shellServices', {
  writable: true,
  value: {
    stateManager: mockStateManager,
    navigate: jest.fn(),
    layout: {
      showLoading: jest.fn(),
      hideLoading: jest.fn(),
    }
  }
});

// Mock del localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  writable: true,
});

// Mock de vue-router
jest.mock('vue-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    go: jest.fn(),
    back: jest.fn(),
    forward: jest.fn()
  }),
  useRoute: () => ({
    path: '/comunidad',
    name: 'comunidad',
    params: {},
    query: {},
    meta: {}
  })
}));

// Mock de Pinia
jest.mock('pinia', () => ({
  createPinia: jest.fn(),
  defineStore: jest.fn(() => () => ({
    // Mock store state
  })),
  storeToRefs: jest.fn(() => ({}))
}));

// Mock de Supabase (si se usa en los composables)
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn()
}));

// Resetear mocks después de cada test
afterEach(() => {
  jest.clearAllMocks();
});
