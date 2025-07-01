import { useState } from 'react';
import type { PerfilArtista } from '../types/PerfilArtista';

interface Props {
  onGuardar: (perfil: PerfilArtista) => void;
  perfilInicial?: PerfilArtista;
}

const PerfilArtistaForm = ({ onGuardar, perfilInicial }: Props) => {
  const [reproducciones, setReproducciones] = useState(perfilInicial?.reproducciones || 0);
  const [likes, setLikes] = useState(perfilInicial?.likes || 0);
  const [seguidores, setSeguidores] = useState(perfilInicial?.seguidores || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const artistaGuardado = JSON.parse(localStorage.getItem('artistas') || '[]')[0];

    if (!artistaGuardado) return alert('Debes crear un perfil de artista primero.');

    onGuardar({
      iinfoartista: artistaGuardado,
      reproducciones,
      likes,
      seguidores,
    });
  };

  return (
    <form className="formulario" onSubmit={handleSubmit}>
      <h2>Agregar Estadísticas</h2>
      <div className="form-group">
        <label>Reproducciones</label>
        <input type="number" value={reproducciones} onChange={(e) => setReproducciones(Number(e.target.value))} />
      </div>
      <div className="form-group">
        <label>Likes</label>
        <input type="number" value={likes} onChange={(e) => setLikes(Number(e.target.value))} />
      </div>
      <div className="form-group">
        <label>Seguidores</label>
        <input type="number" value={seguidores} onChange={(e) => setSeguidores(Number(e.target.value))} />
      </div>
      <button type="submit" className="btn-agregar">Guardar</button>
    </form>
  );
};

export default PerfilArtistaForm;
