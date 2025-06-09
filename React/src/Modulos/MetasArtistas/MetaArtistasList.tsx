import { useEffect, useState } from 'react'
import { obtenerMetas } from './MetaArtistasService'
import { MetasArtistas } from './MetasArtistas'
import { Link } from 'react-router-dom'

export default function MetasArtistasList() {
  const [metas, setMetas] = useState<MetasArtistas[]>([])

  useEffect(() => {
    obtenerMetas().then(setMetas).catch(console.error)
  }, [])

  return (
    <div>
      <h2>Lista de Metas</h2>
      <Link to="/metas/nueva">Crear Meta</Link>
      <ul>
        {metas.map((meta) => (
          <li key={meta.id}>
            🎯 {meta.descripcion} - 🗓️ {meta.fecha_limite}
          </li>
        ))}
      </ul>
    </div>
  )
}
