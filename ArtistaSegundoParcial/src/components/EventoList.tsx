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

  const formatPrice = (price?: number) => {
    if (!price) return 'Entrada libre';
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price);
  };

  return (
    <div className="evento-list">
      {eventos.map(evento => (
        <div key={evento.id} className="evento-card" style={{
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          padding: '1.5rem',
          marginBottom: '1rem',
          backgroundColor: '#fff',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>{evento.nombre}</h3>
            </div>
          </div>
          
          <div className="evento-details" style={{ display: 'grid', gap: '0.75rem' }}>
            <div className="evento-date" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>📅</span>
              <strong>{formatDate(evento.fecha)}</strong>
            </div>
            
            <div className="evento-location" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>📍</span>
              <span>{evento.ubicacion}</span>
            </div>
            
            {evento.descripcion && (
              <div className="evento-description" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <span>📝</span>
                <span style={{ color: '#666', fontSize: '0.9rem' }}>{evento.descripcion}</span>
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '2rem', marginTop: '0.5rem' }}>
              <div className="evento-price" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>💰</span>
                <span style={{ fontWeight: '500', color: '#348e91' }}>
                  {formatPrice(evento.precio)}
                </span>
              </div>
              
              {evento.capacidad && (
                <div className="evento-capacity" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>👥</span>
                  <span>{evento.capacidad} personas</span>
                </div>
              )}
            </div>
          </div>
          
          {evento.created_at && (
            <div style={{ 
              marginTop: '1rem', 
              paddingTop: '1rem', 
              borderTop: '1px solid #f0f0f0',
              fontSize: '0.8rem',
              color: '#888'
            }}>
              Creado el {new Date(evento.created_at).toLocaleDateString('es-ES')}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default EventoList;
