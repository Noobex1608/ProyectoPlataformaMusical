// ComunidadSegundoParcial/src/composables/newStateIntegration.js
/**
 * Nueva integración con el StateManager mejorado para Vue 3
 * Reemplaza gradualmente a shellIntegration.js
 */

import { ref, computed, watch, onUnmounted, readonly } from 'vue';

// Obtener StateManager del shell
const getStateManager = () => {
  if (typeof window !== 'undefined' && window.shellServices?.stateManager) {
    return window.shellServices.stateManager;
  }
  throw new Error('StateManager no disponible - ¿está corriendo en el shell?');
};

// Crear integración Vue
function createVueIntegration(stateManager) {
  
  /**
   * Composable para acceder al StateManager
   */
  function useStateManager() {
    return stateManager;
  }

  /**
   * Composable para estado global reactivo
   */
  function useGlobalState() {
    const state = ref(stateManager.getState());
    
    const unsubscribe = stateManager.subscribe('*', (newState) => {
      state.value = newState;
    });
    
    onUnmounted(unsubscribe);
    
    return state;
  }

  /**
   * Composable para una slice específica del estado
   */
  function useStateSlice(key) {
    const slice = ref(stateManager.getState(key));
    
    const unsubscribe = stateManager.subscribe(key, (newValue) => {
      slice.value = newValue;
    });
    
    onUnmounted(unsubscribe);
    
    const setState = (value) => {
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
  function useAuth() {
    const { state: auth } = useStateSlice('auth');
    
    const login = (user, token, refreshToken) => {
      stateManager.login(user, token, refreshToken);
    };
    
    const logout = () => {
      stateManager.logout();
    };
    
    const isLoggedIn = computed(() => auth.value.isAuthenticated);
    
    return {
      auth,
      login,
      logout,
      isLoggedIn,
      user: computed(() => auth.value.user),
      token: computed(() => auth.value.token)
    };
  }

  /**
   * Composable para UI state
   */
  function useUI() {
    const { state: ui } = useStateSlice('ui');
    
    const setTheme = (theme) => {
      stateManager.setTheme(theme);
    };
    
    const setLanguage = (language) => {
      stateManager.setLanguage(language);
    };
    
    const addNotification = (notification) => {
      stateManager.addNotification(notification);
    };
    
    const markNotificationRead = (id) => {
      stateManager.markNotificationRead(id);
    };
    
    const clearNotifications = () => {
      stateManager.clearNotifications();
    };
    
    const unreadNotifications = computed(() => 
      ui.value.notifications.filter(n => !n.read)
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
      theme: computed(() => ui.value.theme),
      language: computed(() => ui.value.language),
      notifications: computed(() => ui.value.notifications)
    };
  }

  /**
   * Composable para navegación
   */
  function useNavigation() {
    const { state: navigation } = useStateSlice('navigation');
    
    const navigateTo = (route, module) => {
      stateManager.navigateTo(route, module);
    };
    
    return {
      navigation,
      navigateTo,
      currentRoute: computed(() => navigation.value.currentRoute),
      activeModule: computed(() => navigation.value.activeModule),
      breadcrumbs: computed(() => navigation.value.breadcrumbs),
      lastVisitedRoutes: computed(() => navigation.value.lastVisitedRoutes)
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
      selectedArtist: computed(() => business.value.selectedArtist),
      selectedClub: computed(() => business.value.selectedClub),
      monetizationContext: computed(() => business.value.monetizationContext),
      sharedContent: computed(() => business.value.sharedContent)
    };
  }

  /**
   * Composable para system state
   */
  function useSystem() {
    const { state: system } = useStateSlice('system');
    
    return {
      system: readonly(system),
      isOnline: computed(() => system.value.onlineStatus),
      lastSyncTime: computed(() => system.value.lastSyncTime),
      pendingActions: computed(() => system.value.pendingActions),
      errorQueue: computed(() => system.value.errorQueue)
    };
  }

  /**
   * Composable para escuchar cambios específicos
   */
  function useStateListener(key, callback) {
    const unsubscribe = stateManager.subscribe(key, callback);
    onUnmounted(unsubscribe);
    
    return unsubscribe;
  }

  /**
   * Composable para actualizaciones en lote
   */
  function useBatchUpdate() {
    return (updates) => {
      stateManager.setBatch(updates);
    };
  }

  /**
   * Composable para debugging
   */
  function useStateDebug() {
    const state = useGlobalState();
    
    watch(
      () => state.value,
      (newState) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔍 Vue Global State Updated:', newState);
        }
      },
      { deep: true }
    );
    
    return {
      state,
      manager: stateManager,
      logState: () => console.log('Current State:', stateManager.getState())
    };
  }

  return {
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
    useStateDebug
  };
}

