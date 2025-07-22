import { registerApplication, start, navigateToUrl } from 'single-spa';

// Función para manejar la visibilidad del navbar (simplificada)
function toggleNavbar(show) {
  // No necesitamos hacer nada ya que el navbar siempre está oculto
  // Mantener la función por compatibilidad
}

// Configuración de los microfrontends
const microfrontends = [
  {
    name: '@plataforma/artista',
    app: () => import('http://localhost:5173/src/main.js'),
    activeWhen: ['/artista'],
    customProps: {
      domElement: '#single-spa-application',
      hideNavbar: true
    }
  },
  {
    name: '@plataforma/artista-segundo-parcial',
    app: () => {
      console.log('🎸 Cargando ArtistaSegundoParcial...');
      return import('http://localhost:5178/src/main.js')
        .then(module => {
          console.log('✅ ArtistaSegundoParcial cargado:', module);
          return module;
        })
        .catch(error => {
          console.error('❌ Error cargando ArtistaSegundoParcial:', error);
          throw error;
        });
    },
    activeWhen: ['/artista-v2'],
    customProps: {
      domElement: '#single-spa-application',
      hideNavbar: true
    }
  },
  {
    name: '@plataforma/comunidad',
    app: () => import('http://localhost:5174/src/main.js'),
    activeWhen: ['/comunidad'],
    customProps: {
      domElement: '#single-spa-application',
      hideNavbar: true
    }
  },
  {
    name: '@plataforma/comunidad-segundo-parcial',
    app: () => {
      console.log('🚀 Cargando microfrontend ComunidadSegundoParcial como HOME');
      return import('http://localhost:5175/src/main.ts').catch(error => {
        console.error('❌ Error cargando ComunidadSegundoParcial:', error);
        return Promise.reject(error);
      });
    },
    activeWhen: [
      (location) => {
        const path = location.pathname;
        console.log('🔍 Evaluando ruta para ComunidadSegundoParcial:', path);
        
        // Solo activar ComunidadSegundoParcial para rutas específicas
        const shouldActivate = path === '/' || 
               path.startsWith('/dashboard') || 
               path.startsWith('/perfil') || 
               path.startsWith('/playlist') || 
               path.startsWith('/radio') || 
               path.startsWith('/clubes') ||
               path.startsWith('/login') ||
               path.startsWith('/registro') ||
               path.startsWith('/user-type-selection') ||
               path.startsWith('/login-tipo') ||
               path.startsWith('/monetizacion-selector') || // Nueva ruta para el selector de monetización
               (path.startsWith('/comunidad') && !path.startsWith('/comunidad-v2'));
               
        console.log('🎯 ComunidadSegundoParcial activo:', shouldActivate);
        return shouldActivate;
      }
    ], // HOME y rutas específicas de ComunidadSegundoParcial
    customProps: {
      domElement: '#single-spa-application',
      hideNavbar: true
    }
  },
  {
    name: '@plataforma/monetizacion-segundo-parcial',
    app: () => {
      console.log('💰 Cargando MonetizacionSegundoParcial...');
      
      // Para Angular, necesitamos una forma diferente de cargar el módulo
      return new Promise(async (resolve, reject) => {
        try {
          // Primero verificar si la aplicación está corriendo
          const response = await fetch('http://localhost:5179');
          if (!response.ok) {
            throw new Error('Servidor Angular no disponible en puerto 5179');
          }
          
          // Cargar el módulo usando un hack para Angular
          const monetizacionModule = {
            bootstrap: () => {
              console.log('� Bootstrap MonetizacionSegundoParcial');
              return Promise.resolve();
            },
            mount: async () => {
              console.log('💰 Montando MonetizacionSegundoParcial...');
              
              // Buscar el contenedor
              let container = document.getElementById('single-spa-application');
              if (!container) {
                container = document.body;
              }
              
              // Leer parámetros del localStorage
              const contextData = localStorage.getItem('monetizacion_context');
              const iframeParams = localStorage.getItem('monetizacion_iframe_params');
              
              let iframeUrl = 'http://localhost:5179';
              
              // Si hay parámetros guardados, agregarlos a la URL del iframe
              if (iframeParams) {
                iframeUrl += '?' + iframeParams;
                console.log('🔗 URL del iframe con parámetros:', iframeUrl);
              }
              
              if (contextData) {
                console.log('📦 Contexto encontrado para iframe:', JSON.parse(contextData));
              }
              
              // Crear iframe para la aplicación Angular
              const iframe = document.createElement('iframe');
              iframe.src = iframeUrl;
              iframe.style.width = '100%';
              iframe.style.height = '100vh';
              iframe.style.border = 'none';
              iframe.id = 'monetizacion-iframe';
              
              container.innerHTML = '';
              container.appendChild(iframe);
              
              console.log('✅ MonetizacionSegundoParcial montado en iframe con URL:', iframeUrl);
              return Promise.resolve();
            },
            unmount: () => {
              console.log('🔄 Desmontando MonetizacionSegundoParcial...');
              const iframe = document.getElementById('monetizacion-iframe');
              if (iframe) {
                iframe.remove();
              }
              
              // Limpiar completamente el contenedor
              const container = document.getElementById('single-spa-application');
              if (container) {
                container.innerHTML = '';
              }
              
              console.log('✅ MonetizacionSegundoParcial desmontado');
              return Promise.resolve();
            }
          };
          
          console.log('✅ MonetizacionSegundoParcial configurado');
          resolve(monetizacionModule);
          
        } catch (error) {
          console.error('❌ Error configurando MonetizacionSegundoParcial:', error);
          reject(error);
        }
      });
    },
    activeWhen: ['/monetizacion-v2', '/monetizacion'],
    customProps: {
      domElement: '#single-spa-application',
      hideNavbar: true
    }
  }
];

