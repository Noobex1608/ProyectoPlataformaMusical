import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ArtistaPage from './pages/ArtistaPage';
import PerfilArtistaPage from './pages/PerfilArtistaPage';
import EventoPage from './pages/EventoPage';
import SongPage from './pages/SongPage';
import AlbumPage from './pages/AlbumPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/artista" element={<ArtistaPage />} />
        <Route path="/estadisticas" element={<PerfilArtistaPage />} />
        <Route path="/eventos" element={<EventoPage />} />
        <Route path="/canciones" element={<SongPage />} />
         <Route path="/albumes" element={<AlbumPage />} />
      </Routes>
    </Router>
  );
}

export default App;
