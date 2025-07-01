import { Link } from 'react-router-dom';
import '../App.css';

function Dashboard() {
  return (
    <main className="dashboard">
      <h2>Bienvenido, Artista 🎶</h2>
      <p>Accede a tus secciones para gestionar tu perfil musical.</p>

      <div className="dashboard-grid">
        <Link to="/artista" className="dashboard-card">
          <span>👤</span>
          <h3>Perfil del Artista</h3>
          <p>Visualiza y edita tu información artística</p>
        </Link>

        <Link to="/estadisticas" className="dashboard-card">
            <span>📈</span>
            <h3>Estadísticas</h3>
            <p>Reproducciones, seguidores y más</p>
        </Link>


        <Link to="/eventos" className="dashboard-card">
          <span>🎤</span>
          <h3>Eventos</h3>
          <p>Agrega y gestiona tus presentaciones</p>
        </Link>

        <Link to="/canciones" className="dashboard-card">
          <span>🎵</span>
          <h3>Canciones</h3>
          <p>Sube y administra tus temas musicales</p>
        </Link>

        <Link to="/albumes" className="dashboard-card">
          <span>💿</span>
          <h3>Álbumes</h3>
          <p>Crea y organiza tus álbumes</p>
        </Link>
      </div>
    </main>
  );
}

export default Dashboard;
