import type { Artista } from '../types/Artista';
import ProfileImage from './ProfileImage';
import '../styles/PerfilArtista.css';

interface Props {
  artistas: Artista[];
  onEditar: (artista: Artista) => void;
  onEliminar: (id: string) => void;
}

const ArtistaList = ({ artistas, onEditar, onEliminar }: Props) => {
  return (
    <div className="perfil-artista-container">
      {artistas.map((a) => (
        <div key={a.id} className="perfil-card">
          <div className="perfil-header">
            <ProfileImage 
              imageUrl={a.imagen}
              size={120}
              name={a.nombre}
            />
            
            <div className="perfil-info">
              <h1 className="artista-name">{a.nombre}</h1>
              <p className="artista-genre">{a.genero || 'Género no especificado'}</p>
              {a.pais && (
                <p className="artista-country">📍 {a.pais}</p>
              )}
              {a.descripcion && (
                <p className="artista-description">{a.descripcion}</p>
              )}
              {a.tokenVerificacion && (
                <p className="artista-token">🔐 Token: {a.tokenVerificacion}</p>
              )}
            </div>

            <div className="perfil-actions">
              <button 
                onClick={() => onEditar(a)}
                className="btn-edit"
              >
                ✏️ Editar
              </button>
              <button 
                onClick={() => onEliminar(a.id)}
                className="btn-edit"
                style={{ 
                  background: '#f44336', 
                  borderColor: '#f44336',
                  marginTop: '0.5rem'
                }}
              >
                🗑️ Eliminar
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ArtistaList;
