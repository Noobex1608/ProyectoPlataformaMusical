<!-- Página de selección de monetización para ComunidadSegundoParcial -->
<template>
    <header-component />
  <main class="monetizacion-selector">
    <!-- Loading State -->
    <div v-if="loading" class="welcome-section">
      <h1>💰 Monetización</h1>
      <p class="subtitle">Cargando datos del usuario...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="welcome-section">
      <h1>💰 Monetización</h1>
      <p class="subtitle">Error: {{ error }}</p>
      <p class="description">
        No se pudieron cargar los datos del usuario. Por favor, intenta recargar la página.
      </p>
    </div>

    <!-- Main Content -->
    <div v-else>
      <div class="welcome-section">
        <h1>💰 Monetización</h1>
        <p class="subtitle">Panel de Apoyo a Artistas</p>
        <p class="description">
          Como <strong>fan</strong>, accede a herramientas especializadas para 
          apoyar a tus artistas favoritos y gestionar tus suscripciones musicales
        </p>
      </div>

      <div class="options-grid">
        <button 
          class="option-card dashboard"
          @click="redirectToMonetizacion('fan-dashboard')"
        >
          <div class="option-icon">📊</div>
          <div class="option-content">
            <h3>Dashboard Fan</h3>
            <p>Vista general de suscripciones, gastos y artistas favoritos</p>
          </div>
        </button>

        <button 
          class="option-card explorar"
          @click="redirectToMonetizacion('explorar-artistas')"
        >
          <div class="option-icon">🎵</div>
          <div class="option-content">
            <h3>Explorar Artistas</h3>
            <p>Descubre nuevos artistas y sus contenidos exclusivos</p>
          </div>
        </button>

        <button 
          class="option-card suscripciones"
          @click="redirectToMonetizacion('gestionar-suscripciones')"
        >
          <div class="option-icon">🎫</div>
          <div class="option-content">
            <h3>Mis Suscripciones</h3>
            <p>Gestiona tus membresías activas y descubre nuevos planes</p>
          </div>
        </button>

        <button 
          class="option-card propinas"
          @click="redirectToMonetizacion('enviar-propinas')"
        >
          <div class="option-icon">💝</div>
          <div class="option-content">
            <h3>Enviar Propinas</h3>
            <p>Apoya directamente a tus artistas favoritos con propinas</p>
          </div>
        </button>

        <button 
          class="option-card contenido"
          @click="redirectToMonetizacion('contenido-exclusivo-fan')"
        >
          <div class="option-icon">🔓</div>
          <div class="option-content">
            <h3>Mi Contenido Exclusivo</h3>
            <p>Accede a tu biblioteca de contenido premium desbloqueado</p>
          </div>
        </button>
      </div>

      <div class="info-section">
        <div class="info-card">
          <h4>🎯 Contexto Inteligente</h4>
          <p>El sistema detecta automáticamente que eres un fan y te mostrará solo las herramientas para apoyar artistas.</p>
        </div>
        
        <div class="info-card">
          <h4>🔗 Integración Seamless</h4>
          <p>Navegación fluida entre aplicaciones sin perder el contexto de tu sesión actual.</p>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useUsuarioStore } from '../store/usuario';
import headerComponent from '../components/headerComponent.vue';
// Estados reactivos
const loading = ref(false);
const error = ref('');
const userOrigin = 'comunidad'; // Desde ComunidadSegundoParcial

// Store del usuario
const usuarioStore = useUsuarioStore();
const usuario = usuarioStore.usuario;

onMounted(() => {
  if (usuario) {
    console.log('🎵 Usuario real cargado para monetización:', usuario);
  }
});

