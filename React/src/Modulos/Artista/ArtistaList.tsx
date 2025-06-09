import { useEffect, useState } from 'react'
import { obtenerArtistas } from './ArtistaService'
import { Artista } from './Artista'
import { Link } from 'react-router-dom'


export default function ArtistaList() {
  const [artistas, setArtistas] = useState<Artista[]>([])

  useEffect(() => {
    obtenerArtistas().then(setArtistas).catch(console.error)
  }, [])

  return (
    <div>
      <h2>Lista de Artistas</h2>
      <Link to="/nuevo-artista">Crear Artista</Link>
      <Link to="/estadisticas">Ver Estadísticas</Link>
      <ul>
        {artistas.map((a) => (
          <li key={a.id}>
            {a.nombre} — {a.genero}
          </li>
        ))}
      </ul>
    </div>
  )
}
