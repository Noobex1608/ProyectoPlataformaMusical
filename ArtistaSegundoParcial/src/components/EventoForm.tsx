import { useState } from 'react';
import type { Evento } from '../types/Evento';

interface Props {
  onGuardar: (evento: Omit<Evento, 'id' | 'created_at' | 'updated_at'>) => void;
  artistaId: string;
}

const EventoForm = ({ onGuardar, artistaId }: Props) => {
  const [nuevo, setNuevo] = useState({
    nombre: '',
    fecha: '',
    ubicacion: '',
    descripcion: '',
    precio: '',
    capacidad: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const evento: Omit<Evento, 'id' | 'created_at' | 'updated_at'> = {
      artista_id: artistaId,
      nombre: nuevo.nombre,
      fecha: nuevo.fecha,
      ubicacion: nuevo.ubicacion,
      descripcion: nuevo.descripcion || undefined,
      precio: nuevo.precio ? parseFloat(nuevo.precio) : undefined,
      capacidad: nuevo.capacidad ? parseInt(nuevo.capacidad) : undefined,
    };
    
    onGuardar(evento);
    setNuevo({ 
      nombre: '', 
      fecha: '', 
      ubicacion: '', 
      descripcion: '', 
      precio: '', 
      capacidad: ''
    });
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
        
        <div className="form-group">
          <label>Descripción (opcional):</label>
          <textarea 
            value={nuevo.descripcion} 
            onChange={e => setNuevo({ ...nuevo, descripcion: e.target.value })} 
            className="form-input"
            placeholder="Describe tu evento..."
            rows={3}
          />
        </div>
        
        <div className="form-row" style={{ display: 'flex', gap: '1rem' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Precio (opcional):</label>
            <input 
              type="number"
              value={nuevo.precio} 
              onChange={e => setNuevo({ ...nuevo, precio: e.target.value })} 
              className="form-input"
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>
          
          <div className="form-group" style={{ flex: 1 }}>
            <label>Capacidad (opcional):</label>
            <input 
              type="number"
              value={nuevo.capacidad} 
              onChange={e => setNuevo({ ...nuevo, capacidad: e.target.value })} 
              className="form-input"
              placeholder="100"
              min="1"
            />
          </div>
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
