// src/services/__tests__/newStateIntegration.test.jsx
/**
 * Pruebas unitarias para los hooks de integración con el StateManager
 */

import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';

import {
  useGlobalState,
  useStateSlice,
  useAuth,
  useUI,
  useNavigation,
  useBusiness,
  useArtistaState,
  useArtistaNotifications,
  useBatchUpdate,
  EnhancedStateProvider,
  useEnhancedState
} from '../newStateIntegration.jsx';

describe('State Integration Hooks', () => {
  let mockStateManager;

  beforeEach(() => {
    mockStateManager = window.shellServices.stateManager;
    jest.clearAllMocks();
  });

  describe('useGlobalState', () => {
    test('debe devolver el estado global completo', () => {
      const { result } = renderHook(() => useGlobalState());
      
      expect(result.current).toHaveProperty('auth');
      expect(result.current).toHaveProperty('ui');
      expect(result.current).toHaveProperty('navigation');
      expect(result.current).toHaveProperty('business');
      expect(result.current).toHaveProperty('system');
    });

    test('debe suscribirse a cambios globales', () => {
      renderHook(() => useGlobalState());
      
      expect(mockStateManager.subscribe).toHaveBeenCalledWith('*', expect.any(Function));
    });
  });

  describe('useStateSlice', () => {
    test('debe devolver una slice específica del estado', () => {
      const { result } = renderHook(() => useStateSlice('auth'));
      
      expect(result.current).toHaveProperty('user');
      expect(result.current).toHaveProperty('isAuthenticated');
      expect(result.current).toHaveProperty('token');
    });

    test('debe suscribirse a cambios de la slice específica', () => {
      renderHook(() => useStateSlice('ui'));
      
      expect(mockStateManager.subscribe).toHaveBeenCalledWith('ui', expect.any(Function));
    });
  });

  describe('useAuth', () => {
    test('debe proporcionar métodos de autenticación', () => {
      const { result } = renderHook(() => useAuth());
      
      expect(result.current).toHaveProperty('login');
      expect(result.current).toHaveProperty('logout');
      expect(result.current).toHaveProperty('isLoggedIn');
      expect(result.current).toHaveProperty('user');
      expect(result.current).toHaveProperty('token');
    });

    test('debe llamar al StateManager.login cuando se ejecuta login', () => {
      const { result } = renderHook(() => useAuth());
      
      const user = { id: '123', name: 'Test User' };
      const token = 'test-token';
      
      act(() => {
        result.current.login(user, token);
      });
      
      expect(mockStateManager.login).toHaveBeenCalledWith(user, token, undefined);
    });

    test('debe llamar al StateManager.logout cuando se ejecuta logout', () => {
      const { result } = renderHook(() => useAuth());
      
      act(() => {
        result.current.logout();
      });
      
      expect(mockStateManager.logout).toHaveBeenCalled();
    });
  });

  describe('useUI', () => {
    test('debe proporcionar métodos de UI', () => {
      const { result } = renderHook(() => useUI());
      
      expect(result.current).toHaveProperty('setTheme');
      expect(result.current).toHaveProperty('setLanguage');
      expect(result.current).toHaveProperty('addNotification');
      expect(result.current).toHaveProperty('markNotificationRead');
      expect(result.current).toHaveProperty('clearNotifications');
    });

    test('debe llamar al StateManager.setTheme', () => {
      const { result } = renderHook(() => useUI());
      
      act(() => {
        result.current.setTheme('dark');
      });
      
      expect(mockStateManager.setTheme).toHaveBeenCalledWith('dark');
    });

    test('debe llamar al StateManager.addNotification', () => {
      const { result } = renderHook(() => useUI());
      
      const notification = {
        type: 'success',
        title: 'Test',
        message: 'Test message'
      };
      
      act(() => {
        result.current.addNotification(notification);
      });
      
      expect(mockStateManager.addNotification).toHaveBeenCalledWith(notification);
    });
  });

  describe('useNavigation', () => {
    test('debe proporcionar métodos de navegación', () => {
      const { result } = renderHook(() => useNavigation());
      
      expect(result.current).toHaveProperty('navigateTo');
      expect(result.current).toHaveProperty('currentRoute');
      expect(result.current).toHaveProperty('activeModule');
    });

    test('debe llamar al StateManager.navigateTo', () => {
      const { result } = renderHook(() => useNavigation());
      
      act(() => {
        result.current.navigateTo('/test-route', 'test-module');
      });
      
      expect(mockStateManager.navigateTo).toHaveBeenCalledWith('/test-route', 'test-module');
    });
  });

  describe('useArtistaState', () => {
    test('debe proporcionar estado específico para artistas', () => {
      const { result } = renderHook(() => useArtistaState());
      
      expect(result.current).toHaveProperty('selectedArtist');
      expect(result.current).toHaveProperty('currentUser');
      expect(result.current).toHaveProperty('sharedContent');
      expect(result.current).toHaveProperty('setSelectedArtist');
      expect(result.current).toHaveProperty('getCurrentArtist');
      expect(result.current).toHaveProperty('addToSharedContent');
    });

    test('debe actualizar selectedArtist correctamente', () => {
      const { result } = renderHook(() => useArtistaState());
      
      const artist = { id: '123', name: 'Test Artist' };
      
      act(() => {
        result.current.setSelectedArtist(artist);
      });
      
      expect(mockStateManager.setState).toHaveBeenCalledWith('business', {
        selectedArtist: artist
      });
    });
  });

  describe('useArtistaNotifications', () => {
    test('debe proporcionar métodos de notificación específicos para artistas', () => {
      const { result } = renderHook(() => useArtistaNotifications());
      
      expect(result.current).toHaveProperty('notifyContentUploaded');
      expect(result.current).toHaveProperty('notifyProfileUpdated');
      expect(result.current).toHaveProperty('notifyError');
    });

    test('debe crear notificación cuando se sube contenido', () => {
      const { result } = renderHook(() => useArtistaNotifications());
      
      act(() => {
        result.current.notifyContentUploaded('Test Song');
      });
      
      expect(mockStateManager.addNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'success',
          title: 'Contenido subido',
          message: 'Test Song se ha subido correctamente'
        })
      );
    });

    test('debe crear notificación de error', () => {
      const { result } = renderHook(() => useArtistaNotifications());
      
      const error = new Error('Test error');
      
      act(() => {
        result.current.notifyError(error, 'Test Context');
      });
      
      expect(mockStateManager.addNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
          title: 'Error en Test Context',
          message: 'Test error'
        })
      );
    });
  });

  describe('useBatchUpdate', () => {
    test('debe devolver función para actualizaciones en lote', () => {
      const { result } = renderHook(() => useBatchUpdate());
      
      expect(typeof result.current).toBe('function');
    });

    test('debe llamar al StateManager.setBatch', () => {
      const { result } = renderHook(() => useBatchUpdate());
      
      const updates = {
        ui: { theme: 'dark' },
        auth: { user: { name: 'Test' } }
      };
      
      act(() => {
        result.current(updates);
      });
      
      expect(mockStateManager.setBatch).toHaveBeenCalledWith(updates);
    });
  });

  describe('EnhancedStateProvider y useEnhancedState', () => {
    test('debe proporcionar contexto con todos los métodos', () => {
      const TestComponent = () => {
        const state = useEnhancedState();
        return (
          <div>
            <span data-testid="has-login">{state.login ? 'yes' : 'no'}</span>
            <span data-testid="has-theme">{state.setTheme ? 'yes' : 'no'}</span>
            <span data-testid="has-navigate">{state.navigateTo ? 'yes' : 'no'}</span>
          </div>
        );
      };

      render(
        <EnhancedStateProvider>
          <TestComponent />
        </EnhancedStateProvider>
      );

      expect(screen.getByTestId('has-login')).toHaveTextContent('yes');
      expect(screen.getByTestId('has-theme')).toHaveTextContent('yes');
      expect(screen.getByTestId('has-navigate')).toHaveTextContent('yes');
    });

    test('debe mostrar warning si se usa fuera del provider', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      
      const TestComponent = () => {
        useEnhancedState();
        return <div>Test</div>;
      };

      render(<TestComponent />);

      expect(consoleSpy).toHaveBeenCalledWith(
        '⚠️ useEnhancedState debe usarse dentro de EnhancedStateProvider'
      );

      consoleSpy.mockRestore();
    });
  });
});
