import { useEffect } from "react";
import { Link } from "react-router-dom";
import PerfilArtistaList from "../components/PerfilArtistaList";
import { useArtistaActual } from "../hooks/useArtistaActual";
import { useEstadisticas } from "../hooks/useEstadisticas";


const PerfilArtistaPage = () => {
  const { artista, loading: loadingArtista, error: errorArtista } = useArtistaActual();
  const { 
    estadisticas, 
    estadisticasDetalladas, 
    loading: loadingEstadisticas, 
    error: errorEstadisticas,
    cargarEstadisticas 
  } = useEstadisticas();

  useEffect(() => {
    if (artista?.id) {
      console.log('Cargando estadísticas para artista:', artista.id);
      cargarEstadisticas(artista.id);
    }
  }, [artista]);

  const loading = loadingArtista || loadingEstadisticas;
  const error = errorArtista || errorEstadisticas;

  if (loading) {
    return (
      <section className="dashboard">
        <div className="empty-state">
          <div className="loading-spinner"></div>
          <p>Cargando perfil y estadísticas...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="dashboard">
        <div className="empty-state">
          <h3>⚠️ Error</h3>
          <p>{error}</p>
          <Link to="/artista" className="btn btn-primary">
            Configurar Perfil
          </Link>
        </div>
      </section>
    );
  }

  if (!artista) {
    return (
      <section className="dashboard">
        <div className="empty-state">
          <h3>No hay datos de artista</h3>
          <p>Primero configura tu perfil de artista</p>
          <Link to="/artista" className="btn btn-primary">
            Crear Perfil
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="dashboard">
      <Link 
        to="/" 
        className="btn btn-secondary"
        style={{
          position: 'absolute',
          top: '2rem',
          left: '2rem',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          textDecoration: 'none',
        }}
      >
        ← Volver al Dashboard
      </Link>

      <div className="perfil-header">
        <h2 className="perfil-nombre" style={{ color: "#eff0f0ff" }}>
          📈 Estadísticas de {artista.nombre_artistico}
        </h2>
        
        {artista.imagen_url && (
          <img 
            src={artista.imagen_url} 
            alt={artista.nombre_artistico}
            className="perfil-avatar"
          />
        )}
        
        <h2 className="perfil-bio" style={{ color: "#ffffffff", fontFamily: "Segoe Ui, Tahoma, Geneva, Verdana, sans-serif",
          fontSize: "20px"
         }}>
          {artista.biografia || 'Artista musical'}
        </h2>
        
        {artista.generos_musicales && artista.generos_musicales.length > 0 && (
          <div className="perfil-generos">
            {artista.generos_musicales.map((genero, index) => (
              <span key={index} className="genero-tag">
                {genero}
              </span>
            ))}
          </div>
        )}
      </div>

      <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
        <PerfilArtistaList 
          estadisticas={estadisticas || undefined} 
          estadisticasDetalladas={estadisticasDetalladas || undefined}
          loading={loadingEstadisticas}
          error={errorEstadisticas || undefined}
        />
      </div>

      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <button 
          onClick={() => artista?.id && cargarEstadisticas(artista.id)}
          className="actualizar-btn"
          disabled={loadingEstadisticas}
        >
          {loadingEstadisticas ? "Actualizando..." : "🔄 Actualizar Estadísticas"}
        </button>
      </div>
    </section>
  );
};

export default PerfilArtistaPage;
