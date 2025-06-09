// src/modules/Colaboraciones/ColaboracionList.tsx
import { useEffect, useState } from 'react'
import { obtenerColaboraciones } from './ColaboracionesService'
import { Colaboracion } from './Colaboraciones'
import { Link } from 'react-router-dom'

export default function ColaboracionList() {
  const [colabs, setColabs] = useState<Colaboracion[]>([])

  useEffect(() => {
    obtenerColaboraciones().then(setColabs).catch(console.error)
  }, [])

  return (
    <div>
      <h2>Colaboraciones</h2>
      <Link to="/colaboraciones/nueva">Crear Colaboración</Link>
      <ul>
        {colabs.map((c) => (
          <li key={c.id}>
            👤 {c.colaborador} — 🧩 {c.rol} — 📅 {c.fecha}
          </li>
        ))}
      </ul>
    </div>
  )
}
