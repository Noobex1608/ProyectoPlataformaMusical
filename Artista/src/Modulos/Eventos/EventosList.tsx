import { useEffect, useState } from 'react'
import { obtenerEventos } from './EventosService'
import { Evento } from './Eventos'
import { Link } from 'react-router-dom'

export default function EventoList() {
  const [eventos, setEventos] = useState<Evento[]>([])

  useEffect(() => {
    obtenerEventos().then(setEventos).catch(console.error)
  }, [])

  return (
    <div>
      <h2>Eventos</h2>
      <Link to="/eventos/nuevo">Crear Evento</Link>
      <ul>
        {eventos.map((e) => (
          <li key={e.id}>
            📅 {e.nombre} - {e.fecha} en {e.ubicacion}
          </li>
        ))}
      </ul>
    </div>
  )
}
