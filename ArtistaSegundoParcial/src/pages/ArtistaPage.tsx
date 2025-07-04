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

  const handleEliminar = (_id: string) => {
    const confirmar = confirm('¿Eliminar artista?');
    if (confirmar) {
      setArtistas([]);
    }
  };

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
        👤 Perfil del Artista
      </h2>

      <div style={{ width: '100%', maxWidth: '800px' }}>
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
    </section>
  );
};

export default ArtistaPage;
