import React from 'react';
import App from './App';
import './App.css';

// Declarar tipos para window
declare global {
  interface Window {
    singleSpaNavigate?: any;
  }
}

let reactRoot: any = null;

// Implementar lifecycle hooks manualmente
export const bootstrap = () => Promise.resolve();

export const mount = () => {
  console.log('🎵 Montando ArtistaSegundoParcial...');
  
  return new Promise((resolve) => {
    // Buscar el elemento donde montar la aplicación
    const container = document.getElementById('single-spa-application');
    if (!container) {
      console.error('❌ No se encontró el elemento single-spa-application');
      resolve(undefined);
      return;
    }

    console.log('✅ Elemento encontrado, montando aplicación...');
    
    // Usar React 18+ createRoot
    import('react-dom/client').then(({ createRoot }) => {
      reactRoot = createRoot(container);
      reactRoot.render(
        React.createElement(App)
      );
      console.log('🚀 ArtistaSegundoParcial montado exitosamente');
      resolve(undefined);
    }).catch((error) => {
      console.error('❌ Error montando ArtistaSegundoParcial:', error);
      resolve(undefined);
    });
  });
};

export const unmount = () => {
  console.log('🔄 Desmontando ArtistaSegundoParcial...');
  
  return new Promise((resolve) => {
    if (reactRoot) {
      reactRoot.unmount();
      reactRoot = null;
      console.log('✅ ArtistaSegundoParcial desmontado');
    }
    resolve(undefined);
  });
};

// Para desarrollo standalone
if (!window.singleSpaNavigate) {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    console.log('🚀 ArtistaSegundoParcial - Modo standalone');
    import('react-dom/client').then(({ createRoot }) => {
      const root = createRoot(rootElement);
      root.render(
        <React.StrictMode>
          <App />
        </React.StrictMode>
      );
    });
  }
} else {
  console.log('🎵 ArtistaSegundoParcial - Modo Single SPA');
}