// Crear instancia con StateManager
const stateManager = getStateManager();
const vueIntegration = createVueIntegration(stateManager);

// Exportar composables individuales para uso en componentes
export const useStateManager = vueIntegration.useStateManager;
export const useGlobalState = vueIntegration.useGlobalState;
export const useStateSlice = vueIntegration.useStateSlice;
export const useAuth = vueIntegration.useAuth;
export const useUI = vueIntegration.useUI;
export const useNavigation = vueIntegration.useNavigation;
export const useBusiness = vueIntegration.useBusiness;
export const useSystem = vueIntegration.useSystem;
export const useStateListener = vueIntegration.useStateListener;
export const useBatchUpdate = vueIntegration.useBatchUpdate;
export const useStateDebug = vueIntegration.useStateDebug;

// Composable específico para comunidad
export function useComunidadState() {
  const { business, setBusiness } = useBusiness();
  const auth = useAuth();
  
  const setSelectedClub = (club) => {
    setBusiness({ selectedClub: club });
  };
  
  const addToSharedContent = (content) => {
    setBusiness({
      sharedContent: [...business.value.sharedContent, content]
    });
  };
  
  const getCurrentClub = () => {
    return business.value.selectedClub;
  };
  
  return {
    selectedClub: computed(() => business.value.selectedClub),
    currentUser: computed(() => auth.user.value),
    sharedContent: computed(() => business.value.sharedContent),
    setSelectedClub,
    getCurrentClub,
    addToSharedContent,
    isAuthenticated: computed(() => auth.isLoggedIn.value)
  };
}

