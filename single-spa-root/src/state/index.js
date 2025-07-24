// src/state/index.js
/**
 * Sistema de Estado Global - Punto de entrada principal (Versión JS)
 */

import { 
  StateManager, 
  getStateManager, 
  createStateManager
} from './StateManager.js';

// Instancia global singleton
const globalStateManager = getStateManager({
  enableDevtools: typeof process !== 'undefined' ? process.env.NODE_ENV === 'development' : true,
  enableLogging: typeof process !== 'undefined' ? process.env.NODE_ENV === 'development' : false,
  persistence: {
    keys: ['auth', 'ui', 'navigation'],
    strategy: 'localStorage'
  }
});

export { 
  StateManager, 
  getStateManager, 
  createStateManager,
  globalStateManager
};
