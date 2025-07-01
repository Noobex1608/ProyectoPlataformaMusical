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
    <form className="formulario" onSubmit={handleSubmit}>
      <h2>Agregar Evento</h2>
      <div className="form-group">
        <label>Nombre:</label>
        <input value={nuevo.nombre} onChange={e => setNuevo({ ...nuevo, nombre: e.target.value })} required />
      </div>
      <div className="form-group">
        <label>Fecha:</label>
        <input type="date" value={nuevo.fecha} onChange={e => setNuevo({ ...nuevo, fecha: e.target.value })} required />
      </div>
      <div className="form-group">
        <label>Ubicación:</label>
        <input value={nuevo.ubicacion} onChange={e => setNuevo({ ...nuevo, ubicacion: e.target.value })} required />
      </div>
      <button type="submit" className="btn-agregar">Agregar</button>
    </form>
  );
};

export default EventoForm;
