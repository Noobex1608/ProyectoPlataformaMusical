// src/modules/Colaboraciones/ColaboracionForm.tsx
import { useState } from 'react'
import { crearColaboracion } from './ColaboracionesService'
import { useNavigate } from 'react-router-dom'

export default function ColaboracionForm() {
  const [colab, setColab] = useState({
    artista_id: '',
    colaborador: '',
    rol: '',
    fecha: ''
  })
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setColab({ ...colab, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await crearColaboracion(colab)
      navigate('/colaboraciones')
    } catch (error) {
      console.error('Error al crear colaboración', error)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Nueva Colaboración</h2>
      <input name="artista_id" placeholder="ID del Artista" onChange={handleChange} required />
      <input name="colaborador" placeholder="Colaborador" onChange={handleChange} required />
      <input name="rol" placeholder="Rol" onChange={handleChange} required />
      <input name="fecha" type="date" onChange={handleChange} required />
      <button type="submit">Guardar</button>
    </form>
  )
}
