// src/composables/newStateIntegration.ts
/**
 * Nueva integración con el StateManager mejorado para Vue 3
 * Equivalente a la integración de React y Angular
 */

import { reactive, computed, onUnmounted, watch, readonly } from 'vue';

// Tipos básicos para el estado global
interface GlobalState {
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
    notifications: any[];
  };
  navigation: {
    currentRoute: string;
    activeModule: string;
    breadcrumbs: any[];
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
    pendingActions: any[];
    errorQueue: any[];
  };
}

// Obtener StateManager del shell
const getStateManager = () => {
  if (typeof window !== 'undefined' && (window as any).shellServices?.stateManager) {
    return (window as any).shellServices.stateManager;
  }
  throw new Error('StateManager no disponible - ¿está corriendo en el shell?');
};

// No inicializar el stateManager aquí, sino dentro de cada función
// const stateManager = getStateManager();

/**
 * Composable para acceder a todo el estado global
 */
export function useGlobalState() {
  const stateManager = getStateManager();
  const state = reactive<GlobalState>(stateManager.getState());
  
  const unsubscribe = stateManager.subscribe('*', (newState: GlobalState) => {
    Object.assign(state, newState);
  });
  
  onUnmounted(unsubscribe);
  
  return state;
}

/**
 * Composable para una slice específica del estado
 */
export function useStateSlice<K extends keyof GlobalState>(key: K) {
  const stateManager = getStateManager();
  const slice = reactive(stateManager.getState(key));
  
  const unsubscribe = stateManager.subscribe(key, (newValue: GlobalState[K]) => {
    Object.assign(slice, newValue);
  });
  
  onUnmounted(unsubscribe);
  
  const setState = (value: Partial<GlobalState[K]>) => {
    stateManager.setState(key, value);
  };
  
  return {
    state: slice,
    setState
  };
}

/**
 * Composable para autenticación
 */
export function useAuth() {
  const { state: auth } = useStateSlice('auth');
  const stateManager = getStateManager();
  
  const login = (user: any, token: string, refreshToken?: string) => {
    stateManager.login(user, token, refreshToken);
  };
  
  const logout = () => {
    stateManager.logout();
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
export function useUI() {
  const { state: ui } = useStateSlice('ui');
  const stateManager = getStateManager();
  
  const setTheme = (theme: GlobalState['ui']['theme']) => {
    stateManager.setTheme(theme);
  };
  
  const setLanguage = (language: GlobalState['ui']['language']) => {
    stateManager.setLanguage(language);
  };
  
  const addNotification = (notification: any) => {
    stateManager.addNotification(notification);
  };
  
  const markNotificationRead = (id: string) => {
    stateManager.markNotificationRead(id);
  };
  
  const clearNotifications = () => {
    stateManager.clearNotifications();
  };
  
  const unreadNotifications = computed(() => 
    ui.notifications.filter((n: any) => !n.read)
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
export function useNavigation() {
  const { state: navigation } = useStateSlice('navigation');
  const stateManager = getStateManager();
  
  const navigateTo = (route: string, module: string) => {
    stateManager.navigateTo(route, module);
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
export function useBusiness() {
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
export function useSystem() {
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
 * Composable específico para comunidad
 */
export function useComunidadState() {
  const { business, setBusiness } = useBusiness();
  const auth = useAuth();
  
  const setSelectedClub = (club: any) => {
    setBusiness({ selectedClub: club });
  };
  
  const getCurrentClub = () => {
    return business.selectedClub;
  };
  
  const addToSharedContent = (content: any) => {
    setBusiness({
      sharedContent: [...business.sharedContent, content]
    });
  };
  
  return {
    selectedClub: computed(() => business.selectedClub),
    currentUser: computed(() => auth.user.value),
    sharedContent: computed(() => business.sharedContent),
    setSelectedClub,
    getCurrentClub,
    addToSharedContent,
    isAuthenticated: computed(() => auth.isLoggedIn.value)
  };
}

/**
 * Composable para notificaciones específicas de comunidad
 */
export function useComunidadNotifications() {
  const { addNotification } = useUI();
  
  const notifyClubJoined = (clubName: string) => {
    addNotification({
      type: 'success',
      title: 'Te has unido al club',
      message: `Ahora eres miembro de ${clubName}`,
      actions: [{
        label: 'Ver',
        action: () => (window as any).shellServices.navigate('/comunidad/clubs')
      }]
    });
  };
  
  const notifyEventCreated = (eventName: string) => {
    addNotification({
      type: 'success',
      title: 'Evento creado',
      message: `${eventName} se ha creado correctamente`
    });
  };
  
  const notifyMessageReceived = (sender: string) => {
    addNotification({
      type: 'info',
      title: 'Nuevo mensaje',
      message: `${sender} te ha enviado un mensaje`
    });
  };
  
  const notifyError = (error: any, context: string = 'General') => {
    addNotification({
      type: 'error',
      title: `Error en ${context}`,
      message: error.message || 'Ha ocurrido un error inesperado'
    });
  };
  
  return {
    notifyClubJoined,
    notifyEventCreated,
    notifyMessageReceived,
    notifyError
  };
}

/**
 * Composable para actualizaciones en lote
 */
export function useBatchUpdate() {
  const stateManager = getStateManager();
  return (updates: any) => {
    stateManager.setBatch(updates);
  };
}

/**
 * Composable para sincronización con Pinia (si es necesario)
 */
export function usePiniaSync() {
  const globalState = useGlobalState();
  
  // Sincronizar con stores de Pinia si están disponibles
  const syncWithPinia = async () => {
    try {
      // Aquí iría la lógica de sincronización con Pinia
      console.log('🔄 Sincronizando con Pinia...', globalState);
    } catch (error) {
      console.error('Error sincronizando con Pinia:', error);
    }
  };
  
  return {
    syncWithPinia,
    globalState
  };
}

/**
 * Composable para debugging
 */
export function useStateDebug() {
  const state = useGlobalState();
  const stateManager = getStateManager();
  
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
    stateManager,
    logState: () => console.log('Current State:', stateManager.getState())
  };
}

// Función auxiliar para crear plugin Vue (opcional)
export function createStatePlugin() {
  return {
    install(app: any) {
      const stateManager = getStateManager();
      // Agregar propiedades globales si es necesario
      app.config.globalProperties.$stateManager = stateManager;
      app.config.globalProperties.$getState = () => stateManager.getState();
    }
  };
}
