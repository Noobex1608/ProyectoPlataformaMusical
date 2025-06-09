import { useState } from 'react'
import { crearArtista } from './ArtistaService'
import { useNavigate } from 'react-router-dom'

export default function ArtistaForm() {
  const [nombre, setNombre] = useState('')
  const [genero, setGenero] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await crearArtista({ nombre, genero })
      navigate('/')
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Nuevo Artista</h2>
      <div>
        <label>Nombre:</label>
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} />
      </div>
      <div>
        <label>Género:</label>
        <input value={genero} onChange={(e) => setGenero(e.target.value)} />
      </div>
      <button type="submit">Crear</button>
    </form>
  )
}
