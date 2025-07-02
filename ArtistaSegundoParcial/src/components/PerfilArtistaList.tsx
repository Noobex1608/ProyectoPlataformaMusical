import type { PerfilArtista } from "../types/PerfilArtista";

interface Props {
  perfil: PerfilArtista;
}

const PerfilArtistaList = ({ perfil }: Props) => {
  return (
    <div className="card-lista">
      <div className="card">
        <div style={{ textAlign: "center" }}>
          <h2>📈 Estadísticas del Artista</h2>
          <p><strong>Reproducciones:</strong> {perfil.reproducciones ?? 0}</p>
          <p><strong>Likes:</strong> {perfil.likes ?? 0}</p>
          <p><strong>Seguidores:</strong> {perfil.seguidores ?? 0}</p>
        </div>
      </div>
    </div>
  );
};

export default PerfilArtistaList;
