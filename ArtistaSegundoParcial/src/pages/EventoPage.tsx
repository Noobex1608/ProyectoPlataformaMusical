import { Link } from 'react-router-dom';
import type { Evento } from '../types/Evento';
import EventoForm from '../components/EventoForm';
import EventoList from '../components/EventoList';
import { useEventos } from '../hooks/useEventos';
import { useArtistaActual } from '../hooks/useArtistaActual';

const EventoPage = () => {
  const { artista, loading: loadingArtista } = useArtistaActual();
  const { eventos, loading: loadingEventos, error, crearEvento } = useEventos();

  const handleGuardar = async (evento: Omit<Evento, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await crearEvento(evento);
      console.log('✅ Evento creado exitosamente');
    } catch (error) {
      console.error('❌ Error creando evento:', error);
    }
  };

  // Mostrar loading mientras se cargan los datos
  if (loadingArtista || loadingEventos) {
    return (
      <section className="dashboard">
        <div className="loading-state">
          <h3>Cargando...</h3>
          <p>Obteniendo información del artista y eventos</p>
        </div>
      </section>
    );
  }

  // Mostrar error si hay problemas
  if (error) {
    return (
      <section className="dashboard">
        <div className="error-state">
          <h3>Error cargando eventos</h3>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn btn-primary"
          >
            Reintentar
          </button>
        </div>
      </section>
    );
  }

  // Validar que el artista existe
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
        
        {eventos.length > 0 && (
          <div>
            <h3 style={{ color: '#348e91', textAlign: 'center', marginBottom: '1.5rem' }}>
              Tus Eventos Programados ({eventos.length})
            </h3>
            <EventoList eventos={eventos} />
          </div>
        )}

        {eventos.length === 0 && (
          <div className="empty-state" style={{ textAlign: 'center', padding: '2rem' }}>
            <h4>No tienes eventos programados</h4>
            <p>Crea tu primer evento usando el formulario de arriba</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default EventoPage;
