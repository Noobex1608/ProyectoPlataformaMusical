// Este archivo sirve como punto de entrada para Single SPA
// Importa y reexporta los lifecycle hooks de la aplicación Angular

import('./src/main.js')
  .then(module => {
    // Reexportar los lifecycle hooks
    window.monetizacionApp = module;
    
    if (module.bootstrap) {
      window.monetizacionBootstrap = module.bootstrap;
    }
    if (module.mount) {
      window.monetizacionMount = module.mount;
    }
    if (module.unmount) {
      window.monetizacionUnmount = module.unmount;
    }
    
    console.log('💰 Módulo MonetizacionSegundoParcial cargado y expuesto globalmente');
  })
  .catch(error => {
    console.error('❌ Error cargando módulo MonetizacionSegundoParcial:', error);
  });
