// src/state/migration.js
/**
 * Sistema de migración del estado legacy al nuevo StateManager
 * Mantiene compatibilidad hacia atrás mientras migra gradualmente
 */

export function createStateMigration(oldGlobalState, authService, newStateManager) {
  console.log('🔄 Iniciando migración de estado...');

  // 1. Sincronizar estado inicial del auth service al nuevo manager
  const currentUser = authService.getUser();
  const isAuth = authService.isUserAuthenticated();
  
  if (currentUser && isAuth) {
    newStateManager.setState('auth', {
      user: currentUser,
      isAuthenticated: isAuth,
      token: localStorage.getItem('plataforma_user_token'), // Si existe
      lastLoginTime: Date.now()
    });
  }

  // 2. Sincronizar estado del globalState legacy
  const oldState = oldGlobalState.getState();
  if (oldState) {
    // Migrar tema y idioma
    if (oldState.theme) {
      newStateManager.setState('ui', { theme: oldState.theme });
    }
    if (oldState.language) {
      newStateManager.setState('ui', { language: oldState.language });
    }
    
    // Migrar rutas visitadas
    if (oldState.lastVisitedRoutes) {
      newStateManager.setState('navigation', { 
        lastVisitedRoutes: oldState.lastVisitedRoutes 
      });
    }
  }

  // 3. Configurar sincronización bidireccional durante la transición

  // Auth service -> StateManager
  authService.subscribe((authData) => {
    newStateManager.setState('auth', {
      user: authData.user,
      isAuthenticated: authData.isAuthenticated,
      lastLoginTime: Date.now()
    });
  });

  // StateManager -> Auth service (para mantener compatibilidad)
  newStateManager.subscribe('auth', (newAuth, oldAuth) => {
    if (newAuth.isAuthenticated !== oldAuth.isAuthenticated) {
      if (newAuth.isAuthenticated && newAuth.user) {
        // No llamar authService.login para evitar loop
      } else if (!newAuth.isAuthenticated) {
        // No llamar authService.logout para evitar loop
      }
    }
  });

  // Global state legacy -> StateManager
  oldGlobalState.subscribe((newOldState) => {
    // Sincronizar cambios desde el sistema legacy
    newStateManager.setBatch({
      ui: {
        theme: newOldState.theme,
        language: newOldState.language
      },
      navigation: {
        lastVisitedRoutes: newOldState.lastVisitedRoutes || []
      }
    });
  });

  // StateManager -> Global state legacy (para compatibilidad)
  newStateManager.subscribe('ui', (newUI) => {
    // Actualizar el sistema legacy silenciosamente
    if (newUI.theme !== oldGlobalState.getState().theme) {
      oldGlobalState.updateState({ theme: newUI.theme }, false); // false = sin trigger
    }
    if (newUI.language !== oldGlobalState.getState().language) {
      oldGlobalState.updateState({ language: newUI.language }, false);
    }
  });

  newStateManager.subscribe('navigation', (newNav) => {
    if (newNav.lastVisitedRoutes) {
      oldGlobalState.updateState({ 
        lastVisitedRoutes: newNav.lastVisitedRoutes 
      }, false);
    }
  });

  // 4. Proxy methods para gradual adoption
  const migrationAPI = {
    // Métodos que funcionan con ambos sistemas
    setTheme: (theme) => {
      newStateManager.setTheme(theme);
      // El sync automático actualizará el legacy
    },
    
    setLanguage: (language) => {
      newStateManager.setLanguage(language);
    },
    
    login: (user, token, refreshToken) => {
      newStateManager.login(user, token, refreshToken);
      // Sync automático actualizará authService
    },
    
    logout: () => {
      newStateManager.logout();
    },
    
    addNotification: (notification) => {
      newStateManager.addNotification(notification);
    },
    
    // Helper para microfrontends que quieren migrar gradualmente
    getState: (useNew = false) => {
      return useNew ? newStateManager.getState() : oldGlobalState.getState();
    },
    
    subscribe: (callback, useNew = false) => {
      if (useNew) {
        return newStateManager.subscribe('*', callback);
      } else {
        return oldGlobalState.subscribe(callback);
      }
    }
  };

  console.log('✅ Migración de estado configurada');
  return migrationAPI;
}
