import type { PerfilArtista } from '../types/PerfilArtista';

interface Props {
  perfil: PerfilArtista;
  onEditar: () => void;
}

const PerfilArtistaList = ({ perfil, onEditar }: Props) => {
  const { iinfoartista, reproducciones, likes, seguidores } = perfil;

  return (
    <div className="card">
      <div>
        <h3>{iinfoartista.nombre}</h3>
        <p><strong>Género:</strong> {iinfoartista.genero}</p>
        <p><strong>País:</strong> {iinfoartista.pais}</p>
        <p><strong>Descripción:</strong> {iinfoartista.descripcion}</p>
        <hr />
        <p><strong>Reproducciones:</strong> {reproducciones}</p>
        <p><strong>Likes:</strong> {likes}</p>
        <p><strong>Seguidores:</strong> {seguidores}</p>
        <button onClick={onEditar} className="btn-agregar">Editar</button>
      </div>
    </div>
  );
};

export default PerfilArtistaList;