// Registrar todos los microfrontends
microfrontends.forEach(({ name, app, activeWhen, customProps }) => {
  registerApplication({
    name,
    app,
    activeWhen,
    customProps
  });
});

// Configurar navegación para la navbar (mantener por si acaso)
document.addEventListener('DOMContentLoaded', () => {
  // Configurar enlaces de navegación
  const navLinks = document.querySelectorAll('.navbar a');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const path = link.getAttribute('href');
      navigateToUrl(path);
      
      // Actualizar clase activa
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });
  
  // Marcar el enlace activo basado en la URL actual
  const updateActiveLink = () => {
    const currentPath = window.location.pathname;
    navLinks.forEach(link => {
      link.classList.remove('active');
      const linkPath = link.getAttribute('href');
      if ((currentPath === '/' && linkPath === '/') || 
          (currentPath !== '/' && linkPath !== '/' && currentPath.startsWith(linkPath))) {
        link.classList.add('active');
      }
    });
  };
  
  // Actualizar enlace activo al cargar
  updateActiveLink();
  
  // Escuchar cambios de ruta
  window.addEventListener('single-spa:routing-event', updateActiveLink);
});

// Escuchar eventos de cambio de aplicación para manejar el navbar
window.addEventListener('single-spa:before-app-change', (event) => {
  // Siempre ocultar el navbar ya que ComunidadSegundoParcial es el home
  toggleNavbar(false);
});

// Configurar manejo de errores
window.addEventListener('single-spa:app-change', (event) => {
  console.log('App change event:', event.detail);
});

window.addEventListener('single-spa:before-routing-event', (event) => {
  console.log('Before routing event:', event.detail);
});

// Iniciar Single SPA
start({
  urlRerouteOnly: true,
});

// Exponer funciones de navegación globalmente para que los microfrontends las usen
window.navigateToSPA = (path) => {
  console.log(`🧭 Navegando a: ${path}`);
  navigateToUrl(path);
};

// Funciones específicas para cada microfrontend
window.navigateToArtista = () => navigateToUrl('/artista');
window.navigateToArtistaV2 = () => navigateToUrl('/artista-v2');
window.navigateToComunidad = () => navigateToUrl('/comunidad');
window.navigateToMonetizacion = () => navigateToUrl('/monetizacion');
window.navigateToMonetizacionV2 = () => navigateToUrl('/monetizacion-v2');
window.navigateToHome = () => navigateToUrl('/');

// Función para pasar contexto a MonetizacionSegundoParcial
window.navigateToMonetizacionWithContext = (context) => {
  console.log('💰 Navegando a MonetizacionV2 con contexto:', context);
  
  // Guardar contexto en localStorage para el iframe
  if (context.artistaId || context.userId || context.userType) {
    const monetizacionContext = {
      userType: context.userType || 'artista',
      section: context.section || 'contenido-exclusivo',
      artistaId: context.artistaId,
      userId: context.userId,
      userName: context.userName,
      originApp: context.originApp || 'single-spa'
    };
    
    // Guardar el contexto
    localStorage.setItem('monetizacion_context', JSON.stringify(monetizacionContext));
    
    // Crear parámetros para el iframe
    const params = new URLSearchParams();
    if (monetizacionContext.userType) params.set('userType', monetizacionContext.userType);
    if (monetizacionContext.section) params.set('section', monetizacionContext.section);
    if (monetizacionContext.artistaId) params.set('artistaId', monetizacionContext.artistaId);
    if (monetizacionContext.userId) params.set('userId', monetizacionContext.userId);
    
    // Guardar parámetros del iframe
    localStorage.setItem('monetizacion_iframe_params', params.toString());
    
    console.log('✅ Contexto guardado para MonetizacionV2:', {
      context: monetizacionContext,
      params: params.toString()
    });
  }
  
  // Navegar a la aplicación
  navigateToUrl('/monetizacion-v2');
};

console.log('🎵 Plataforma Musical Root Config iniciada');
console.log('🏠 ComunidadSegundoParcial configurado como página principal');
