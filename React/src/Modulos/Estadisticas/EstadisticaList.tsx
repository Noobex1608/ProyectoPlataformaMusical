import { useEffect, useState } from 'react'
import { obtenerEstadisticas } from './EstadisticaService'

// Define el tipo de estadística
type Estadistica = {
  id: number
  reproducciones: number
  likes: number
  shares: number
}

export function EstadisticaList() {
  const [estadisticas, setEstadisticas] = useState<Estadistica[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    obtenerEstadisticas()
      .catch((err) => {
        console.error('Error obteniendo estadísticas:', err)
        setError('No se pudieron cargar las estadísticas.')
      })
  }, [])

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>
  }

  return (
    <div>
      <h2>Estadísticas</h2>
      {estadisticas.length === 0 ? (
        <p>No hay estadísticas disponibles.</p>
      ) : (
        <ul>
          {estadisticas.map((e) => (
            <li key={e.id}>
              🎵 {e.reproducciones} reproducciones — ❤️ {e.likes} likes — 🔁 {e.shares} shares
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
