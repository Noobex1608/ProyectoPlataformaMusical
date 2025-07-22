import { useEffect, useState } from 'react';
import { useArtistaActual } from '../hooks/useArtistaActual';
import '../App.css';
import '../styles/MonetizacionPage.css';

function MonetizacionSelector() {
  const { artista, loading, error } = useArtistaActual();
  const [userOrigin] = useState('artista'); // Desde ArtistaSegundoParcial

  useEffect(() => {
    if (artista) {
      console.log('🎵 Artista real cargado para monetización:', artista);
    }
  }, [artista]);

  // Función para redireccionar al microfrontend con contexto específico
  const redirectToMonetizacion = (seccion?: string) => {
    console.log('🎯 Iniciando redirección desde ArtistaSegundoParcial (Single-SPA)');
    console.log('📊 Datos del artista REAL:', artista);
    console.log('🔄 Sección solicitada:', seccion);
    console.log('👤 Origen del usuario:', userOrigin);
    console.log('🌐 URL actual antes de redirección:', window.location.href);
    
    if (!artista) {
      console.error('❌ No se puede redirigir: no hay datos del artista');
      alert('Error: No se han cargado los datos del artista. Por favor, intenta de nuevo.');
      return;
    }
    
    // Verificar si estamos en Single-SPA
    console.log('🔍 Verificando entorno Single-SPA:', {
      hasSystem: !!(window as any).System,
      hasNavigateToUrl: !!(window as any).navigateToUrl,
      hasNavigateToMonetizacionWithContext: !!(window as any).navigateToMonetizacionWithContext,
      pathname: window.location.pathname,
      host: window.location.host
    });
    
    // Guardar contexto en localStorage para que el microfrontend lo use
    const contextData = {
      userType: userOrigin,
      artistaId: artista.id, // ✅ Ahora usando el ID REAL del artista
      userName: artista.nombre_artistico,
      originApp: 'ArtistaSegundoParcial',
      section: seccion || 'dashboard'
    };
    
    console.log('💾 Contexto REAL del artista a guardar:', contextData);
    
    // Verificar si el navegateToMonetizacionWithContext está disponible
    if ((window as any).navigateToMonetizacionWithContext) {
      console.log('🚀 Usando navegateToMonetizacionWithContext (Recomendado)');
      (window as any).navigateToMonetizacionWithContext(contextData);
      return;
    }
    
    // Fallback: Método manual
    localStorage.setItem('monetizacion_context', JSON.stringify(contextData));
    console.log('💾 Contexto guardado en localStorage (fallback):', contextData);

    // Construir URL con parámetros para el iframe
    const params = new URLSearchParams({
      userType: userOrigin,
      artistaId: artista.id, // ✅ ID real del artista
      section: seccion || 'dashboard'
    });
    
    // Guardar también los parámetros para que el iframe los use
    localStorage.setItem('monetizacion_iframe_params', params.toString());
    console.log('🔗 Parámetros REALES para iframe guardados:', params.toString());

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

  // Mostrar loading o error si es necesario
  if (loading) {
    return (
      <main className="monetizacion-selector">
        <div className="welcome-section">
          <h1>💰 Monetización</h1>
          <p className="subtitle">Cargando datos del artista...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="monetizacion-selector">
        <div className="welcome-section">
          <h1>💰 Monetización</h1>
          <p className="subtitle">Error: {error}</p>
          <p className="description">
            No se pudieron cargar los datos del artista. Por favor, intenta recargar la página.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="monetizacion-selector">
      <div className="welcome-section">
        <h1>💰 Monetización</h1>
        <p className="subtitle">Panel de Gestión de Ingresos</p>
        <p className="description">
          Como <strong>artista</strong>, accede a herramientas especializadas para 
          monetizar tu contenido y gestionar tus ingresos musicales
        </p>
      </div>

      <div className="options-grid">
        <button 
          className="option-card dashboard"
          onClick={() => redirectToMonetizacion('dashboard')}
        >
          <div className="option-icon">📊</div>
          <div className="option-content">
            <h3>Dashboard Completo</h3>
            <p>Vista general de ingresos, analytics y métricas de monetización</p>
          </div>
        </button>

        <button 
          className="option-card contenido"
          onClick={() => redirectToMonetizacion('contenido-exclusivo')}
        >
          <div className="option-icon">🔒</div>
          <div className="option-content">
            <h3>Contenido Exclusivo</h3>
            <p>Gestiona contenido premium para suscriptores y fanáticos</p>
          </div>
        </button>

        <button 
          className="option-card fanaticos"
          onClick={() => redirectToMonetizacion('gestion-fanaticos')}
        >
          <div className="option-icon">👥</div>
          <div className="option-content">
            <h3>Gestión de Fanáticos</h3>
            <p>Administra suscripciones, membresías y comunidad de seguidores</p>
          </div>
        </button>

        <button 
          className="option-card reportes"
          onClick={() => redirectToMonetizacion('reportes')}
        >
          <div className="option-icon">📈</div>
          <div className="option-content">
            <h3>Reportes de Ingresos</h3>
            <p>Analytics detallados de propinas, suscripciones y ventas</p>
          </div>
        </button>

        <button 
          className="option-card configuracion"
          onClick={() => redirectToMonetizacion('configuracion')}
        >
          <div className="option-icon">⚙️</div>
          <div className="option-content">
            <h3>Configuración</h3>
            <p>Ajustes de precios, métodos de pago y preferencias</p>
          </div>
        </button>
      </div>

      <div className="info-section">
        <div className="info-card">
          <h4>🎯 Contexto Inteligente</h4>
          <p>El sistema detecta automáticamente que eres un artista y te mostrará solo las herramientas relevantes para monetizar tu música.</p>
        </div>
        
        <div className="info-card">
          <h4>🔗 Integración Seamless</h4>
          <p>Navegación fluida entre aplicaciones sin perder el contexto de tu sesión actual.</p>
        </div>
      </div>


    </main>
  );
}

export default MonetizacionSelector;