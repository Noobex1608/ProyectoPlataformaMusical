// === ESTADO GLOBAL COMPARTIDO ===
import authService from './auth.js';

export class GlobalStateManager {
  constructor() {
    this.state = {
      // Estado de autenticación
      user: null,
      isAuthenticated: false,
      
      // Estado de la aplicación
      theme: 'default',
      language: 'es',
      currentRoute: '/',
      isLoading: false,
      
      // Estado de navegación
      activeModule: null,
      lastVisitedRoutes: {},
      
      // Configuración global
      apiBaseUrl: 'https://zinlehynftfhixbuobmb.supabase.co',
      environment: 'development'
    };
    
    this.listeners = new Set();
    this.initialize();
  }

  // Inicializar el estado global
  initialize() {
    // Suscribirse a cambios de autenticación
    authService.subscribe((authState) => {
      this.updateState({
        user: authState.user,
        isAuthenticated: authState.isAuthenticated
      });
    });

    // Cargar estado persistente
    this.loadPersistedState();
    
    // Escuchar cambios de ruta
    this.setupRouteListener();
    
    console.log('🌐 Estado global inicializado:', this.state);
  }

  // Cargar estado persistente del localStorage
  loadPersistedState() {
    try {
      const persistedTheme = localStorage.getItem('plataforma_theme');
      const persistedLanguage = localStorage.getItem('plataforma_language');
      const persistedRoutes = localStorage.getItem('plataforma_last_routes');
      
      if (persistedTheme) {
        this.state.theme = persistedTheme;
      }
      
      if (persistedLanguage) {
        this.state.language = persistedLanguage;
      }
      
      if (persistedRoutes) {
        this.state.lastVisitedRoutes = JSON.parse(persistedRoutes);
      }
      
    } catch (error) {
      console.error('❌ Error cargando estado persistente:', error);
    }
  }

  // Configurar listener de rutas
  setupRouteListener() {
    // Detectar cambios de ruta en Single-SPA
    window.addEventListener('single-spa:routing-event', (event) => {
      const newRoute = window.location.pathname;
      this.updateState({ 
        currentRoute: newRoute,
        activeModule: this.detectActiveModule(newRoute)
      });
      
      // Guardar última ruta visitada por módulo
      const module = this.detectActiveModule(newRoute);
      if (module) {
        this.state.lastVisitedRoutes[module] = newRoute;
        localStorage.setItem('plataforma_last_routes', JSON.stringify(this.state.lastVisitedRoutes));
      }
    });
  }

  // Detectar qué módulo está activo basado en la ruta
  detectActiveModule(route) {
    if (route.startsWith('/artista-v2')) return 'artista';
    if (route.startsWith('/monetizacion-v2')) return 'monetizacion';
    if (route.startsWith('/comunidad-v2')) return 'comunidad';
    if (route === '/' || 
        route.startsWith('/dashboard') || 
        route.startsWith('/perfil') || 
        route.startsWith('/clubes') ||
        route.startsWith('/club/')) return 'comunidad';
    return null;
  }

  // Actualizar estado global
  updateState(newState) {
    const oldState = { ...this.state };
    this.state = { ...this.state, ...newState };
    
    // Notificar a listeners solo si hubo cambios
    if (JSON.stringify(oldState) !== JSON.stringify(this.state)) {
      this.notifyListeners(this.state, oldState);
    }
  }

  // Obtener estado actual
  getState() {
    return { ...this.state };
  }

  // Obtener valor específico del estado
  getValue(key) {
    return this.state[key];
  }

  // Suscribirse a cambios de estado
  subscribe(callback) {
    this.listeners.add(callback);
    
    // Llamar inmediatamente con el estado actual
    callback(this.state);
    
    // Retornar función para desuscribirse
    return () => {
      this.listeners.delete(callback);
    };
  }

  // Notificar a todos los listeners
  notifyListeners(newState, oldState) {
    this.listeners.forEach(callback => {
      try {
        callback(newState, oldState);
      } catch (error) {
        console.error('❌ Error en listener de estado global:', error);
      }
    });

    // También disparar evento global para compatibilidad
    window.dispatchEvent(new CustomEvent('globalStateChange', { 
      detail: { newState, oldState }
    }));
  }

  // Métodos de conveniencia para acciones comunes
  setTheme(theme) {
    this.updateState({ theme });
    localStorage.setItem('plataforma_theme', theme);
    
    // Aplicar tema al documento
    document.documentElement.setAttribute('data-theme', theme);
  }

  setLanguage(language) {
    this.updateState({ language });
    localStorage.setItem('plataforma_language', language);
  }

  setLoading(isLoading) {
    this.updateState({ isLoading });
  }

  // Método para que los microfrontends se registren
  registerModule(moduleName, moduleInfo) {
    console.log(`📦 Módulo registrado: ${moduleName}`, moduleInfo);
    
    // Podrías expandir esto para trackear módulos activos
    this.updateState({
      [`module_${moduleName}`]: {
        ...moduleInfo,
        registeredAt: new Date().toISOString()
      }
    });
  }

  // Método para debugging
  debug() {
    console.log('🐛 Estado global actual:', this.state);
    console.log('🐛 Listeners activos:', this.listeners.size);
    console.log('🐛 Usuario autenticado:', authService.isUserAuthenticated());
  }
}

// === SINGLETON PARA EXPORTAR ===
const globalState = new GlobalStateManager();
export default globalState;

// === UTILIDADES PARA MICROFRONTENDS ===
export const useGlobalState = () => {
  return {
    getState: () => globalState.getState(),
    getValue: (key) => globalState.getValue(key),
    updateState: (newState) => globalState.updateState(newState),
    subscribe: (callback) => globalState.subscribe(callback),
    setTheme: (theme) => globalState.setTheme(theme),
    setLanguage: (language) => globalState.setLanguage(language),
    setLoading: (isLoading) => globalState.setLoading(isLoading)
  };
};
