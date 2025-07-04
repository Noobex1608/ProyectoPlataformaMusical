import { useState } from 'react';
import type { Evento } from '../types/Evento';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  onGuardar: (evento: Evento) => void;
  artistaId: string;
}

const EventoForm = ({ onGuardar, artistaId }: Props) => {
  const [nuevo, setNuevo] = useState({
    nombre: '',
    fecha: '',
    ubicacion: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const evento: Evento = {
      id: uuidv4(),
      artistaId,
      ...nuevo,
    };
    onGuardar(evento);
    setNuevo({ nombre: '', fecha: '', ubicacion: '' });
  };

  return (
    <div className="evento-form">
      <h3>🎤 Agregar Nuevo Evento</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nombre del evento:</label>
          <input 
            type="text"
            value={nuevo.nombre} 
            onChange={e => setNuevo({ ...nuevo, nombre: e.target.value })} 
            required 
            className="form-input"
            placeholder="Ej: Concierto Acústico en el Park"
          />
        </div>
        <div className="form-group">
          <label>Fecha del evento:</label>
          <input 
            type="date" 
            value={nuevo.fecha} 
            onChange={e => setNuevo({ ...nuevo, fecha: e.target.value })} 
            required 
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label>Ubicación:</label>
          <input 
            type="text"
            value={nuevo.ubicacion} 
            onChange={e => setNuevo({ ...nuevo, ubicacion: e.target.value })} 
            required 
            className="form-input"
            placeholder="Ej: Teatro Municipal, Ciudad de México"
          />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            ✨ Crear Evento
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventoForm;
