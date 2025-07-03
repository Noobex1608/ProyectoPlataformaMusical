import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Artista } from '../types/Artista';
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
    <section className="main-content">
      <Link to="/" style={{ display: 'inline-block', marginBottom: '1rem', color: '#1f9ea8', textDecoration: 'none', fontWeight: 500 }}>&larr; Volver al inicio</Link>
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
    </section>
  );
};

export default ArtistaPage;
