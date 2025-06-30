import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ArtistaPage from './pages/ArtistaPage';
import PerfilArtistaPage from './pages/PerfilArtistaPage';
// (luego agregas PerfilPage, EventosPage, etc.)

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/artista" element={<ArtistaPage />} />
        <Route path="/estadisticas" element={<PerfilArtistaPage />} />
      </Routes>
    </Router>
  );
}

export default App;