// Composable para notificaciones específicas de comunidad
export function useComunidadNotifications() {
  const { addNotification } = useUI();
  
  const notifyClubJoined = (clubName) => {
    addNotification({
      type: 'success',
      title: 'Te has unido al club',
      message: `Ahora eres miembro de ${clubName}`,
      actions: [{
        label: 'Ver club',
        action: () => window.shellServices.navigate('/comunidad/clubes')
      }]
    });
  };
  
  const notifyEventCreated = (eventName) => {
    addNotification({
      type: 'success',
      title: 'Evento creado',
      message: `${eventName} ha sido creado correctamente`
    });
  };
  
  const notifyNewMember = (memberName, clubName) => {
    addNotification({
      type: 'info',
      title: 'Nuevo miembro',
      message: `${memberName} se ha unido a ${clubName}`
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
    notifyClubJoined,
    notifyEventCreated,
    notifyNewMember,
    notifyError
  };
}

// Plugin para instalar en la app Vue
export const statePlugin = vueIntegration.plugin;
export const vState = vueIntegration.vStateDirective;

// Composable específico para comunidad
export function useComunidadState() {
  const [business, setBusiness] = useBusiness();
  const auth = useAuth();
  
  const setSelectedClub = (club) => {
    setBusiness({ selectedClub: club });
  };
  
  const addToSharedContent = (content) => {
    setBusiness({
      sharedContent: [...business.sharedContent, content]
    });
  };
  
  const getCurrentClub = () => {
    return business.selectedClub;
  };
  
  return {
    selectedClub: computed(() => business.selectedClub),
    currentUser: computed(() => auth.user),
    sharedContent: computed(() => business.sharedContent),
    setSelectedClub,
    getCurrentClub,
    addToSharedContent,
    isAuthenticated: computed(() => auth.isAuthenticated)
  };
}

// Composable para notificaciones específicas de comunidad
export function useComunidadNotifications() {
  const { addNotification } = useUI();
  
  const notifyClubJoined = (clubName) => {
    addNotification({
      type: 'success',
      title: 'Te has unido al club',
      message: `Ahora eres miembro de ${clubName}`,
      actions: [{
        label: 'Ver club',
        action: () => window.shellServices.navigate('/comunidad/clubes')
      }]
    });
  };
  
  const notifyEventCreated = (eventName) => {
    addNotification({
      type: 'success',
      title: 'Evento creado',
      message: `${eventName} ha sido creado correctamente`
    });
  };
  
  const notifyNewMember = (memberName, clubName) => {
    addNotification({
      type: 'info',
      title: 'Nuevo miembro',
      message: `${memberName} se ha unido a ${clubName}`
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
    notifyClubJoined,
    notifyEventCreated,
    notifyNewMember,
    notifyError
  };
}

// Composable para manejo de clubes con estado global
export function useClubesState() {
  const { business, setBusiness } = useBusiness();
  const auth = useAuth();
  const { notifyError, notifyClubJoined } = useComunidadNotifications();
  
  const clubes = ref([]);
  const loading = ref(false);
  const selectedClub = computed(() => business.selectedClub);
  
  const fetchClubes = async () => {
    loading.value = true;
    try {
      // Aquí iría la lógica de fetch real
      const data = await fetchClubesFromSupabase();
      clubes.value = data;
    } catch (error) {
      notifyError(error, 'Carga de clubes');
    } finally {
      loading.value = false;
    }
  };
  
  const selectClub = (club) => {
    setBusiness({ selectedClub: club });
  };
  
  const joinClub = async (clubId) => {
    try {
      if (!auth.isAuthenticated) {
        throw new Error('Debes estar autenticado para unirte a un club');
      }
      
      // Lógica de unirse al club
      await joinClubInSupabase(clubId, auth.user.id);
      
      const club = clubes.value.find(c => c.id === clubId);
      if (club) {
        notifyClubJoined(club.nombre);
      }
      
      // Actualizar lista de clubes
      await fetchClubes();
      
    } catch (error) {
      notifyError(error, 'Unirse al club');
    }
  };
  
  return {
    clubes: readonly(clubes),
    loading: readonly(loading),
    selectedClub,
    fetchClubes,
    selectClub,
    joinClub
  };
}

// Composable para sincronización con Pinia store existente
export function usePiniaSync() {
  const auth = useAuth();
  const batchUpdate = useBatchUpdate();
  
  // Import dinámico de Pinia store
  const syncToPinia = async () => {
    try {
      const { useUsuarioStore } = await import('../store/usuario');
      const usuarioStore = useUsuarioStore();
      
      if (auth.user) {
        usuarioStore.setUsuario(auth.user);
      }
    } catch (error) {
      console.warn('Error sincronizando con Pinia:', error);
    }
  };
  
  const syncFromPinia = async () => {
    try {
      const { useUsuarioStore } = await import('../store/usuario');
      const usuarioStore = useUsuarioStore();
      
      if (usuarioStore.usuario) {
        batchUpdate({
          auth: {
            user: usuarioStore.usuario,
            isAuthenticated: usuarioStore.isAuthenticated
          }
        });
      }
    } catch (error) {
      console.warn('Error sincronizando desde Pinia:', error);
    }
  };
  
  return {
    syncToPinia,
    syncFromPinia
  };
}

// Funciones auxiliares (simuladas)
async function fetchClubesFromSupabase() {
  // Aquí iría la llamada real a Supabase
  return [
    { id: 1, nombre: 'Club de Rock', miembros: 50 },
    { id: 2, nombre: 'Club de Jazz', miembros: 30 }
  ];
}

async function joinClubInSupabase(clubId, userId) {
  // Aquí iría la llamada real a Supabase
  console.log(`Usuario ${userId} se une al club ${clubId}`);
}
