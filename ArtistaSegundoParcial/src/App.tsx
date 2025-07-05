import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import ArtistaPage from './pages/ArtistaPage';
import PerfilArtistaPage from './pages/PerfilArtistaPage';
import EventoPage from './pages/EventoPage';
import SongPage from './pages/SongPage';
import AlbumPage from './pages/AlbumPage';
import AlbumDetailPage from './pages/AlbumDetailPage';

function App() {
  return (
    <Router>
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/artista" element={<ArtistaPage />} />
          <Route path="/estadisticas" element={<PerfilArtistaPage />} />
          <Route path="/eventos" element={<EventoPage />} />
          <Route path="/canciones" element={<SongPage />} />
          <Route path="/albumes" element={<AlbumPage />} />
          <Route path="/albumes/:id" element={<AlbumDetailPage />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
