import { Link } from 'react-router-dom';
import '../App.css';

function Dashboard() {
  return (
    <main className="dashboard">
      <h2>¡Bienvenido, Artista! 🎶</h2>
      <p>Gestiona tu carrera musical desde un solo lugar. Crea, comparte y conecta con tu audiencia.</p>

      <div className="dashboard-grid">
        <Link to="/artista" className="dashboard-card">
          <span>👤</span>
          <h3>Perfil del Artista</h3>
          <p>Configura y personaliza tu información artística</p>
        </Link>

        <Link to="/estadisticas" className="dashboard-card">
          <span>📈</span>
          <h3>Estadísticas</h3>
          <p>Analiza reproducciones, seguidores y métricas</p>
        </Link>

        <Link to="/eventos" className="dashboard-card">
          <span>🎤</span>
          <h3>Eventos</h3>
          <p>Programa y gestiona tus presentaciones en vivo</p>
        </Link>

        <Link to="/canciones" className="dashboard-card">
          <span>🎵</span>
          <h3>Canciones</h3>
          <p>Sube y administra tu biblioteca musical</p>
        </Link>

        <Link to="/albumes" className="dashboard-card">
          <span>💿</span>
          <h3>Álbumes</h3>
          <p>Organiza tus canciones en colecciones</p>
        </Link>
      </div>
    </main>
  );
}

export default Dashboard;
