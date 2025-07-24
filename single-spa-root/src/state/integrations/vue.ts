// src/state/integrations/vue.ts
/**
 * Integración con Vue 3 - Plugin y composables para usar el StateManager
 */

import { reactive, computed, watch, onUnmounted, inject, provide, App, readonly } from 'vue';
import { GlobalState, StateListener } from '../index';

const STATE_MANAGER_KEY = Symbol('StateManager');

export function createVuePlugin(stateManager: any) {
  
  const plugin = {
    install(app: App) {
      // Proveer el StateManager globalmente
      app.provide(STATE_MANAGER_KEY, stateManager);
      
      // Propiedades globales para template
      app.config.globalProperties.$state = stateManager;
      app.config.globalProperties.$getState = () => stateManager.getState();
    }
  };

  /**
   * Composable para acceder al StateManager
   */
  function useStateManager(): any {
    const manager = inject<any>(STATE_MANAGER_KEY);
    if (!manager) {
      throw new Error('StateManager no está disponible. ¿Instalaste el plugin?');
    }
    return manager;
  }

  /**
   * Composable para estado global reactivo
   */
  function useGlobalState() {
    const manager = useStateManager();
    const state = reactive(manager.getState());
    
    const unsubscribe = manager.subscribe('*', (newState) => {
      Object.assign(state, newState);
    });
    
    onUnmounted(unsubscribe);
    
    return state;
  }

  /**
   * Composable para una slice específica del estado
   */
  function useStateSlice<K extends keyof GlobalState>(key: K) {
    const manager = useStateManager();
    const slice = reactive(manager.getState(key));
    
    const unsubscribe = manager.subscribe(key, (newValue) => {
      Object.assign(slice, newValue);
    });
    
    onUnmounted(unsubscribe);
    
    const setState = (value: Partial<GlobalState[K]>) => {
      manager.setState(key, value);
    };
    
    return {
      state: slice,
      setState
    };
  }

  /**
   * Composable para autenticación
   */
  function useAuth() {
    const manager = useStateManager();
    const { state: auth, setState } = useStateSlice('auth');
    
    const login = (user: any, token: string, refreshToken?: string) => {
      manager.login(user, token, refreshToken);
    };
    
    const logout = () => {
      manager.logout();
    };
    
    const isLoggedIn = computed(() => auth.isAuthenticated);
    
    return {
      auth,
      login,
      logout,
      isLoggedIn,
      user: computed(() => auth.user),
      token: computed(() => auth.token)
    };
  }

  /**
   * Composable para UI state
   */
  function useUI() {
    const manager = useStateManager();
    const { state: ui } = useStateSlice('ui');
    
    const setTheme = (theme: GlobalState['ui']['theme']) => {
      manager.setTheme(theme);
    };
    
    const setLanguage = (language: GlobalState['ui']['language']) => {
      manager.setLanguage(language);
    };
    
    const addNotification = (notification: Parameters<typeof manager.addNotification>[0]) => {
      manager.addNotification(notification);
    };
    
    const markNotificationRead = (id: string) => {
      manager.markNotificationRead(id);
    };
    
    const clearNotifications = () => {
      manager.clearNotifications();
    };
    
    const unreadNotifications = computed(() => 
      ui.notifications.filter(n => !n.read)
    );
    
    const notificationCount = computed(() => unreadNotifications.value.length);
    
    return {
      ui,
      setTheme,
      setLanguage,
      addNotification,
      markNotificationRead,
      clearNotifications,
      unreadNotifications,
      notificationCount,
      theme: computed(() => ui.theme),
      language: computed(() => ui.language),
      notifications: computed(() => ui.notifications)
    };
  }

  /**
   * Composable para navegación
   */
  function useNavigation() {
    const manager = useStateManager();
    const { state: navigation } = useStateSlice('navigation');
    
    const navigateTo = (route: string, module: string) => {
      manager.navigateTo(route, module);
    };
    
    return {
      navigation,
      navigateTo,
      currentRoute: computed(() => navigation.currentRoute),
      activeModule: computed(() => navigation.activeModule),
      breadcrumbs: computed(() => navigation.breadcrumbs),
      lastVisitedRoutes: computed(() => navigation.lastVisitedRoutes)
    };
  }

  /**
   * Composable para business state
   */
  function useBusiness() {
    const { state: business, setState } = useStateSlice('business');
    
    return {
      business,
      setBusiness: setState,
      selectedArtist: computed(() => business.selectedArtist),
      selectedClub: computed(() => business.selectedClub),
      monetizationContext: computed(() => business.monetizationContext),
      sharedContent: computed(() => business.sharedContent)
    };
  }

  /**
   * Composable para system state
   */
  function useSystem() {
    const { state: system } = useStateSlice('system');
    
    return {
      system: readonly(system),
      isOnline: computed(() => system.onlineStatus),
      lastSyncTime: computed(() => system.lastSyncTime),
      pendingActions: computed(() => system.pendingActions),
      errorQueue: computed(() => system.errorQueue)
    };
  }

  /**
   * Composable para escuchar cambios específicos
   */
  function useStateListener<K extends keyof GlobalState>(
    key: K,
    callback: StateListener<GlobalState[K]>
  ) {
    const manager = useStateManager();
    
    const unsubscribe = manager.subscribe(key, callback);
    onUnmounted(unsubscribe);
    
    return unsubscribe;
  }

  /**
   * Composable para actualizaciones en lote
   */
  function useBatchUpdate() {
    const manager = useStateManager();
    
    return (updates: Parameters<typeof manager.setBatch>[0]) => {
      manager.setBatch(updates);
    };
  }

  /**
   * Composable para debugging
   */
  function useStateDebug() {
    const manager = useStateManager();
    const state = useGlobalState();
    
    watch(
      () => state,
      (newState) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔍 Vue Global State Updated:', newState);
        }
      },
      { deep: true }
    );
    
    return {
      state,
      manager,
      logState: () => console.log('Current State:', manager.getState())
    };
  }

  /**
   * Directiva personalizada para binding automático
   */
  const vStateDirective = {
    mounted(el: HTMLElement, binding: any) {
      const { key, prop } = binding.value;
      const manager = stateManager;
      
      const unsubscribe = manager.subscribe(key, (newValue) => {
        if (prop) {
          el.textContent = newValue[prop];
        } else {
          el.textContent = JSON.stringify(newValue);
        }
      });
      
      // Guardar para cleanup
      (el as any)._stateUnsubscribe = unsubscribe;
    },
    
    unmounted(el: HTMLElement) {
      if ((el as any)._stateUnsubscribe) {
        (el as any)._stateUnsubscribe();
      }
    }
  };

  return {
    plugin,
    useStateManager,
    useGlobalState,
    useStateSlice,
    useAuth,
    useUI,
    useNavigation,
    useBusiness,
    useSystem,
    useStateListener,
    useBatchUpdate,
    useStateDebug,
    vStateDirective
  };
}

// Tipos para TypeScript
export type VueStateComposables = ReturnType<typeof createVuePlugin>;
