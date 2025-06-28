import { useEffect, useState } from 'react';
import type { Artista } from '../types/artista';
import ArtistaForm from '../components/ArtistaForm';
import ArtistaList from '../components/ArtistaList';

const ArtistaPage = () => {
  const [artistas, setArtistas] = useState<Artista[]>(() => {
    const stored = localStorage.getItem('artistas');
    return stored ? JSON.parse(stored) : [];
  });

  const [modoEdicion, setModoEdicion] = useState(false);
  const [artistaEditando, setArtistaEditando] = useState<Artista | null>(null);

  useEffect(() => {
    localStorage.setItem('artistas', JSON.stringify(artistas));
  }, [artistas]);

  const artista = artistas[0];

  const handleAgregar = (nuevo: Artista) => {
    setArtistas([nuevo]);
  };

  const handleEditar = (editado: Artista) => {
    setArtistas([editado]);
    setModoEdicion(false);
    setArtistaEditando(null);
  };

  const handleEliminar = (id: string) => {
    const confirmar = confirm('¿Eliminar artista?');
    if (confirmar) {
      setArtistas([]);
    }
  };

  return (
    <div>
      {(!artista || modoEdicion) ? (
        <ArtistaForm
          artistaInicial={modoEdicion ? artistaEditando! : undefined}
          onGuardar={modoEdicion ? handleEditar : handleAgregar}
          onCancelar={() => setModoEdicion(false)}
        />
      ) : (
        <ArtistaList
          artistas={[artista]}
          onEditar={(a) => {
            setArtistaEditando(a);
            setModoEdicion(true);
          }}
          onEliminar={handleEliminar}
        />
      )}
    </div>
  );
};

export default ArtistaPage;
