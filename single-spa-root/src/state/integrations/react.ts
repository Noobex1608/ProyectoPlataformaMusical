// src/state/integrations/react.ts
/**
 * Integración con React - Hooks para usar el StateManager
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { GlobalState, StateListener } from '../index';

// Importar el StateManager desde JS 
declare global {
  interface Window {
    shellServices?: {
      stateManager?: any;
    };
  }
}

export function createReactHooks(stateManager: any) {
  
  /**
   * Hook para acceder a todo el estado global
   */
  function useGlobalState(): GlobalState {
    const [state, setState] = useState(() => stateManager.getState());
    
    useEffect(() => {
      const unsubscribe = stateManager.subscribe('*', (newState: GlobalState) => {
        setState(newState);
      });
      
      return unsubscribe;
    }, []);
    
    return state;
  }

  /**
   * Hook para acceder a una parte específica del estado
   */
  function useStateSlice<K extends keyof GlobalState>(key: K): GlobalState[K] {
    const [slice, setSlice] = useState(() => stateManager.getState(key));
    
    useEffect(() => {
      const unsubscribe = stateManager.subscribe(key, (newValue: GlobalState[K]) => {
        setSlice(newValue);
      });
      
      return unsubscribe;
    }, [key]);
    
    return slice;
  }

  /**
   * Hook para acceder y actualizar una parte del estado
   */
  function useStateSliceWithSetter<K extends keyof GlobalState>(
    key: K
  ): [GlobalState[K], (value: Partial<GlobalState[K]>) => void] {
    const slice = useStateSlice(key);
    
    const setter = useCallback((value: Partial<GlobalState[K]>) => {
      stateManager.setState(key, value);
    }, [key]);
    
    return [slice, setter];
  }

  /**
   * Hook para auth específicamente
   */
  function useAuth() {
    const [auth, setAuth] = useStateSliceWithSetter('auth');
    
    const login = useCallback((user: any, token: string, refreshToken?: string) => {
      stateManager.login(user, token, refreshToken);
    }, []);
    
    const logout = useCallback(() => {
      stateManager.logout();
    }, []);
    
    return {
      ...auth,
      login,
      logout,
      isLoggedIn: auth.isAuthenticated
    };
  }

  /**
   * Hook para UI state
   */
  function useUI() {
    const [ui, setUI] = useStateSliceWithSetter('ui');
    
    const setTheme = useCallback((theme: GlobalState['ui']['theme']) => {
      stateManager.setTheme(theme);
    }, []);
    
    const setLanguage = useCallback((language: GlobalState['ui']['language']) => {
      stateManager.setLanguage(language);
    }, []);
    
    const addNotification = useCallback((notification: Parameters<typeof stateManager.addNotification>[0]) => {
      stateManager.addNotification(notification);
    }, []);
    
    const markNotificationRead = useCallback((id: string) => {
      stateManager.markNotificationRead(id);
    }, []);
    
    const clearNotifications = useCallback(() => {
      stateManager.clearNotifications();
    }, []);
    
    return {
      ...ui,
      setTheme,
      setLanguage,
      addNotification,
      markNotificationRead,
      clearNotifications
    };
  }

  /**
   * Hook para navigation
   */
  function useNavigation() {
    const [navigation, setNavigation] = useStateSliceWithSetter('navigation');
    
    const navigateTo = useCallback((route: string, module: string) => {
      stateManager.navigateTo(route, module);
    }, []);
    
    return {
      ...navigation,
      navigateTo
    };
  }

  /**
   * Hook para business state
   */
  function useBusiness() {
    return useStateSliceWithSetter('business');
  }

  /**
   * Hook para system state
   */
  function useSystem() {
    return useStateSlice('system');
  }

  /**
   * Hook personalizado para suscripcionar a cambios específicos
   */
  function useStateListener<K extends keyof GlobalState>(
    key: K,
    listener: StateListener<GlobalState[K]>,
    deps: any[] = []
  ): void {
    const listenerRef = useRef(listener);
    listenerRef.current = listener;
    
    useEffect(() => {
      const stableListener: StateListener<GlobalState[K]> = (...args) => {
        listenerRef.current(...args);
      };
      
      return stateManager.subscribe(key, stableListener);
    }, [key, ...deps]);
  }

  /**
   * Hook para realizar actualizaciones en lote
   */
  function useBatchUpdate() {
    return useCallback((updates: Parameters<typeof stateManager.setBatch>[0]) => {
      stateManager.setBatch(updates);
    }, []);
  }

  /**
   * Hook para debugging - solo en desarrollo
   */
  function useStateDebug() {
    const state = useGlobalState();
    
    useEffect(() => {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Global State Updated:', state);
      }
    }, [state]);
    
    return {
      state,
      stateManager,
      logState: () => console.log('Current State:', stateManager.getState())
    };
  }

  return {
    useGlobalState,
    useStateSlice,
    useStateSliceWithSetter,
    useAuth,
    useUI,
    useNavigation,
    useBusiness,
    useSystem,
    useStateListener,
    useBatchUpdate,
    useStateDebug
  };
}

// Tipos para TypeScript
export type ReactStateHooks = ReturnType<typeof createReactHooks>;
