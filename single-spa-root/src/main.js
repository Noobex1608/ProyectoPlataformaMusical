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
    app: () => import('http://localhost:5177/src/main.js'),
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
    activeWhen: ['/'], // AHORA ES LA PÁGINA PRINCIPAL
    customProps: {
      domElement: '#single-spa-application',
      hideNavbar: true
    }
  },
  {
    name: '@plataforma/monetizacion',
    app: () => import('http://localhost:5176/src/main.js'),
    activeWhen: ['/monetizacion'],
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
window.navigateToHome = () => navigateToUrl('/');

console.log('🎵 Plataforma Musical Root Config iniciada');
console.log('🏠 ComunidadSegundoParcial configurado como página principal');
