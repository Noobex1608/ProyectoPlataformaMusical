import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Evento } from '../types/Evento';
import EventoForm from '../components/EventoForm';
import EventoList from '../components/EventoList';

const EventoPage = () => {
  const [eventos, setEventos] = useState<Evento[]>(() => {
    const stored = localStorage.getItem('eventos');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem('eventos', JSON.stringify(eventos));
  }, [eventos]);

  const artista = JSON.parse(localStorage.getItem('artistas') || '[]')[0]; // toma el artista único

  const handleGuardar = (evento: Evento) => {
    setEventos([...eventos, evento]);
  };

  const eventosDelArtista = eventos.filter(e => e.artistaId === artista?.id);

  if (!artista) {
    return (
      <section className="dashboard">
        <div className="empty-state">
          <h3>Perfil de artista requerido</h3>
          <p>Debes crear tu perfil de artista antes de gestionar eventos</p>
          <Link to="/artista" className="btn btn-primary">
            Crear Perfil de Artista
          </Link>
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
        🎤 Gestión de Eventos
      </h2>

      <div style={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <EventoForm onGuardar={handleGuardar} artistaId={artista.id} />
        
        {eventosDelArtista.length > 0 && (
          <div>
            <h3 style={{ color: '#348e91', textAlign: 'center', marginBottom: '1.5rem' }}>
              Tus Eventos Programados ({eventosDelArtista.length})
            </h3>
            <EventoList eventos={eventosDelArtista} />
          </div>
        )}
      </div>
    </section>
  );
};

export default EventoPage;
