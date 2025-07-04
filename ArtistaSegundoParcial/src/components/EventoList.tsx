import type { Evento } from '../types/Evento';

interface Props {
  eventos: Evento[];
}

const EventoList = ({ eventos }: Props) => {
  if (eventos.length === 0) {
    return (
      <div className="empty-state">
        <h3>No hay eventos programados</h3>
        <p>¡Crea tu primer evento y comienza a promocionar tus presentaciones!</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="evento-list">
      {eventos.map(e => (
        <div key={e.id} className="evento-card">
          <div className="evento-date">
            📅 {formatDate(e.fecha)}
          </div>
          <h3>{e.nombre}</h3>
          <div className="evento-location">
            📍 {e.ubicacion}
          </div>
          <p style={{ color: '#348e91', fontWeight: '500', marginTop: '1rem' }}>
            ¡No olvides promocionar este evento!
          </p>
        </div>
      ))}
    </div>
  );
};

export default EventoList;
