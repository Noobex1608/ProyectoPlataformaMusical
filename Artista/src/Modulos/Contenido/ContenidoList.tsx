import { useEffect, useState } from 'react'
import { obtenerContenidos } from './ContenidoService'
import { Contenido } from './Contenido'

export function ContenidoList() {
  const [contenidos, setContenidos] = useState<Contenido[]>([])

  useEffect(() => {
    obtenerContenidos().then(setContenidos).catch(console.error)
  }, [])

  return (
    <div>
      <h2>Lista de Contenidos</h2>
      <ul>
        {contenidos.map((c) => (
          <li key={c.id}>
            {c.tipo} — {c.fecha_lanzamiento}<br />
            <pre>{c.lyrics}</pre>
          </li>
        ))}
      </ul>
    </div>
  )
}
