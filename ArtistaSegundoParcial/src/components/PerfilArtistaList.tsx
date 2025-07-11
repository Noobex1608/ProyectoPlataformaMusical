import type { PerfilArtista } from "../types/PerfilArtista";

interface EstadisticasArtista {
  likes: number;
  reproducciones: number;
  seguidores: number;
  updated_at: string;
}

interface CancionConLikes {
  id: number;
  title: string;
  artist: string;
  album?: string;
  artista_id: string;
  imagen_url?: string;
  total_likes: number;
  total_reproducciones: number;
}

interface EstadisticasDetalladas {
  estadisticas: EstadisticasArtista;
  cancionesMasGustadas: CancionConLikes[];
  cancionesMasReproducidas: CancionConLikes[];
  totalCanciones: number;
  totalAlbumes: number;
}

interface Props {
  perfil?: PerfilArtista;
  estadisticas?: EstadisticasArtista;
  estadisticasDetalladas?: EstadisticasDetalladas;
  loading?: boolean;
  error?: string;
}

const PerfilArtistaList = ({ 
  perfil, 
  estadisticas, 
  estadisticasDetalladas, 
  loading = false, 
  error 
}: Props) => {
  if (loading) {
    return (
      <div className="card-lista">
        <div className="card">
          <div className="empty-state">
            <div className="loading-spinner"></div>
            <p>Cargando estadísticas...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-lista">
        <div className="card">
          <div className="empty-state">
            <h3>⚠️ Error</h3>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const stats = estadisticas || perfil || {
    likes: 0,
    reproducciones: 0,
    seguidores: 0,
    updated_at: new Date().toISOString()
  };

  return (
    <div className="card-lista">
      {/* Estadísticas Principales */}
      <div className="card">
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h2>📈 Estadísticas Principales</h2>
          <div className="estadisticas-grid">
            <div className="stat-card">
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>❤️</div>
              <div className="stat-number" style={{ color: "#e74c3c" }}>
                {stats.likes ?? 0}
              </div>
              <h3>Likes</h3>
            </div>
            
            <div className="stat-card">
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🎵</div>
              <div className="stat-number" style={{ color: "#348e91" }}>
                {stats.reproducciones ?? 0}
              </div>
              <h3>Reproducciones</h3>
            </div>
            
            <div className="stat-card">
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>👥</div>
              <div className="stat-number" style={{ color: "#f39c12" }}>
                {stats.seguidores ?? 0}
              </div>
              <h3>Seguidores</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas Adicionales */}
      {estadisticasDetalladas && (
        <div className="card" style={{ marginTop: "1rem" }}>
          <div style={{ textAlign: "center", marginBottom: "1rem" }}>
            <h3>📊 Resumen del Contenido</h3>
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", 
              gap: "1rem",
              marginTop: "1rem"
            }}>
              <div style={{ 
                padding: "1rem", 
                backgroundColor: "#e8f5e8", 
                borderRadius: "8px",
                border: "1px solid #c3e6cb"
              }}>
                <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#155724" }}>
                  {estadisticasDetalladas.totalCanciones}
                </div>
                <div style={{ fontSize: "0.9rem", color: "#155724" }}>Canciones</div>
              </div>
              
              <div style={{ 
                padding: "1rem", 
                backgroundColor: "#e8f4f8", 
                borderRadius: "8px",
                border: "1px solid #bee5eb"
              }}>
                <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#0c5460" }}>
                  {estadisticasDetalladas.totalAlbumes}
                </div>
                <div style={{ fontSize: "0.9rem", color: "#0c5460" }}>Álbumes</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Canciones Más Gustadas */}
      {estadisticasDetalladas?.cancionesMasGustadas && estadisticasDetalladas.cancionesMasGustadas.length > 0 && (
        <div className="canciones-populares">
          <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>
            🎶 Canciones Más Gustadas
          </h3>
          <div>
            {estadisticasDetalladas.cancionesMasGustadas.map((cancion, index) => (
              <div key={cancion.id} className="cancion-item">
                <div className="cancion-info">
                  <div className="cancion-titulo">
                    <span style={{ fontWeight: "bold", marginRight: "0.5rem", color: "#348e91" }}>
                      {index + 1}.
                    </span>
                    {cancion.title || 'Sin título'}
                  </div>
                  <div className="cancion-artista">
                    {cancion.artist || 'Artista desconocido'}
                  </div>
                </div>
                <div className="cancion-likes">
                  <span>❤️</span>
                  <span>{cancion.total_likes || 0}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Canciones Más Reproducidas */}
      {estadisticasDetalladas?.cancionesMasReproducidas && estadisticasDetalladas.cancionesMasReproducidas.length > 0 && (
        <div className="canciones-populares">
          <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>
            🎧 Canciones Más Reproducidas
          </h3>
          <div>
            {estadisticasDetalladas.cancionesMasReproducidas.map((cancion, index) => (
              <div key={`repro-${cancion.id}`} className="cancion-item">
                <div className="cancion-info">
                  <div className="cancion-titulo">
                    <span style={{ fontWeight: "bold", marginRight: "0.5rem", color: "#348e91" }}>
                      {index + 1}.
                    </span>
                    {cancion.title || 'Sin título'}
                  </div>
                  <div className="cancion-artista">
                    {cancion.artist || 'Artista desconocido'}
                  </div>
                </div>
                <div className="cancion-likes">
                  <span>🎧</span>
                  <span>{cancion.total_reproducciones || 0}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Última Actualización */}
      <div style={{ 
        marginTop: "1rem", 
        textAlign: "center", 
        fontSize: "0.8rem", 
        color: "#6c757d" 
      }}>
        <p>
          Última actualización: {' '}
          {(estadisticas?.updated_at || (stats as any).updated_at)
            ? new Date((estadisticas?.updated_at || (stats as any).updated_at)).toLocaleString('es-ES') 
            : 'No disponible'
          }
        </p>
      </div>
    </div>
  );
};

export default PerfilArtistaList;
