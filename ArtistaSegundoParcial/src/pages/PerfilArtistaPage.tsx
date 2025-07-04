import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PerfilArtistaList from "../components/PerfilArtistaList";
import type { PerfilArtista } from "../types/PerfilArtista";
import type { Artista } from "../types/Artista";

const PerfilArtistaPage = () => {
  const storedArtistas = JSON.parse(localStorage.getItem("artistas") || "[]") as Artista[];
  const artista = storedArtistas[0]; // Asumes que hay solo un artista por usuario

  const [perfil] = useState<PerfilArtista>({
    iinfoartista: artista,
    reproducciones: 123,
    likes: 45,
    seguidores: 78
  });

  useEffect(() => {
    // En el futuro puedes cargar estas métricas reales
    localStorage.setItem("perfilEstadistica", JSON.stringify(perfil));
  }, [perfil]);

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

      <h2 style={{ color: '#348e91', marginBottom: '2rem' }}>
        📈 Estadísticas del Artista
      </h2>

      <div style={{ width: '100%', maxWidth: '800px' }}>
        <PerfilArtistaList perfil={perfil} />
      </div>
    </section>
  );
};

export default PerfilArtistaPage;
