import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ArtistaPage from './pages/ArtistaPage';
// (luego agregas PerfilPage, EventosPage, etc.)

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/artista" element={<ArtistaPage />} />
        {/* Agrega otras entidades luego */}
      </Routes>
    </Router>
  );
}

export default App;
