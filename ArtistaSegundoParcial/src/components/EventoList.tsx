import type { Evento } from '../types/Evento';

interface Props {
  eventos: Evento[];
}

const EventoList = ({ eventos }: Props) => {
  if (eventos.length === 0) {
    return <p style={{ textAlign: 'center' }}>No hay eventos registrados.</p>;
  }

  return (
    <div className="card-lista">
      {eventos.map(e => (
        <div key={e.id} className="card">
          <div>
            <h3>{e.nombre}</h3>
            <p><strong>Fecha:</strong> {e.fecha}</p>
            <p><strong>Ubicación:</strong> {e.ubicacion}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EventoList;
