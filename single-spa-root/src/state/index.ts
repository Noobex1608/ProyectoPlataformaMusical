// src/state/index.ts
/**
 * Sistema de Estado Global - Punto de entrada principal
 * Exporta todas las utilidades y tipos para el manejo de estado
 */

// Importar desde el archivo JavaScript
import { StateManager, getStateManager } from './StateManager.js';

// Tipos básicos (definidos aquí ya que el StateManager es JS)
export interface GlobalState {
  auth: {
    user: any;
    isAuthenticated: boolean;
    token: string | null;
    refreshToken: string | null;
    lastLoginTime: number | null;
  };
  ui: {
    theme: 'light' | 'dark' | 'auto';
    language: 'es' | 'en';
    primaryColor: string;
    sidebarCollapsed: boolean;
    notifications: Notification[];
  };
  navigation: {
    currentRoute: string;
    activeModule: string;
    breadcrumbs: BreadcrumbItem[];
    lastVisitedRoutes: string[];
  };
  business: {
    selectedArtist: any;
    selectedClub: any;
    monetizationContext: any;
    sharedContent: any[];
  };
  system: {
    onlineStatus: boolean;
    lastSyncTime: number | null;
    pendingActions: PendingAction[];
    errorQueue: ErrorItem[];
  };
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  actions?: NotificationAction[];
}

export interface BreadcrumbItem {
  label: string;
  route: string;
  module: string;
}

export interface PendingAction {
  id: string;
  type: string;
  payload: any;
  retries: number;
  maxRetries: number;
  nextRetry: number;
}

export interface ErrorItem {
  id: string;
  message: string;
  context: string;
  timestamp: number;
  data?: any;
}

export interface NotificationAction {
  label: string;
  action: () => void;
}

export type StateListener<T = any> = (newValue: T, oldValue?: T) => void;

// Re-exportar
export { StateManager, getStateManager };

// Las integraciones se comentan temporalmente hasta resolver TypeScript
// export { createReactHooks } from './integrations/react';
// export { createVuePlugin } from './integrations/vue';
// export { createAngularService } from './integrations/angular';

// Instancia global singleton
export const globalStateManager = getStateManager({
  enableDevtools: typeof process !== 'undefined' ? process.env.NODE_ENV === 'development' : true,
  enableLogging: typeof process !== 'undefined' ? process.env.NODE_ENV === 'development' : false,
  persistence: {
    keys: ['auth', 'ui', 'navigation'],
    strategy: 'localStorage'
  }
});
