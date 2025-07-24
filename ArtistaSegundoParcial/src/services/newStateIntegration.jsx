// ArtistaSegundoParcial/src/services/newStateIntegration.jsx
/**
 * Nueva integración con el StateManager mejorado para React
 * Reemplaza gradualmente a shellIntegration.jsx
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Obtener StateManager del shell
const getStateManager = () => {
  if (typeof window !== 'undefined' && window.shellServices?.stateManager) {
    return window.shellServices.stateManager;
  }
  throw new Error('StateManager no disponible - ¿está corriendo en el shell?');
};

// Crear hooks de React manualmente
const stateManager = getStateManager();

/**
 * Hook para acceder a todo el estado global
 */
export function useGlobalState() {
  const [state, setState] = useState(() => stateManager.getState());
  
  useEffect(() => {
    const unsubscribe = stateManager.subscribe('*', (newState) => {
      setState(newState);
    });
    
    return unsubscribe;
  }, []);
  
  return state;
}

/**
 * Hook para acceder a una parte específica del estado
 */
export function useStateSlice(key) {
  const [slice, setSlice] = useState(() => stateManager.getState(key));
  
  useEffect(() => {
    const unsubscribe = stateManager.subscribe(key, (newValue) => {
      setSlice(newValue);
    });
    
    return unsubscribe;
  }, [key]);
  
  return slice;
}

/**
 * Hook para acceder y actualizar una parte del estado
 */
export function useStateSliceWithSetter(key) {
  const slice = useStateSlice(key);
  
  const setter = useCallback((value) => {
    stateManager.setState(key, value);
  }, [key]);
  
  return [slice, setter];
}

/**
 * Hook para auth específicamente
 */
export function useAuth() {
  const [auth, setAuth] = useStateSliceWithSetter('auth');
  
  const login = useCallback((user, token, refreshToken) => {
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
export function useUI() {
  const [ui, setUI] = useStateSliceWithSetter('ui');
  
  const setTheme = useCallback((theme) => {
    stateManager.setTheme(theme);
  }, []);
  
  const setLanguage = useCallback((language) => {
    stateManager.setLanguage(language);
  }, []);
  
  const addNotification = useCallback((notification) => {
    stateManager.addNotification(notification);
  }, []);
  
  const markNotificationRead = useCallback((id) => {
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
export function useNavigation() {
  const [navigation, setNavigation] = useStateSliceWithSetter('navigation');
  
  const navigateTo = useCallback((route, module) => {
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
export function useBusiness() {
  return useStateSliceWithSetter('business');
}

/**
 * Hook para system state
 */
export function useSystem() {
  return useStateSlice('system');
}

// Context Provider para compatibilidad con código existente
const EnhancedStateContext = createContext(null);

export function EnhancedStateProvider({ children }) {
  const auth = useAuth();
  const ui = useUI();
  const navigation = useNavigation();
  const [business, setBusiness] = useBusiness();
  const system = useSystem();

  const contextValue = {
    // Auth methods (mejorados)
    ...auth,
    
    // UI methods (nuevos)
    ...ui,
    
    // Navigation (mejorado)
    ...navigation,
    
    // Business state (nuevo)
    business,
    setBusiness,
    
    // System state (nuevo)
    system,
    
    // Utilidades adicionales
    stateManager,
    
    // Método para debug
    debugState: () => {
      console.log('🎭 Estado actual (Artista):', stateManager.getState());
    }
  };

  return (
    <EnhancedStateContext.Provider value={contextValue}>
      {children}
    </EnhancedStateContext.Provider>
  );
}

export function useEnhancedState() {
  const context = useContext(EnhancedStateContext);
  if (!context) {
    console.warn('⚠️ useEnhancedState debe usarse dentro de EnhancedStateProvider');
    // Fallback al sistema legacy
    return window.shellServices || {};
  }
  return context;
}

// Hook específico para artistas
export function useArtistaState() {
  const [business, setBusiness] = useBusiness();
  const auth = useAuth();
  
  const setSelectedArtist = (artist) => {
    setBusiness({ selectedArtist: artist });
  };
  
  const getCurrentArtist = () => {
    return business.selectedArtist || auth.user;
  };
  
  const addToSharedContent = (content) => {
    setBusiness({
      sharedContent: [...business.sharedContent, content]
    });
  };
  
  return {
    selectedArtist: business.selectedArtist,
    currentUser: auth.user,
    sharedContent: business.sharedContent,
    setSelectedArtist,
    getCurrentArtist,
    addToSharedContent,
    isAuthenticated: auth.isAuthenticated
  };
}

// Hook para notificaciones específicas de artista
export function useArtistaNotifications() {
  const { addNotification } = useUI();
  
  const notifyContentUploaded = (contentName) => {
    addNotification({
      type: 'success',
      title: 'Contenido subido',
      message: `${contentName} se ha subido correctamente`,
      actions: [{
        label: 'Ver',
        action: () => window.shellServices.navigate('/artista/contenido')
      }]
    });
  };
  
  const notifyProfileUpdated = () => {
    addNotification({
      type: 'success',
      title: 'Perfil actualizado',
      message: 'Tu perfil se ha actualizado correctamente'
    });
  };
  
  const notifyError = (error, context = 'General') => {
    addNotification({
      type: 'error',
      title: `Error en ${context}`,
      message: error.message || 'Ha ocurrido un error inesperado'
    });
  };
  
  return {
    notifyContentUploaded,
    notifyProfileUpdated,
    notifyError
  };
}

// Hook para batch updates
export function useBatchUpdate() {
  return useCallback((updates) => {
    stateManager.setBatch(updates);
  }, []);
}

// Funciones auxiliares (simuladas)
async function fetchUserData(userId) {
  // Aquí iría la llamada real a Supabase
  return { name: 'Usuario Actualizado' };
}

async function fetchArtistData(userId) {
  // Aquí iría la llamada real a Supabase
  return { artistName: 'Artista Actualizado' };
}

// Ejemplo de uso avanzado: Hook para sincronización con Supabase
export function useSupabaseSync() {
  const batchUpdate = useBatchUpdate();
  const auth = useAuth();
  const { notifyError } = useArtistaNotifications();
  
  const syncWithSupabase = async () => {
    try {
      if (!auth.isAuthenticated) return;
      
      // Aquí iría la lógica de sync con Supabase
      const userData = await fetchUserData(auth.user.id);
      const artistData = await fetchArtistData(auth.user.id);
      
      batchUpdate({
        auth: { user: { ...auth.user, ...userData } },
        business: { selectedArtist: artistData }
      });
      
    } catch (error) {
      notifyError(error, 'Sincronización');
    }
  };
  
  return { syncWithSupabase };
}
