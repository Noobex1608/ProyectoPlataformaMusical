// src/composables/__tests__/newStateIntegration.test.ts
/**
 * Pruebas básicas para los composables de integración con el estado global - Vue 3
 */

describe('Composables de integración con estado global', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('debe tener window.shellServices disponible en el setup', () => {
    expect((window as any).shellServices).toBeDefined();
    expect((window as any).shellServices.stateManager).toBeDefined();
  });

  test('debe poder acceder al StateManager desde window', () => {
    const stateManager = (window as any).shellServices.stateManager;
    
    expect(stateManager.getState).toBeDefined();
    expect(stateManager.setState).toBeDefined();
    expect(stateManager.subscribe).toBeDefined();
    expect(typeof stateManager.getState).toBe('function');
    expect(typeof stateManager.setState).toBe('function');
    expect(typeof stateManager.subscribe).toBe('function');
  });

  test('StateManager debe retornar estado inicial', () => {
    const stateManager = (window as any).shellServices.stateManager;
    const state = stateManager.getState();
    
    expect(state).toBeDefined();
    expect(state.auth).toBeDefined();
    expect(state.ui).toBeDefined();
    expect(state.navigation).toBeDefined();
    expect(state.business).toBeDefined();
    expect(state.system).toBeDefined();
  });

  test('StateManager debe permitir suscripciones', () => {
    const stateManager = (window as any).shellServices.stateManager;
    const callback = jest.fn();
    
    const unsubscribe = stateManager.subscribe('auth', callback);
    
    expect(typeof unsubscribe).toBe('function');
    expect(callback).not.toHaveBeenCalled();
    
    // Cleanup
    unsubscribe();
  });

  test('StateManager debe permitir actualizaciones de estado', () => {
    const stateManager = (window as any).shellServices.stateManager;
    
    // Test setState
    expect(() => {
      stateManager.setState('auth', { isAuthenticated: true });
    }).not.toThrow();
    
    // Test setBatch
    expect(() => {
      stateManager.setBatch({ 
        auth: { isAuthenticated: false },
        ui: { theme: 'dark' }
      });
    }).not.toThrow();
  });

  test('StateManager debe tener métodos de autenticación', () => {
    const stateManager = (window as any).shellServices.stateManager;
    
    expect(stateManager.login).toBeDefined();
    expect(stateManager.logout).toBeDefined();
    expect(typeof stateManager.login).toBe('function');
    expect(typeof stateManager.logout).toBe('function');
    
    // Test login
    expect(() => {
      stateManager.login({ id: 1, name: 'Test User' }, 'test-token');
    }).not.toThrow();
    
    // Test logout
    expect(() => {
      stateManager.logout();
    }).not.toThrow();
  });

  test('StateManager debe tener métodos de UI', () => {
    const stateManager = (window as any).shellServices.stateManager;
    
    expect(stateManager.setTheme).toBeDefined();
    expect(stateManager.setLanguage).toBeDefined();
    expect(stateManager.addNotification).toBeDefined();
    expect(stateManager.clearNotifications).toBeDefined();
    
    // Test theme
    expect(() => {
      stateManager.setTheme('dark');
    }).not.toThrow();
    
    // Test language
    expect(() => {
      stateManager.setLanguage('en');
    }).not.toThrow();
    
    // Test notifications
    expect(() => {
      stateManager.addNotification({ type: 'info', message: 'Test' });
    }).not.toThrow();
  });
});