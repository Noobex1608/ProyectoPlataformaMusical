/**
 * 🌐 Integración del módulo ComunidadSegundoParcial con Shell Services
 * 
 * Plugin de Vue para integrar con los servicios centralizados del shell
 */

import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';

/**
 * Composable para usar shell services en Vue
 */
export function useShellServices() {
  const shellServices = window.shellServices;
  
  if (!shellServices) {
    console.warn('⚠️  Shell services no disponibles');
    return null;
  }
  
  return shellServices;
}

/**
 * Composable para autenticación
 */
export function useAuth() {
  const shellServices = useShellServices();
  const authState = reactive({
    isAuthenticated: false,
    user: null,
    loading: true
  });

  let unsubscribe = null;

  onMounted(() => {
    if (!shellServices?.auth) {
      authState.loading = false;
      return;
    }

    // Estado inicial
    const initialState = shellServices.auth.getAuthState();
    Object.assign(authState, {
      isAuthenticated: initialState.isAuthenticated,
      user: initialState.user,
      loading: false
    });

    // Suscribirse a cambios
    unsubscribe = shellServices.auth.subscribe((newState) => {
      Object.assign(authState, {
        isAuthenticated: newState.isAuthenticated,
        user: newState.user,
        loading: false
      });
    });
  });

  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe();
    }
  });

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
    authState,
    login,
    logout,
    isAuthenticated: computed(() => authState.isAuthenticated),
    user: computed(() => authState.user),
    loading: computed(() => authState.loading)
  };
}

/**
 * Composable para tema
 */
export function useTheme() {
  const shellServices = useShellServices();
  const theme = ref('light');
  
  let unsubscribe = null;

  onMounted(() => {
    if (!shellServices?.globalState) return;

    const currentState = shellServices.globalState.getState();
    theme.value = currentState.theme || 'light';

    unsubscribe = shellServices.globalState.subscribe((state) => {
      if (state.theme) {
        theme.value = state.theme;
      }
    });
  });

  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe();
    }
  });

  const toggleTheme = () => {
    const newTheme = theme.value === 'light' ? 'dark' : 'light';
    if (shellServices?.globalState) {
      shellServices.globalState.updateState({ theme: newTheme });
    }
  };

  return {
    theme: computed(() => theme.value),
    toggleTheme
  };
}

/**
 * Composable para navegación entre módulos
 */
export function useNavigation() {
  const navigateToModule = (path, state = {}) => {
    if (window.navigateToModule) {
      window.navigateToModule(path, state);
    } else {
      window.location.href = path;
    }
  };

  const navigateToArtist = () => navigateToModule('/artista-v2');
  const navigateToMonetization = () => navigateToModule('/monetizacion-v2');
  const navigateToCommunity = () => navigateToModule('/comunidad-v2');

  return {
    navigateToModule,
    navigateToArtist,
    navigateToMonetization,
    navigateToCommunity
  };
}

/**
 * Plugin de Vue para shell services
 */
export default {
  install(app, options = {}) {
    console.log('🔌 Instalando plugin de Shell Services para Vue...');

    // Propiedades globales
    app.config.globalProperties.$shellServices = window.shellServices;
    app.config.globalProperties.$navigateToModule = (path, state) => {
      if (window.navigateToModule) {
        window.navigateToModule(path, state);
      }
    };

    // Inicializar integración
    const initializeIntegration = async () => {
      try {
        if (window.shellServices?.globalState) {
          window.shellServices.globalState.registerModule('comunidad-v2', {
            framework: 'Vue',
            version: '2.0',
            status: 'initialized',
            features: ['social', 'posts', 'comentarios', 'grupos'],
            timestamp: new Date().toISOString()
          });
        }

        console.log('✅ Vue integrado con shell services');
      } catch (error) {
        console.error('❌ Error inicializando integración Vue:', error);
      }
    };

    // Inicializar cuando la app se monte
    app.mixin({
      async mounted() {
        if (this.$options.name === 'App') {
          await initializeIntegration();
        }
      }
    });

    // Provide/inject para composables
    app.provide('shellServices', window.shellServices);
  }
};

/**
 * Componente de ejemplo: Header autenticado
 */