// Función para redireccionar al microfrontend con contexto específico
const redirectToMonetizacion = (seccion?: string) => {
  console.log('🎯 CLICK DETECTADO - Iniciando redirección desde ComunidadSegundoParcial (Single-SPA)');
  console.log('📊 Datos del usuario REAL:', usuario);
  console.log('🔄 Sección solicitada:', seccion);
  console.log('👤 Origen del usuario:', userOrigin);
  console.log('🌐 URL actual antes de redirección:', window.location.href);
  console.log('🕐 Timestamp de click:', new Date().toISOString());
  
  if (!usuario) {
    console.error('❌ No se puede redirigir: no hay datos del usuario');
    alert('Error: No se han cargado los datos del usuario. Por favor, intenta de nuevo.');
    return;
  }
  
  // 🧹 LIMPIAR CONTEXTO PREVIO PARA EVITAR CONFLICTOS
  console.log('🧹 Limpiando contexto previo de localStorage...');
  
  // Limpiar TODAS las claves relacionadas con monetización
  const keysToRemove = [
    'monetizacion_context',
    'monetizacion_iframe_params',
    'context_monetizacion',
    'artista_context',
    'user_context',
    'monetizacion_user_context'
  ];
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log(`🧹 Eliminada clave: ${key}`);
  });
  
  // Limpiar también cualquier clave que contenga 'monetizacion' o 'context'
  Object.keys(localStorage).forEach(key => {
    if (key.includes('monetizacion') || key.includes('context') || key.includes('artista')) {
      localStorage.removeItem(key);
      console.log(`🧹 Eliminada clave adicional: ${key}`);
    }
  });
  
  console.log('✅ Contexto previo eliminado completamente');
  
  // Verificar si estamos en Single-SPA
  console.log('🔍 Verificando entorno Single-SPA:', {
    hasSystem: !!(window as any).System,
    hasNavigateToUrl: !!(window as any).navigateToUrl,
    hasNavigateToMonetizacionWithContext: !!(window as any).navigateToMonetizacionWithContext,
    pathname: window.location.pathname,
    host: window.location.host
  });
  
  // Crear contexto específico para usuario de COMUNIDAD
  const contextData = {
    userType: 'comunidad', // Forzar tipo comunidad
    userId: usuario.id, // ID del usuario de comunidad (NO artistaId)
    userName: usuario.name,
    userEmail: usuario.email,
    originApp: 'ComunidadSegundoParcial',
    section: seccion || 'fan-dashboard', // Sección específica para fans
    timestamp: new Date().toISOString(),
    // Forzar que NO hay artistaId para evitar confusión
    artistaId: null,
    // Agregar identificadores únicos para debuggear
    debugId: `comunidad_${Date.now()}`,
    isFanUser: true,
    isArtistUser: false
  };
  
  console.log('💾 Contexto NUEVO de usuario COMUNIDAD a guardar:', contextData);
  
  // GUARDAR CON MÚLTIPLES CLAVES para asegurar que se detecte
  const contextJson = JSON.stringify(contextData);
  localStorage.setItem('monetizacion_context', contextJson);
  localStorage.setItem('context_monetizacion', contextJson);
  localStorage.setItem('user_context', contextJson);
  localStorage.setItem('monetizacion_user_context', contextJson);
  
  console.log('💾 Contexto guardado en MÚLTIPLES claves del localStorage');
  
  // Verificar si el navegateToMonetizacionWithContext está disponible
  if ((window as any).navigateToMonetizacionWithContext) {
    console.log('🚀 Usando navegateToMonetizacionWithContext (Recomendado)');
    (window as any).navigateToMonetizacionWithContext(contextData);
    return;
  }
  
  console.log('💾 Usando método de localStorage (fallback)');
  
  // Verificar que se guardó correctamente
  const verificarContexto = localStorage.getItem('monetizacion_context');
  console.log('🔍 VERIFICANDO: Contexto recién guardado en localStorage:', verificarContexto);
  
  // Construir URL con parámetros FORZADOS para usuario de COMUNIDAD
  const params = new URLSearchParams({
    userType: 'comunidad', // Forzar tipo comunidad
    userId: usuario.id.toString(), // ID real del usuario de comunidad (NO artistaId)
    section: seccion || 'fan-dashboard', // Sección específica para fans
    userName: usuario.name || '',
    isFanUser: 'true',
    isArtistUser: 'false',
    debugContext: 'comunidad_user'
  });
  
  // Guardar también los parámetros para que el iframe los use
  localStorage.setItem('monetizacion_iframe_params', params.toString());
  console.log('🔗 Parámetros COMUNIDAD para iframe guardados:', params.toString());
  
  // Verificar que se guardó correctamente
  const verificarParams = localStorage.getItem('monetizacion_iframe_params');
  console.log('🔍 VERIFICANDO: Parámetros recién guardados en localStorage:', verificarParams);

  // Redireccionar dentro de Single-SPA
  const targetUrl = '/monetizacion-v2';
  console.log('🚀 Intentando navegar a:', targetUrl);
  
  try {
    // Método 1: Verificar si hay navigateToUrl disponible globalmente
    if ((window as any).navigateToUrl) {
      console.log('🎯 Usando navigateToUrl de Single-SPA');
      (window as any).navigateToUrl(targetUrl);
      return;
    }
    
    // Método 2: Verificar si podemos importar Single-SPA
    if ((window as any).System && (window as any).System.import) {
      console.log('🎯 Intentando importar Single-SPA para navegación');
      (window as any).System.import('single-spa')
        .then((singleSpa: any) => {
          console.log('✅ Single-SPA importado, usando navigateToUrl');
          singleSpa.navigateToUrl(targetUrl);
        })
        .catch((importError: any) => {
          console.warn('⚠️ No se pudo importar Single-SPA:', importError);
          console.log('🔄 Fallback a window.location');
          window.location.href = targetUrl;
        });
      return;
    }
    
    // Método 3: Fallback navegación directa
    console.log('🔄 Usando fallback window.location.href');
    window.location.href = targetUrl;
    console.log('✅ Redirección iniciada');
  } catch (error) {
    console.error('❌ Error en redirección:', error);
  }
};
</script>

