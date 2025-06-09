import { useState } from 'react'
import { crearContenido } from './ContenidoService'
import { Contenido } from './Contenido'

export function ContenidoForm() {
  const [contenido, setContenido] = useState<Contenido>({
    tipo: '',
    fecha_lanzamiento: '',
    lyrics: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setContenido({ ...contenido, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await crearContenido(contenido)
      alert('Contenido creado con éxito')
      setContenido({ tipo: '', fecha_lanzamiento: '', lyrics: '' })
    } catch (error) {
      console.error(error)
      alert('Error al crear contenido')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Crear Contenido</h2>
      <input name="tipo" value={contenido.tipo} onChange={handleChange} placeholder="Tipo" required />
      <input name="fecha_lanzamiento" value={contenido.fecha_lanzamiento} onChange={handleChange} placeholder="Fecha de Lanzamiento" type="date" required />
      <textarea name="lyrics" value={contenido.lyrics} onChange={handleChange} placeholder="Letra" required />
      <button type="submit">Guardar</button>
    </form>
  )
}
