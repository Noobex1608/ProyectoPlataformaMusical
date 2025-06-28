import type { Artista } from '../types/artista';

interface Props {
  artistas: Artista[];
  onEditar: (artista: Artista) => void;
  onEliminar: (id: string) => void;
}

const ArtistaList = ({ artistas, onEditar, onEliminar }: Props) => {
  return (
    <div className="card-lista">
      {artistas.map((a) => (
        <div key={a.id} className="card artista-card">
          <img src={a.imagen} alt={a.nombre} className="artista-img" />
          <div>
            <h3>{a.nombre}</h3>
            <p><strong>Género:</strong> {a.genero}</p>
            <p><strong>País:</strong> {a.pais}</p>
            <p><strong>Descripción:</strong> {a.descripcion}</p>
            {a.tokenVerificacion && (
              <p><strong>Token:</strong> {a.tokenVerificacion}</p>
            )}
            <button onClick={() => onEditar(a)}>Editar</button>
            <button onClick={() => onEliminar(a.id)}>Eliminar</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ArtistaList;
