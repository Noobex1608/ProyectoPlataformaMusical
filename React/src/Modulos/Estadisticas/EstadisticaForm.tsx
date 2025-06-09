import { useState } from 'react'
import { crearEstadistica } from './EstadisticaService'

export function EstadisticaForm() {
  const [form, setForm] = useState({
    reproducciones: '',
    likes: '',
    shares: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await crearEstadistica({
      reproducciones: Number(form.reproducciones),
      likes: Number(form.likes),
      shares: Number(form.shares),
    })
    alert('Estadística creada')
    setForm({ reproducciones: '', likes: '', shares: '' })
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="reproducciones" placeholder="Reproducciones" value={form.reproducciones} onChange={handleChange} />
      <input name="likes" placeholder="Likes" value={form.likes} onChange={handleChange} />
      <input name="shares" placeholder="Shares" value={form.shares} onChange={handleChange} />
      <button type="submit">Guardar</button>
    </form>
  )
}
