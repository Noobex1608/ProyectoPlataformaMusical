import { useEffect, useState } from 'react';
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
    return <p style={{ textAlign: 'center', color: 'red' }}>Debes crear tu perfil de artista primero.</p>;
  }

  return (
    <section className="main-content">
      <EventoForm onGuardar={handleGuardar} artistaId={artista.id} />
      <h2 style={{ marginTop: '2rem' }}>Tus eventos</h2>
      <EventoList eventos={eventosDelArtista} />
    </section>
  );
};

export default EventoPage;
