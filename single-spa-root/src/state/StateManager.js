// src/state/StateManager.js
/**
 * Sistema de gestión de estado global mejorado para micro-frontends (Versión JS)
 */

export class StateManager {
  constructor(config = {}) {
    this.config = {
      persistence: {
        keys: ['auth', 'ui'],
        strategy: 'localStorage'
      },
      batchTimeout: 16, // ~60fps
      maxRetries: 3,
      enableDevtools: true,
      enableLogging: false,
      ...config
    };

    this.state = this.initializeState();
    this.listeners = new Map();
    this.globalListeners = new Set();
    this.pendingUpdates = new Map();
    this.batchTimer = null;
    this.STORAGE_PREFIX = 'plataforma_v2_';

    this.setupPersistence();
    this.setupDevtools();
    this.setupOnlineStatusTracking();
    this.startSyncLoop();
  }

  initializeState() {
    const defaultState = {
      auth: {
        user: null,
        isAuthenticated: false,
        token: null,
        refreshToken: null,
        lastLoginTime: null
      },
      ui: {
        theme: 'light',
        language: 'es',
        primaryColor: '#348e91',
        sidebarCollapsed: false,
        notifications: []
      },
      navigation: {
        currentRoute: '/',
        lastVisitedRoutes: [],
        breadcrumbs: [],
        activeModule: ''
      },
      business: {
        selectedArtist: null,
        selectedClub: null,
        monetizationContext: null,
        sharedContent: []
      },
      system: {
        onlineStatus: typeof navigator !== 'undefined' ? navigator.onLine : true,
        lastSyncTime: Date.now(),
        pendingActions: [],
        errorQueue: []
      }
    };

    return this.restorePersistedState(defaultState);
  }

  restorePersistedState(defaultState) {
    const restoredState = { ...defaultState };
    
    try {
      for (const key of this.config.persistence.keys) {
        const persistedData = this.getFromStorage(`${key}_state`);
        if (persistedData) {
          restoredState[key] = { ...defaultState[key], ...persistedData };
        }
      }
    } catch (error) {
      console.warn('Error restaurando estado persistido:', error);
    }

    return restoredState;
  }

  setupPersistence() {
    this.migrateOldData();
    
    this.config.persistence.keys.forEach(key => {
      this.subscribe(key, () => {
        this.persistStateKey(key);
      });
    });

    setInterval(() => {
      this.persistAll();
    }, 30000);
  }

  migrateOldData() {
    try {
      const oldUser = localStorage.getItem('plataforma_user');
      const oldAuth = localStorage.getItem('plataforma_authenticated');
      if (oldUser && oldAuth) {
        this.setState('auth', {
          user: JSON.parse(oldUser),
          isAuthenticated: oldAuth === 'true',
          lastLoginTime: Date.now()
        });
        localStorage.removeItem('plataforma_user');
        localStorage.removeItem('plataforma_authenticated');
      }

      const oldTheme = localStorage.getItem('plataforma_theme');
      const oldLanguage = localStorage.getItem('plataforma_language');
      if (oldTheme || oldLanguage) {
        this.setState('ui', {
          ...this.state.ui,
          theme: oldTheme || 'light',
          language: oldLanguage || 'es'
        });
        localStorage.removeItem('plataforma_theme');
        localStorage.removeItem('plataforma_language');
      }

      const oldRoutes = localStorage.getItem('plataforma_last_routes');
      if (oldRoutes) {
        this.setState('navigation', {
          ...this.state.navigation,
          lastVisitedRoutes: JSON.parse(oldRoutes)
        });
        localStorage.removeItem('plataforma_last_routes');
      }

    } catch (error) {
      console.warn('Error migrando datos antiguos:', error);
    }
  }

  getState(key) {
    return key ? this.state[key] : this.state;
  }

  setState(key, value) {
    const oldValue = this.state[key];
    const newValue = typeof value === 'function' ? value(oldValue) : value;
    
    this.state[key] = this.deepMerge(oldValue, newValue);
    
    this.pendingUpdates.set(key, { oldValue, newValue: this.state[key] });
    
    this.scheduleBatchFlush();
  }

  setBatch(updates) {
    Object.entries(updates).forEach(([key, value]) => {
      this.setState(key, value);
    });
  }

  subscribe(key, listener) {
    if (key === '*') {
      this.globalListeners.add(listener);
      return () => this.globalListeners.delete(listener);
    }

    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    
    this.listeners.get(key).add(listener);
    
    return () => {
      const keyListeners = this.listeners.get(key);
      if (keyListeners) {
        keyListeners.delete(listener);
        if (keyListeners.size === 0) {
          this.listeners.delete(key);
        }
      }
    };
  }

  login(user, token, refreshToken) {
    this.setState('auth', {
      user,
      token,
      refreshToken,
      isAuthenticated: true,
      lastLoginTime: Date.now()
    });
    
    this.addNotification({
      type: 'success',
      title: 'Bienvenido',
      message: `Hola ${user.name || user.email}!`
    });
  }

  logout() {
    this.setState('auth', {
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      lastLoginTime: null
    });
    
    this.clearFromStorage('auth_state');
    
    this.addNotification({
      type: 'info',
      title: 'Sesión cerrada',
      message: 'Has cerrado sesión correctamente'
    });
  }

