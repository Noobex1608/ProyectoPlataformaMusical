import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Artista } from '../types/Artista';
import ArtistaForm from '../components/ArtistaForm';
import ArtistaList from '../components/ArtistaList';
import { useArtistas } from '../hooks/useArtistas';

const ArtistaPage = () => {
  const { artistas, loading, error, agregarArtista, editarArtista, eliminarArtista } = useArtistas();
  const [modoEdicion, setModoEdicion] = useState(false);
  const [artistaEditando, setArtistaEditando] = useState<Artista | null>(null);

  const artista = artistas[0]; // Primer artista de la lista

  const handleGuardar = async (artistaData: Artista | Omit<Artista, 'id'>) => {
    try {
      if (modoEdicion && artistaEditando) {
        // Editando artista existente
        const editado = artistaData as Artista;
        await editarArtista(editado.id, editado);
        setModoEdicion(false);
        setArtistaEditando(null);
      } else {
        // Creando nuevo artista
        const nuevo = artistaData as Omit<Artista, 'id'>;
        await agregarArtista(nuevo);
      }
    } catch (err) {
      console.error('Error guardando artista:', err);
    }
  };

  const handleEliminar = async (id: string) => {
    const confirmar = confirm('¿Eliminar artista?');
    if (confirmar) {
      try {
        await eliminarArtista(id);
      } catch (err) {
        console.error('Error eliminando artista:', err);
      }
    }
  };

  if (loading) {
    return (
      <section className="dashboard">
        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
          🔄 Cargando artistas...
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="dashboard">
        <div style={{ textAlign: 'center', padding: '3rem', color: '#d32f2f' }}>
          ❌ Error: {error}
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
        👤 Perfil del Artista
      </h2>

      <div style={{ width: '100%', maxWidth: '800px' }}>
        {(!artista || modoEdicion) ? (
          <ArtistaForm
            artistaInicial={modoEdicion ? artistaEditando! : undefined}
            onGuardar={handleGuardar}
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
