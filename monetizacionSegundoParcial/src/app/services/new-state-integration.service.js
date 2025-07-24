// monetizacionSegundoParcial/src/app/services/new-state-integration.service.js
/**
 * Nueva integración con el StateManager mejorado para Angular (versión JS)
 * Servicio simplificado que funciona sin problemas de TypeScript
 */

// Obtener StateManager del shell
const getStateManager = () => {
  if (typeof window !== 'undefined' && window.shellServices?.stateManager) {
    return window.shellServices.stateManager;
  }
  throw new Error('StateManager no disponible - ¿está corriendo en el shell?');
};

class NewStateIntegrationService {
  constructor() {
    this.stateManager = null;
    this.subscriptions = [];
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    
    try {
      this.stateManager = getStateManager();
      this.setupSubscriptions();
      this.migrateLegacyData();
      this.exposeToMonetizacionAPI();
      this.initialized = true;
      console.log('✅ NewStateIntegrationService inicializado');
    } catch (error) {
      console.warn('⚠️ StateManager no disponible, usando fallback:', error);
      this.setupFallback();
    }
  }

  setupSubscriptions() {
    if (!this.stateManager) return;

    // Suscribirse a cambios de business state
    const businessUnsubscribe = this.stateManager.subscribe('business', (business) => {
      console.log('📊 Business state actualizado:', business);
    });

    this.subscriptions.push(businessUnsubscribe);
  }

  setupFallback() {
    // Crear un StateManager mínimo si no está disponible
    this.stateManager = {
      getState: () => ({
        auth: { user: null, isAuthenticated: false },
        business: { monetizationContext: null, selectedArtist: null },
        ui: { notifications: [] }
      }),
      setState: () => {},
      subscribe: () => () => {},
      addNotification: () => {}
    };
  }

  // Métodos públicos para componentes
  setMonetizationContext(context) {
    if (this.stateManager) {
      this.stateManager.setState('business', { monetizationContext: context });
    }
  }

  getMonetizationContext() {
    if (this.stateManager) {
      return this.stateManager.getState('business').monetizationContext;
    }
    return null;
  }

  setSelectedArtist(artist) {
    if (this.stateManager) {
      this.stateManager.setState('business', { selectedArtist: artist });
    }
  }

  getSelectedArtist() {
    if (this.stateManager) {
      return this.stateManager.getState('business').selectedArtist;
    }
    return null;
  }

  getCurrentUser() {
    if (this.stateManager) {
      return this.stateManager.getState('auth').user;
    }
    return null;
  }

  isAuthenticated() {
    if (this.stateManager) {
      return this.stateManager.getState('auth').isAuthenticated;
    }
    return false;
  }

  addNotification(notification) {
    if (this.stateManager && this.stateManager.addNotification) {
      this.stateManager.addNotification(notification);
    }
  }

  // Métodos específicos para monetización
  notifyNewPayment(payment) {
    this.addNotification({
      type: 'success',
      title: 'Nuevo pago recibido',
      message: `Has recibido $${payment.amount} de ${payment.source}`
    });
  }

  notifySubscriptionCreated(subscription) {
    this.addNotification({
      type: 'success',
      title: 'Nueva suscripción',
      message: `${subscription.subscriber} se ha suscrito a tu contenido`
    });
  }

  notifyError(error, context = 'Monetización') {
    this.addNotification({
      type: 'error',
      title: `Error en ${context}`,
      message: error.message || 'Ha ocurrido un error inesperado'
    });
  }

  // Método para integración con APIs existentes
  exposeToMonetizacionAPI() {
    if (typeof window !== 'undefined' && window.monetizacionAPI) {
      const api = window.monetizacionAPI;
      
      // Agregar métodos mejorados
      api.state = {
        getContext: () => this.getMonetizationContext(),
        setContext: (context) => this.setMonetizationContext(context),
        getSelectedArtist: () => this.getSelectedArtist(),
        setSelectedArtist: (artist) => this.setSelectedArtist(artist),
        subscribe: (callback) => this.stateManager ? this.stateManager.subscribe('business', callback) : () => {},
        addNotification: (notification) => this.addNotification(notification)
      };
    }
  }

  // Método para migrar datos legacy
  migrateLegacyData() {
    const legacyKeys = [
      'monetizacion_context',
      'monetizacion_iframe_params',
      'selected_artist_data'
    ];

    legacyKeys.forEach(key => {
      const data = localStorage.getItem(key);
      if (data) {
        try {
          const parsed = JSON.parse(data);
          
          switch (key) {
            case 'monetizacion_context':
              this.setMonetizationContext(parsed);
              break;
            case 'selected_artist_data':
              this.setSelectedArtist(parsed);
              break;
          }
          
          // Limpiar datos legacy después de migrar
          localStorage.removeItem(key);
          
        } catch (error) {
          console.warn(`Error migrando ${key}:`, error);
        }
      }
    });
  }

  // Método para debug
  debugState() {
    console.log('🎭 Estado actual (Monetización):', {
      monetizationContext: this.getMonetizationContext(),
      selectedArtist: this.getSelectedArtist(),
      globalState: this.stateManager ? this.stateManager.getState() : 'No disponible'
    });
  }

  // Cleanup
  destroy() {
    this.subscriptions.forEach(unsubscribe => unsubscribe());
    this.subscriptions = [];
    this.initialized = false;
  }
}

// Crear instancia singleton
const stateIntegrationService = new NewStateIntegrationService();

// Inicializar automáticamente cuando esté disponible
if (typeof window !== 'undefined') {
  // Esperar a que el shell esté disponible
  const checkForShell = () => {
    if (window.shellServices?.stateManager) {
      stateIntegrationService.init();
    } else {
      setTimeout(checkForShell, 100);
    }
  };
  
  checkForShell();
}

// Exportar para uso en Angular
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { NewStateIntegrationService, stateIntegrationService };
}

// También hacer disponible globalmente
if (typeof window !== 'undefined') {
  window.NewStateIntegrationService = NewStateIntegrationService;
  window.stateIntegrationService = stateIntegrationService;
}
