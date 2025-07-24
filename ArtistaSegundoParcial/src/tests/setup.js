// src/tests/setup.js
/**
 * Configuración de pruebas para el microfrontend Artista
 */

import '@testing-library/jest-dom';

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
      activeModule: 'artista',
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
  subscribe: jest.fn(() => () => {}), // Mock unsubscribe function
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
global.window.shellServices = {
  stateManager: mockStateManager,
  navigate: jest.fn(),
  layout: {
    showLoading: jest.fn(),
    hideLoading: jest.fn(),
  }
};

// Mock del localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock de Supabase (si se usa en los componentes)
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signIn: jest.fn(),
      signOut: jest.fn(),
      getUser: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } }
      }))
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null })
    }))
  }))
}));

// Mock de react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useLocation: () => ({
    pathname: '/artista',
    search: '',
    hash: '',
    state: null
  }),
  useParams: () => ({})
}));

// Resetear mocks después de cada test
afterEach(() => {
  jest.clearAllMocks();
});