export const AuthenticatedHeader = {
  name: 'AuthenticatedHeader',
  setup() {
    const { isAuthenticated, user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { navigateToModule } = useNavigation();

    const handleLogin = () => {
      navigateToModule('/login');
    };

    return {
      isAuthenticated,
      user,
      logout,
      theme,
      toggleTheme,
      handleLogin
    };
  },
  template: `
    <header class="community-header" :class="{ authenticated: isAuthenticated }">
      <h1 v-if="!isAuthenticated">Comunidad Musical</h1>
      <h1 v-else>Hola, {{ user?.name || 'Usuario' }}</h1>
      
      <div class="header-actions" v-if="!isAuthenticated">
        <button @click="handleLogin" class="login-btn">
          Iniciar Sesión
        </button>
      </div>
      
      <div class="header-actions" v-else>
        <button @click="toggleTheme" class="theme-toggle">
          {{ theme === 'light' ? '🌙' : '☀️' }} {{ theme }}
        </button>
        <button @click="logout" class="logout-btn">
          Cerrar Sesión
        </button>
      </div>
    </header>
  `,
  style: `
    <style scoped>
    .community-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 2rem;
      background: var(--header-bg, #f8f9fa);
      border-bottom: 1px solid var(--border-color, #dee2e6);
      transition: all 0.3s ease;
    }
    
    .authenticated {
      background: var(--primary-color, #28a745);
      color: white;
    }
    
    .header-actions {
      display: flex;
      gap: 1rem;
      align-items: center;
    }
    
    .theme-toggle, .logout-btn, .login-btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 0.9rem;
    }
    
    .login-btn {
      background: var(--primary-color, #007bff);
      color: white;
    }
    
    .theme-toggle {
      background: rgba(255, 255, 255, 0.2);
      color: white;
    }
    
    .logout-btn {
      background: rgba(255, 255, 255, 0.1);
      color: white;
    }
    
    .theme-toggle:hover, .logout-btn:hover, .login-btn:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: translateY(-1px);
    }
    </style>
  `
};

/**
 * Componente de navegación entre módulos
 */
export const ModuleNavigation = {
  name: 'ModuleNavigation',
  setup() {
    const { navigateToArtist, navigateToMonetization, navigateToCommunity } = useNavigation();
    const { theme } = useTheme();

    return {
      navigateToArtist,
      navigateToMonetization,
      navigateToCommunity,
      theme
    };
  },
  template: `
    <nav class="module-navigation" :data-theme="theme">
      <button @click="navigateToCommunity" class="nav-btn active">
        🌐 Comunidad
      </button>
      <button @click="navigateToArtist" class="nav-btn">
        🎸 Artista
      </button>
      <button @click="navigateToMonetization" class="nav-btn">
        💰 Monetización
      </button>
    </nav>
  `,
  style: `
    <style scoped>
    .module-navigation {
      display: flex;
      gap: 0.5rem;
      padding: 1rem;
      background: var(--nav-bg, #ffffff);
      border-bottom: 1px solid var(--border-color, #dee2e6);
    }
    
    .nav-btn {
      padding: 0.75rem 1.5rem;
      border: 1px solid var(--border-color, #dee2e6);
      border-radius: 6px;
      background: var(--btn-bg, #ffffff);
      color: var(--text-color, #212529);
      cursor: pointer;
      transition: all 0.2s;
      font-size: 0.9rem;
      font-weight: 500;
    }
    
    .nav-btn:hover {
      background: var(--btn-hover-bg, #f8f9fa);
      border-color: var(--primary-color, #007bff);
      transform: translateY(-1px);
    }
    
    .nav-btn.active {
      background: var(--primary-color, #28a745);
      color: white;
      border-color: var(--primary-color, #28a745);
    }
    
    /* Tema oscuro */
    [data-theme="dark"] .module-navigation {
      --nav-bg: #343a40;
      --btn-bg: #495057;
      --btn-hover-bg: #6c757d;
      --text-color: #ffffff;
      --border-color: #6c757d;
    }
    </style>
  `
};

/**
 * CSS global para la integración de Vue
 */
export const vueShellStyles = `
  /* Variables CSS para Vue + Shell */
  [data-theme="light"] {
    --primary-color: #28a745;
    --secondary-color: #6c757d;
    --background-color: #ffffff;
    --text-color: #212529;
    --border-color: #dee2e6;
    --header-bg: #f8f9fa;
    --nav-bg: #ffffff;
    --btn-bg: #ffffff;
    --btn-hover-bg: #f8f9fa;
  }
  
  [data-theme="dark"] {
    --primary-color: #34ce57;
    --secondary-color: #6c757d;
    --background-color: #212529;
    --text-color: #ffffff;
    --border-color: #495057;
    --header-bg: #343a40;
    --nav-bg: #343a40;
    --btn-bg: #495057;
    --btn-hover-bg: #6c757d;
  }
  
  /* Transiciones globales */
  * {
    transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
  }
  
  /* Estilos base para la aplicación Vue */
  .vue-app {
    background: var(--background-color);
    color: var(--text-color);
    min-height: 100vh;
  }
`;
