// src/Router.tsx 

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ArtistaList from './Modulos/Artista/ArtistaList'
import ArtistaForm from './Modulos/Artista/ArtistaForm'
import { ContenidoPage } from './Modulos/Contenido/ContenidoPage'
import { EstadisticaPage } from './Modulos/Estadisticas/EstadisticaPage'
import ColaboracionesList from './Modulos/Colaboraciones/ColaboracionesList'
import ColaboracionesForm from './Modulos/Colaboraciones/ColaboracionesForm'
import EventoList from './Modulos/Eventos/EventosList'
import EventoForm from './Modulos/Eventos/EventosForm'
import MetasArtistasList from './Modulos/MetasArtistas/MetaArtistasList'
import MetasArtistasForm from './Modulos/MetasArtistas/MetaArtistasForm'


export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ArtistaList />} />
        <Route path="/nuevo-artista" element={<ArtistaForm />} />
        <Route path="/nuevo-contenido" element={<ContenidoPage />} />
        <Route path="/estadisticas" element={<EstadisticaPage />} />
        <Route path="/colaboraciones" element={<ColaboracionesList />} />
        <Route path="/nuevo-colaboraciones" element={<ColaboracionesForm />} />
        <Route path="/eventos" element={<EventoList />} />
        <Route path="/nuevo-eventos" element={<EventoForm />} />
        <Route path="/metas" element={<MetasArtistasList />} />
        <Route path="/nuevo-metas" element={<MetasArtistasForm />} />
      </Routes>
    </BrowserRouter>
  )
}
