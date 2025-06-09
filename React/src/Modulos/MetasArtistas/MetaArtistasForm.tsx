import { useState } from 'react'
import { crearMeta } from './MetaArtistasService'
import { useNavigate } from 'react-router-dom'

export default function MetasArtistasForm() {
  const [descripcion, setDescripcion] = useState('')
  const [fecha_limite, setFechaLimite] = useState('')
  const [artista_id, setArtistaId] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await crearMeta({ descripcion, fecha_limite, artista_id })
      navigate('/metas')
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Nueva Meta para Artista</h2>
      <input
        type="text"
        placeholder="ID del artista"
        value={artista_id}
        onChange={(e) => setArtistaId(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Descripción"
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        required
      />
      <input
        type="date"
        value={fecha_limite}
        onChange={(e) => setFechaLimite(e.target.value)}
        required
      />
      <button type="submit">Guardar Meta</button>
    </form>
  )
}
