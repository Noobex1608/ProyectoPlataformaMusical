import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';

// Declarar tipos para window
declare global {
  interface Window {
    singleSpaNavigate?: any;
  }
}

// Variable para almacenar la referencia de la aplicación
let appRef: any = null;

// Lifecycle hooks para Single SPA
export async function bootstrap() {
  console.log('💰 Bootstrap MonetizacionSegundoParcial');
  return Promise.resolve();
}

export async function mount() {
  console.log('💰 Montando MonetizacionSegundoParcial...');
  
  // Buscar el contenedor donde montar la aplicación
  let container = document.getElementById('single-spa-application');
  if (!container) {
    container = document.getElementById('app');
  }
  if (!container) {
    container = document.body;
  }

  // Crear un div específico para esta aplicación Angular
  const appDiv = document.createElement('div');
  appDiv.id = 'monetizacion-angular-app';
  container.innerHTML = ''; // Limpiar contenido anterior
  container.appendChild(appDiv);

  try {
    // Bootstrapear la aplicación Angular usando createApplication y mount
    const { createApplication } = await import('@angular/platform-browser');
    const app = await createApplication();
    
    // Crear y montar el componente raíz
    const { createComponent, EnvironmentInjector } = await import('@angular/core');
    const componentRef = createComponent(AppComponent, {
      environmentInjector: app.injector,
      hostElement: appDiv
    });

    appRef = { componentRef, app };
    console.log('✅ MonetizacionSegundoParcial montado exitosamente');
    return Promise.resolve();
  } catch (error) {
    console.error('❌ Error montando MonetizacionSegundoParcial:', error);
    return Promise.reject(error);
  }
}

export async function unmount() {
  console.log('🔄 Desmontando MonetizacionSegundoParcial...');
  
  if (appRef) {
    try {
      if (appRef.componentRef) {
        appRef.componentRef.destroy();
      }
      if (appRef.app) {
        appRef.app.destroy();
      }
      appRef = null;
      console.log('✅ MonetizacionSegundoParcial desmontado');
    } catch (error) {
      console.error('❌ Error desmontando MonetizacionSegundoParcial:', error);
    }
  }
  
  // Limpiar el contenedor
  const container = document.getElementById('single-spa-application');
  if (container) {
    container.innerHTML = '';
  }
  
  return Promise.resolve();
}

// Para desarrollo standalone (cuando no está dentro de Single SPA)
if (typeof window !== 'undefined' && !window.singleSpaNavigate) {
  console.log('🚀 MonetizacionSegundoParcial - Modo standalone');
  bootstrapApplication(AppComponent).catch(err => console.error(err));
} else if (typeof window !== 'undefined') {
  console.log('💰 MonetizacionSegundoParcial - Modo Single SPA');
}