<style scoped>
/* === Estilos Principales === */
.monetizacion-selector {
  min-height: 100vh;
  background: linear-gradient(135deg, #348e91 0%, #2c7a7d 50%, #f0f8ff 100%);
  padding: 2rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.welcome-section {
  text-align: center;
  color: white;
  margin-bottom: 3rem;
}

.welcome-section h1 {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.welcome-section .subtitle {
  font-size: 1.5rem;
  font-weight: 300;
  margin-bottom: 1rem;
  opacity: 0.9;
}

.welcome-section .description {
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
  opacity: 0.8;
}

/* === Grid de Opciones === */
.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto 3rem auto;
}

.option-card {
  background: rgba(255, 255, 255, 0.95);
  border: none;
  border-radius: 16px;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  backdrop-filter: blur(10px);
}

.option-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
  background: rgba(255, 255, 255, 1);
}

.option-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.option-content h3 {
  color: #2d3748;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.8rem;
}

.option-content p {
  color: #4a5568;
  font-size: 1rem;
  line-height: 1.5;
  margin: 0;
}

/* === Colores específicos para cada card === */
.option-card.dashboard:hover {
  border-left: 6px solid #3182ce;
}

.option-card.explorar:hover {
  border-left: 6px solid #38a169;
}

.option-card.suscripciones:hover {
  border-left: 6px solid #d69e2e;
}

.option-card.propinas:hover {
  border-left: 6px solid #e53e3e;
}

.option-card.contenido:hover {
  border-left: 6px solid #805ad5;
}

/* === Sección de Información === */
.info-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  max-width: 800px;
  margin: 0 auto;
}

.info-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  color: white;
}

.info-card h4 {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.8rem;
}

.info-card p {
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0;
  opacity: 0.9;
}

/* === Responsive Design === */
@media (max-width: 768px) {
  .monetizacion-selector {
    padding: 1rem;
  }
  
  .welcome-section h1 {
    font-size: 2.5rem;
  }
  
  .welcome-section .subtitle {
    font-size: 1.2rem;
  }
  
  .options-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .option-card {
    padding: 1.5rem;
  }
}
</style>
