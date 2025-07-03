import { registerApplication, start, navigateToUrl } from 'single-spa';

// Configuración de los microfrontends
const microfrontends = [
  {
    name: '@plataforma/artista',
    app: () => import('http://localhost:5173/src/main.js'), // Puerto donde corre el microfrontend Artista
    activeWhen: ['/artista'],
    customProps: {
      domElement: '#single-spa-application'
    }
  },
  {
    name: '@plataforma/comunidad',
    app: () => import('http://localhost:5174/src/main.js'), // Puerto donde corre el microfrontend Comunidad
    activeWhen: ['/comunidad'],
    customProps: {
      domElement: '#single-spa-application'
    }
  },
  {
    name: '@plataforma/comunidad-segundo-parcial',
    app: () => {
      console.log('🔄 Cargando ComunidadSegundoParcial...');
      return import('http://localhost:5175/src/main.ts')
        .then(module => {
          console.log('✅ ComunidadSegundoParcial cargado:', module);
          return module;
        })
        .catch(error => {
          console.error('❌ Error cargando ComunidadSegundoParcial:', error);
          throw error;
        });
    },
    activeWhen: ['/comunidad-v2'],
    customProps: {
      domElement: '#single-spa-application'
    }
  },
  {
    name: '@plataforma/monetizacion',
    app: () => import('http://localhost:5176/src/main.js'), // Puerto donde corre el microfrontend Monetización
    activeWhen: ['/monetizacion'],
    customProps: {
      domElement: '#single-spa-application'
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

// Aplicación por defecto (página de inicio)
registerApplication({
  name: '@plataforma/home',
  app: () => Promise.resolve({
    mount() {
      const container = document.getElementById('single-spa-application');
      container.innerHTML = `
        <div style="text-align: center; padding: 4rem 2rem;">
          <h1 style="color: #6c5ce7; font-size: 3rem; margin-bottom: 1rem;">
            🎵 Bienvenido a la Plataforma Musical
          </h1>
          <p style="font-size: 1.2rem; color: #666; margin-bottom: 2rem; max-width: 600px; margin-left: auto; margin-right: auto;">
            Una plataforma completa para artistas, comunidades musicales y monetización de contenido.
          </p>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; max-width: 900px; margin: 0 auto;">
            <div style="background: #f8f9fa; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h3 style="color: #333; margin-bottom: 1rem;">🎤 Módulo Artista</h3>
              <p style="color: #666; margin-bottom: 1.5rem;">Gestiona tu perfil, sube música y conecta con tus fans.</p>
              <button onclick="navigateToArtista()" style="background: #6c5ce7; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer; font-size: 1rem;">
                Ir al Módulo Artista
              </button>
            </div>
            <div style="background: #f8f9fa; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h3 style="color: #333; margin-bottom: 1rem;">👥 Módulo Comunidad</h3>
              <p style="color: #666; margin-bottom: 1.5rem;">Únete a comunidades, participa en foros y eventos.</p>
              <button onclick="navigateToComunidad()" style="background: #6c5ce7; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer; font-size: 1rem; margin-right: 1rem;">
                Ir al Módulo Comunidad
              </button>
              <button onclick="navigateToComunidadV2()" style="background: #9b59b6; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer; font-size: 1rem;">
                Ir a Comunidad V2
              </button>
            </div>
            <div style="background: #f8f9fa; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h3 style="color: #333; margin-bottom: 1rem;">💰 Módulo Monetización</h3>
              <p style="color: #666; margin-bottom: 1.5rem;">Monetiza tu contenido y gestiona tus ingresos.</p>
              <button onclick="navigateToMonetizacion()" style="background: #6c5ce7; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer; font-size: 1rem;">
                Ir al Módulo Monetización
              </button>
            </div>
          </div>
        </div>
      `;
      
      // Funciones de navegación
      window.navigateToArtista = () => navigateToUrl('/artista');
      window.navigateToComunidad = () => navigateToUrl('/comunidad');
      window.navigateToComunidadV2 = () => navigateToUrl('/comunidad-v2');
      window.navigateToMonetizacion = () => navigateToUrl('/monetizacion');
      
      return Promise.resolve();
    },
    unmount() {
      const container = document.getElementById('single-spa-application');
      container.innerHTML = '';
      delete window.navigateToArtista;
      delete window.navigateToComunidad;
      delete window.navigateToComunidadV2;
      delete window.navigateToMonetizacion;
      return Promise.resolve();
    }
  }),
  activeWhen: ['/'],
  customProps: {}
});

// Configurar navegación para la navbar
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

// Configurar manejo de errores
window.addEventListener('single-spa:app-change', (event) => {
  console.log('App change event:', event.detail);
  const container = document.getElementById('single-spa-application');
  if (container) {
    container.classList.add('is-rendered');
  }
});

window.addEventListener('single-spa:before-routing-event', (event) => {
  console.log('Before routing event:', event.detail);
});

window.addEventListener('single-spa:routing-event', (event) => {
  console.log('Routing event:', event.detail);
});

// Manejar errores de carga de aplicaciones
window.addEventListener('single-spa:first-mount', (event) => {
  console.log('First mount:', event.detail);
});

window.addEventListener('single-spa:app-change', (event) => {
  console.log('📱 Aplicación cambiada:', event.detail);
  // Verificar si hay errores
  if (event.detail.appsByNewStatus?.LOAD_ERROR?.length > 0) {
    console.error('❌ Error cargando aplicaciones:', event.detail.appsByNewStatus.LOAD_ERROR);
    const container = document.getElementById('single-spa-application');
    if (container) {
      container.innerHTML = `
        <div class="error">
          <h2>Error cargando la aplicación</h2>
          <p>No se pudo cargar el microfrontend. Verifica que esté ejecutándose en el puerto correcto.</p>
          <button onclick="window.location.reload()">Recargar página</button>
        </div>
      `;
    }
  }
});

// Iniciar Single SPA
start({
  urlRerouteOnly: true,
});

console.log('🎵 Plataforma Musical Root Config iniciada');
