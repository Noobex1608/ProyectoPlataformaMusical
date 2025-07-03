import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PerfilArtistaList from "../components/PerfilArtistaList";
import type { PerfilArtista } from "../types/PerfilArtista";
import type { Artista } from "../types/Artista";

const PerfilArtistaPage = () => {
  const storedArtistas = JSON.parse(localStorage.getItem("artistas") || "[]") as Artista[];
  const artista = storedArtistas[0]; // Asumes que hay solo un artista por usuario

  const [perfil, setPerfil] = useState<PerfilArtista>({
    iinfoartista: artista,
    reproducciones: 123,
    likes: 45,
    seguidores: 78
  });

  useEffect(() => {
    // En el futuro puedes cargar estas métricas reales
    localStorage.setItem("perfilEstadistica", JSON.stringify(perfil));
  }, [perfil]);

  if (!artista) return <p>No hay datos de artista para mostrar estadísticas.</p>;

  return (
    <section className="main-content">
      <Link to="/" style={{ display: 'inline-block', marginBottom: '1rem', color: '#1f9ea8', textDecoration: 'none', fontWeight: 500 }}>&larr; Volver al inicio</Link>
      <PerfilArtistaList perfil={perfil} />
    </section>
  );
};

export default PerfilArtistaPage;
