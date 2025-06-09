import { useState } from 'react'
import { crearEvento } from './EventosService'
import { useNavigate } from 'react-router-dom'

export default function EventoForm() {
  const [evento, setEvento] = useState({
    artista_id: 1,
    nombre: '',
    fecha: '',
    ubicacion: '',
  })

  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEvento({ ...evento, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await crearEvento(evento)
      navigate('/eventos')
    } catch (error) {
      alert('Error al crear evento')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Nuevo Evento</h2>
      <input name="nombre" placeholder="Nombre" onChange={handleChange} />
      <input name="fecha" type="date" onChange={handleChange} />
      <input name="ubicacion" placeholder="Ubicación" onChange={handleChange} />
      <button type="submit">Guardar</button>
    </form>
  )
}