  setTheme(theme) {
    this.setState('ui', { theme });
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }

  setLanguage(language) {
    this.setState('ui', { language });
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('lang', language);
    }
  }

  addNotification(notification) {
    const newNotification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      read: false
    };

    this.setState('ui', {
      notifications: [...this.state.ui.notifications, newNotification]
    });
  }

  markNotificationRead(id) {
    this.setState('ui', {
      notifications: this.state.ui.notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      )
    });
  }

  clearNotifications() {
    this.setState('ui', { notifications: [] });
  }

  navigateTo(route, module) {
    const navigation = this.state.navigation;
    const newRoutes = [route, ...navigation.lastVisitedRoutes.filter(r => r !== route)].slice(0, 10);
    
    this.setState('navigation', {
      currentRoute: route,
      activeModule: module,
      lastVisitedRoutes: newRoutes
    });
  }

  scheduleBatchFlush() {
    if (this.batchTimer) return;

    this.batchTimer = setTimeout(() => {
      this.flushPendingUpdates();
      this.batchTimer = null;
    }, this.config.batchTimeout);
  }

  flushPendingUpdates() {
    const updates = Array.from(this.pendingUpdates.entries());
    this.pendingUpdates.clear();

    updates.forEach(([key, { oldValue, newValue }]) => {
      this.notifyListeners(key, newValue, oldValue);
    });

    this.globalListeners.forEach(listener => {
      listener(this.state, this.state, '*');
    });
  }

  notifyListeners(key, newValue, oldValue) {
    const keyListeners = this.listeners.get(key);
    if (keyListeners) {
      keyListeners.forEach(listener => {
        try {
          listener(newValue, oldValue, key);
        } catch (error) {
          console.error(`Error en listener para ${key}:`, error);
        }
      });
    }
  }

  deepMerge(target, source) {
    if (source === null || source === undefined) return target;
    if (typeof source !== 'object') return source;
    if (Array.isArray(source)) return source;

    const result = { ...target };
    
    Object.keys(source).forEach(key => {
      if (target[key] && typeof target[key] === 'object' && !Array.isArray(target[key])) {
        result[key] = this.deepMerge(target[key], source[key]);
      } else {
        result[key] = source[key];
      }
    });

    return result;
  }

  persistStateKey(key) {
    try {
      this.saveToStorage(`${key}_state`, this.state[key]);
    } catch (error) {
      console.error(`Error persistiendo ${key}:`, error);
    }
  }

  persistAll() {
    this.config.persistence.keys.forEach(key => {
      this.persistStateKey(key);
    });
  }

  saveToStorage(key, value) {
    const serialized = JSON.stringify(value);
    
    switch (this.config.persistence.strategy) {
      case 'localStorage':
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(this.STORAGE_PREFIX + key, serialized);
        }
        break;
      case 'sessionStorage':
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem(this.STORAGE_PREFIX + key, serialized);
        }
        break;
    }
  }

  getFromStorage(key) {
    let serialized = null;
    
    switch (this.config.persistence.strategy) {
      case 'localStorage':
        if (typeof localStorage !== 'undefined') {
          serialized = localStorage.getItem(this.STORAGE_PREFIX + key);
        }
        break;
      case 'sessionStorage':
        if (typeof sessionStorage !== 'undefined') {
          serialized = sessionStorage.getItem(this.STORAGE_PREFIX + key);
        }
        break;
    }

    if (!serialized) return null;
    return JSON.parse(serialized);
  }

  clearFromStorage(key) {
    switch (this.config.persistence.strategy) {
      case 'localStorage':
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(this.STORAGE_PREFIX + key);
        }
        break;
      case 'sessionStorage':
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.removeItem(this.STORAGE_PREFIX + key);
        }
        break;
    }
  }

  setupDevtools() {
    if (!this.config.enableDevtools || typeof window === 'undefined') return;

    window.__PLATAFORMA_STATE__ = {
      getState: () => this.state,
      setState: this.setState.bind(this),
      subscribe: this.subscribe.bind(this),
      clearStorage: () => {
        this.config.persistence.keys.forEach(key => {
          this.clearFromStorage(`${key}_state`);
        });
      }
    };
  }

  setupOnlineStatusTracking() {
    if (typeof window !== 'undefined') {
      const updateOnlineStatus = () => {
        this.setState('system', { onlineStatus: navigator.onLine });
      };

      window.addEventListener('online', updateOnlineStatus);
      window.addEventListener('offline', updateOnlineStatus);
    }
  }

  startSyncLoop() {
    setInterval(() => {
      this.setState('system', { lastSyncTime: Date.now() });
    }, 5000);
  }

  destroy() {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
    }
    
    this.listeners.clear();
    this.globalListeners.clear();
    this.pendingUpdates.clear();
  }
}

let stateManagerInstance = null;

export function getStateManager(config) {
  if (!stateManagerInstance) {
    stateManagerInstance = new StateManager(config);
  }
  return stateManagerInstance;
}

export function createStateManager(config) {
  return new StateManager(config);
}
