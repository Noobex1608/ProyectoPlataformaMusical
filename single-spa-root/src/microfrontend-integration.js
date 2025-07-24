/**
 * 🔗 Integración de Microfrontends con Shell Services
 * 
 * Este archivo proporciona utilidades para que los microfrontends
 * se integren con los servicios centralizados del shell.
 */

export class MicrofrontendIntegration {
  constructor(moduleName, framework) {
    this.moduleName = moduleName;
    this.framework = framework;
    this.shellServices = window.shellServices;
    this.isInitialized = false;
    
    if (!this.shellServices) {
      console.warn(`⚠️  Shell services no disponibles para ${moduleName}`);
    }
  }

  /**
   * Inicializa la integración con el shell
   */
  async initialize() {
    if (this.isInitialized) return;
    
    try {
      // Registrar el módulo en el estado global
      if (this.shellServices?.globalState) {
        this.shellServices.globalState.registerModule(this.moduleName, {
          framework: this.framework,
          status: 'initializing',
          timestamp: new Date().toISOString()
        });
      }

      // Configurar autenticación
      await this.setupAuthentication();
      
      // Configurar tema y configuraciones globales
      this.setupTheme();
      
      // Configurar navegación
      this.setupNavigation();
      
      this.isInitialized = true;
      console.log(`✅ ${this.moduleName} integrado con shell services`);
      
    } catch (error) {
      console.error(`❌ Error inicializando ${this.moduleName}:`, error);
    }
  }

  /**
   * Configura la autenticación del módulo
   */
  async setupAuthentication() {
    if (!this.shellServices?.auth) return;

    // Obtener estado de autenticación actual
    const authState = this.shellServices.auth.getAuthState();
    
    if (authState.isAuthenticated) {
      console.log(`🔐 Usuario autenticado en ${this.moduleName}:`, authState.user);
      
      // Configurar headers para requests
      this.setupAuthHeaders(authState.token);
    }

    // Suscribirse a cambios de autenticación
    this.shellServices.auth.subscribe((newAuthState) => {
      console.log(`🔄 Cambio de auth en ${this.moduleName}:`, newAuthState);
      
      if (newAuthState.isAuthenticated) {
        this.setupAuthHeaders(newAuthState.token);
        this.onUserLogin(newAuthState.user);
      } else {
        this.onUserLogout();
      }
    });
  }

  /**
   * Configura headers de autenticación para requests
   */
  setupAuthHeaders(token) {
    // Para React/Axios
    if (window.axios) {
      window.axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    
    // Para fetch global
    const originalFetch = window.fetch;
    window.fetch = (url, options = {}) => {
      if (!options.headers) {
        options.headers = {};
      }
      if (!options.headers['Authorization']) {
        options.headers['Authorization'] = `Bearer ${token}`;
      }
      return originalFetch(url, options);
    };
  }

  /**
   * Configura el tema del módulo
   */
  setupTheme() {
    if (!this.shellServices?.globalState) return;

    const currentTheme = this.shellServices.globalState.getState().theme;
    this.applyTheme(currentTheme);

    // Suscribirse a cambios de tema
    this.shellServices.globalState.subscribe((state) => {
      if (state.theme) {
        this.applyTheme(state.theme);
      }
    });
  }

  /**
   * Aplica un tema al módulo
   */
  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    
    // Para frameworks específicos
    switch (this.framework) {
      case 'React':
        if (window.React && this.onThemeChange) {
          this.onThemeChange(theme);
        }
        break;
      case 'Vue':
        if (window.Vue && this.vueApp) {
          this.vueApp.config.globalProperties.$theme = theme;
        }
        break;
      case 'Angular':
        // Angular manejará el tema a través de CSS variables
        break;
    }
    
    console.log(`🎨 Tema ${theme} aplicado a ${this.moduleName}`);
  }

  /**
   * Configura la navegación entre módulos
   */
  setupNavigation() {
    if (!this.shellServices?.globalState) return;

    // Crear función de navegación global
    window.navigateToModule = (modulePath, state = {}) => {
      this.shellServices.globalState.updateState({
        currentRoute: modulePath,
        navigationState: state
      });
      
      // Usar single-spa navigation
      if (window.singleSpa) {
        window.singleSpa.navigateToUrl(modulePath);
      } else {
        window.location.href = modulePath;
      }
    };
  }

  /**
   * Métodos de callback para eventos de autenticación
   */
  onUserLogin(user) {
    console.log(`👤 Usuario logueado en ${this.moduleName}:`, user);
    // Override en el módulo específico
  }

  onUserLogout() {
    console.log(`👋 Usuario deslogueado de ${this.moduleName}`);
    // Limpiar estado local del módulo
    if (window.localStorage) {
      // Mantener solo datos esenciales
      const keysToKeep = ['theme', 'language'];
      const tempStorage = {};
      
      keysToKeep.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) tempStorage[key] = value;
      });
      
      localStorage.clear();
      
      Object.keys(tempStorage).forEach(key => {
        localStorage.setItem(key, tempStorage[key]);
      });
    }
  }

  /**
   * Obtiene configuración compartida
   */
  getSharedConfig() {
    if (!this.shellServices?.globalState) return {};
    
    const state = this.shellServices.globalState.getState();
    return {
      theme: state.theme,
      language: state.language,
      user: this.shellServices.auth?.getAuthState()?.user,
      apiBaseUrl: state.apiBaseUrl || 'https://nkwklpjcdlhilhqycmoo.supabase.co'
    };
  }

  /**
   * Reporta errores al shell
   */
  reportError(error, context = {}) {
    console.error(`❌ Error en ${this.moduleName}:`, error);
    
    if (this.shellServices?.globalState) {
      this.shellServices.globalState.updateState({
        lastError: {
          module: this.moduleName,
          error: error.message || error,
          context,
          timestamp: new Date().toISOString()
        }
      });
    }
  }

  /**
   * Limpia la integración al desmontar el módulo
   */
  cleanup() {
    if (this.shellServices?.auth && this.authUnsubscribe) {
      this.authUnsubscribe();
    }
    
    if (this.shellServices?.globalState && this.stateUnsubscribe) {
      this.stateUnsubscribe();
    }
    
    console.log(`🧹 ${this.moduleName} limpiado correctamente`);
  }
}

/**
 * Factory function para crear integración específica por framework
 */
export function createMicrofrontendIntegration(moduleName, framework, options = {}) {
  const integration = new MicrofrontendIntegration(moduleName, framework);
  
  // Configuraciones específicas por framework
  switch (framework) {
    case 'React':
      return createReactIntegration(integration, options);
    case 'Vue':
      return createVueIntegration(integration, options);
    case 'Angular':
      return createAngularIntegration(integration, options);
    default:
      return integration;
  }
}

/**
 * Integración específica para React
 */
function createReactIntegration(integration, options) {
  integration.onThemeChange = (theme) => {
    // Trigger React re-renders when theme changes
    if (options.themeCallback) {
      options.themeCallback(theme);
    }
  };
  
  return integration;
}

/**
 * Integración específica para Vue
 */
function createVueIntegration(integration, options) {
  integration.vueApp = options.app;
  
  return integration;
}

/**
 * Integración específica para Angular
 */
function createAngularIntegration(integration, options) {
  // Angular-specific integration logic
  return integration;
}

// Export por defecto
export default MicrofrontendIntegration;
