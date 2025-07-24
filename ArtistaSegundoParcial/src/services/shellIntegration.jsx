/**
 * 🎸 Ejemplo de integración del módulo ArtistaSegundoParcial con Shell Services
 * 
 * Este archivo muestra cómo integrar un microfrontend React con los servicios
 * centralizados del shell.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createMicrofrontendIntegration } from '../single-spa-root/src/microfrontend-integration.js';

// Context para compartir shell services en React
const ShellServicesContext = createContext(null);

/**
 * Hook personalizado para usar shell services
 */
export function useShellServices() {
  const context = useContext(ShellServicesContext);
  if (!context) {
    console.warn('⚠️  useShellServices debe usarse dentro de ShellServicesProvider');
    return null;
  }
  return context;
}

/**
 * Hook para autenticación
 */
export function useAuth() {
  const shellServices = useShellServices();
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null,
    loading: true
  });

  useEffect(() => {
    if (!shellServices?.auth) {
      setAuthState(prev => ({ ...prev, loading: false }));
      return;
    }

    // Obtener estado inicial
    const initialState = shellServices.auth.getAuthState();
    setAuthState({
      isAuthenticated: initialState.isAuthenticated,
      user: initialState.user,
      loading: false
    });

    // Suscribirse a cambios
    const unsubscribe = shellServices.auth.subscribe((newState) => {
      setAuthState({
        isAuthenticated: newState.isAuthenticated,
        user: newState.user,
        loading: false
      });
    });

    return unsubscribe;
  }, [shellServices]);

  const login = async (credentials) => {
    if (!shellServices?.auth) {
      throw new Error('Auth service no disponible');
    }
    return shellServices.auth.login(credentials);
  };

  const logout = async () => {
    if (!shellServices?.auth) {
      throw new Error('Auth service no disponible');
    }
    return shellServices.auth.logout();
  };

  return {
    ...authState,
    login,
    logout
  };
}

/**
 * Hook para tema
 */
export function useTheme() {
  const shellServices = useShellServices();
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    if (!shellServices?.globalState) return;

    const currentState = shellServices.globalState.getState();
    setTheme(currentState.theme || 'light');

    const unsubscribe = shellServices.globalState.subscribe((state) => {
      if (state.theme) {
        setTheme(state.theme);
      }
    });

    return unsubscribe;
  }, [shellServices]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    if (shellServices?.globalState) {
      shellServices.globalState.updateState({ theme: newTheme });
    }
  };

  return { theme, toggleTheme };
}

/**
 * Provider para shell services
 */
export function ShellServicesProvider({ children }) {
  const [integration, setIntegration] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initializeIntegration() {
      try {
        const microfrontendIntegration = createMicrofrontendIntegration(
          'artista-v2', 
          'React',
          {
            themeCallback: (theme) => {
              console.log('🎨 Tema cambiado en React:', theme);
              // Trigger re-render si es necesario
            }
          }
        );

        await microfrontendIntegration.initialize();
        setIntegration(microfrontendIntegration);
        
      } catch (error) {
        console.error('❌ Error inicializando integración:', error);
      } finally {
        setIsLoading(false);
      }
    }

    initializeIntegration();

    // Cleanup al desmontar
    return () => {
      if (integration) {
        integration.cleanup();
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="shell-loading">
        <div className="loading-spinner"></div>
        <p>Conectando con shell services...</p>
      </div>
    );
  }

  return (
    <ShellServicesContext.Provider value={integration?.shellServices}>
      {children}
    </ShellServicesContext.Provider>
  );
}

/**
 * Componente de ejemplo que usa los shell services
 */
export function AuthenticatedHeader() {
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  if (!isAuthenticated) {
    return (
      <header className="app-header">
        <h1>Artista Dashboard</h1>
        <button onClick={() => window.navigateToModule('/login')}>
          Iniciar Sesión
        </button>
      </header>
    );
  }

  return (
    <header className="app-header authenticated">
      <h1>Hola, {user?.name || 'Artista'}</h1>
      <div className="header-actions">
        <button onClick={toggleTheme} className="theme-toggle">
          {theme === 'light' ? '🌙' : '☀️'} {theme}
        </button>
        <button onClick={logout} className="logout-btn">
          Cerrar Sesión
        </button>
      </div>
      
      <style jsx>{`
        .app-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 2rem;
          background: var(--header-bg, #f8f9fa);
          border-bottom: 1px solid var(--border-color, #dee2e6);
        }
        
        .authenticated {
          background: var(--primary-color, #007bff);
          color: white;
        }
        
        .header-actions {
          display: flex;
          gap: 1rem;
          align-items: center;
        }
        
        .theme-toggle, .logout-btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .theme-toggle {
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }
        
        .logout-btn {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }
        
        .theme-toggle:hover, .logout-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        
        .shell-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 200px;
          color: #666;
        }
        
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #f3f3f3;
          border-top: 3px solid #007bff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* Tema oscuro */
        [data-theme="dark"] .app-header {
          --header-bg: #343a40;
          --border-color: #495057;
        }
      `}</style>
    </header>
  );
}

/**
 * HOC para envolver componentes con shell services
 */
export function withShellServices(WrappedComponent) {
  return function ShellServicesWrapper(props) {
    return (
      <ShellServicesProvider>
        <WrappedComponent {...props} />
      </ShellServicesProvider>
    );
  };
}

// CSS para la integración
export const shellIntegrationStyles = `
  /* Variables CSS para temas */
  [data-theme="light"] {
    --primary-color: #007bff;
    --secondary-color: #6c757d;
    --background-color: #ffffff;
    --text-color: #212529;
    --border-color: #dee2e6;
    --header-bg: #f8f9fa;
  }
  
  [data-theme="dark"] {
    --primary-color: #0d6efd;
    --secondary-color: #6c757d;
    --background-color: #212529;
    --text-color: #ffffff;
    --border-color: #495057;
    --header-bg: #343a40;
  }
  
  /* Transiciones suaves para cambios de tema */
  * {
    transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
  }
`;

export default ShellServicesProvider;
