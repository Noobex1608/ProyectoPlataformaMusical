// src/state/__tests__/StateManager.test.js
/**
 * Pruebas unitarias para el StateManager
 */

import { StateManager, getStateManager } from '../StateManager.js';

describe('StateManager', () => {
  let stateManager;

  beforeEach(() => {
    // Limpiar localStorage antes de cada test
    localStorage.clear();
    
    // Crear nueva instancia para cada test
    stateManager = new StateManager({
      enableLogging: false,
      enableDevtools: false
    });
  });

  afterEach(() => {
    // Limpiar después de cada test
    if (stateManager && stateManager.destroy) {
      stateManager.destroy();
    }
    localStorage.clear();
  });

  describe('Inicialización', () => {
    test('debe crear una instancia con estado inicial correcto', () => {
      const state = stateManager.getState();
      
      expect(state).toHaveProperty('auth');
      expect(state).toHaveProperty('ui');
      expect(state).toHaveProperty('navigation');
      expect(state).toHaveProperty('business');
      expect(state).toHaveProperty('system');
      
      expect(state.auth.isAuthenticated).toBe(false);
      expect(state.ui.theme).toBe('light');
      expect(state.ui.language).toBe('es');
    });

    test('debe configurar listeners correctamente', () => {
      expect(stateManager.listeners).toBeInstanceOf(Map);
      expect(stateManager.globalListeners).toBeInstanceOf(Set);
    });
  });

  describe('Gestión de Estado', () => {
    test('debe actualizar una slice del estado correctamente', () => {
      const newTheme = 'dark';
      stateManager.setState('ui', { theme: newTheme });
      
      const state = stateManager.getState();
      expect(state.ui.theme).toBe(newTheme);
    });

    test('debe mantener otras propiedades intactas al actualizar', () => {
      const originalLanguage = stateManager.getState().ui.language;
      
      stateManager.setState('ui', { theme: 'dark' });
      
      const state = stateManager.getState();
      expect(state.ui.language).toBe(originalLanguage);
      expect(state.ui.theme).toBe('dark');
    });

    test('debe obtener una slice específica del estado', () => {
      const authState = stateManager.getState('auth');
      
      expect(authState).toHaveProperty('user');
      expect(authState).toHaveProperty('isAuthenticated');
      expect(authState).toHaveProperty('token');
    });
  });

  describe('Suscripciones', () => {
    test('debe permitir suscribirse a cambios globales', () => {
      const callback = jest.fn();
      
      const unsubscribe = stateManager.subscribe('*', callback);
      
      stateManager.setState('ui', { theme: 'dark' });
      
      expect(callback).toHaveBeenCalled();
      expect(typeof unsubscribe).toBe('function');
    });

    test('debe permitir suscribirse a cambios de una slice específica', () => {
      const callback = jest.fn();
      
      stateManager.subscribe('ui', callback);
      
      stateManager.setState('ui', { theme: 'dark' });
      stateManager.setState('auth', { user: { name: 'Test' } });
      
      expect(callback).toHaveBeenCalledTimes(1);
    });

    test('debe permitir desuscribirse correctamente', () => {
      const callback = jest.fn();
      
      const unsubscribe = stateManager.subscribe('ui', callback);
      
      stateManager.setState('ui', { theme: 'dark' });
      expect(callback).toHaveBeenCalledTimes(1);
      
      unsubscribe();
      
      stateManager.setState('ui', { theme: 'light' });
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('Autenticación', () => {
    test('debe realizar login correctamente', () => {
      const user = { id: '123', name: 'Test User' };
      const token = 'test-token';
      
      stateManager.login(user, token);
      
      const authState = stateManager.getState('auth');
      expect(authState.isAuthenticated).toBe(true);
      expect(authState.user).toEqual(user);
      expect(authState.token).toBe(token);
    });

    test('debe realizar logout correctamente', () => {
      // Primero hacer login
      stateManager.login({ id: '123' }, 'token');
      expect(stateManager.getState('auth').isAuthenticated).toBe(true);
      
      // Luego logout
      stateManager.logout();
      
      const authState = stateManager.getState('auth');
      expect(authState.isAuthenticated).toBe(false);
      expect(authState.user).toBeNull();
      expect(authState.token).toBeNull();
    });
  });

  describe('UI y Notificaciones', () => {
    test('debe cambiar tema correctamente', () => {
      stateManager.setTheme('dark');
      
      expect(stateManager.getState('ui').theme).toBe('dark');
    });

    test('debe cambiar idioma correctamente', () => {
      stateManager.setLanguage('en');
      
      expect(stateManager.getState('ui').language).toBe('en');
    });

    test('debe agregar notificaciones correctamente', () => {
      const notification = {
        type: 'success',
        title: 'Test',
        message: 'Test message'
      };
      
      stateManager.addNotification(notification);
      
      const notifications = stateManager.getState('ui').notifications;
      expect(notifications).toHaveLength(1);
      expect(notifications[0]).toMatchObject(notification);
      expect(notifications[0]).toHaveProperty('id');
      expect(notifications[0]).toHaveProperty('timestamp');
    });

    test('debe marcar notificaciones como leídas', () => {
      const notification = {
        type: 'info',
        title: 'Test',
        message: 'Test message'
      };
      
      stateManager.addNotification(notification);
      const notifications = stateManager.getState('ui').notifications;
      const notificationId = notifications[0].id;
      
      expect(notifications[0].read).toBe(false);
      
      stateManager.markNotificationRead(notificationId);
      
      const updatedNotifications = stateManager.getState('ui').notifications;
      expect(updatedNotifications[0].read).toBe(true);
    });

    test('debe limpiar todas las notificaciones', () => {
      stateManager.addNotification({ type: 'info', title: 'Test 1', message: 'Message 1' });
      stateManager.addNotification({ type: 'info', title: 'Test 2', message: 'Message 2' });
      
      expect(stateManager.getState('ui').notifications).toHaveLength(2);
      
      stateManager.clearNotifications();
      
      expect(stateManager.getState('ui').notifications).toHaveLength(0);
    });
  });

  describe('Navegación', () => {
    test('debe actualizar la ruta actual', () => {
      const route = '/test-route';
      const module = 'test-module';
      
      stateManager.navigateTo(route, module);
      
      const navState = stateManager.getState('navigation');
      expect(navState.currentRoute).toBe(route);
      expect(navState.activeModule).toBe(module);
    });

    test('debe mantener historial de rutas visitadas', () => {
      stateManager.navigateTo('/route1', 'module1');
      stateManager.navigateTo('/route2', 'module2');
      stateManager.navigateTo('/route3', 'module3');
      
      const navState = stateManager.getState('navigation');
      expect(navState.lastVisitedRoutes).toContain('/route1');
      expect(navState.lastVisitedRoutes).toContain('/route2');
    });
  });

  describe('Actualizaciones en lote', () => {
    test('debe realizar actualizaciones en lote correctamente', () => {
      const updates = {
        ui: { theme: 'dark', language: 'en' },
        auth: { user: { name: 'Test User' } }
      };
      
      stateManager.setBatch(updates);
      
      const state = stateManager.getState();
      expect(state.ui.theme).toBe('dark');
      expect(state.ui.language).toBe('en');
      expect(state.auth.user.name).toBe('Test User');
    });

    test('debe notificar cambios una sola vez en actualizaciones en lote', () => {
      const callback = jest.fn();
      stateManager.subscribe('*', callback);
      
      const updates = {
        ui: { theme: 'dark' },
        auth: { user: { name: 'Test' } }
      };
      
      stateManager.setBatch(updates);
      
      // Debe llamarse solo una vez para el lote completo
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('getStateManager singleton', () => {
    test('debe devolver la misma instancia en llamadas múltiples', () => {
      const instance1 = getStateManager();
      const instance2 = getStateManager();
      
      expect(instance1).toBe(instance2);
    });

    test('debe usar configuración personalizada en primera llamada', () => {
      const config = { enableLogging: true };
      const instance = getStateManager(config);
      
      expect(instance.config.enableLogging).toBe(true);
    });
  });

  describe('Persistencia', () => {
    test('debe guardar datos en localStorage según configuración', () => {
      // Crear StateManager con persistencia habilitada
      const persistentManager = new StateManager({
        persistence: {
          keys: ['auth', 'ui'],
          strategy: 'localStorage'
        }
      });
      
      persistentManager.login({ id: '123' }, 'token');
      
      // Verificar que se guardó en localStorage
      expect(localStorage.setItem).toHaveBeenCalled();
    });
  });
});
