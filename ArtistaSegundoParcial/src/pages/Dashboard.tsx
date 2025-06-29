import { Link } from 'react-router-dom';
import '../App.css';

function Dashboard() {
    return (
        <main className="dashboard">
            <h2>Bienvenido, Usuario 👋</h2>
            <p>Este es tu panel principal.</p>

            <div className="dashboard-grid">
                <Link to="/artista" className="dashboard-card">
                    <span>👤</span>
                    <h3>Perfil</h3>
                    <p>Ver y editar tu perfil de artista</p>
                </Link>

                <div className="dashboard-card disabled">
                    <span>🎧</span>
                    <h3>Playlists</h3>
                    <p>Visualiza tus estadísticas (pendiente)</p>
                </div>

                <div className="dashboard-card disabled">
                    <span>📻</span>
                    <h3>Radio</h3>
                    <p>Recomendaciones semanales (próximamente)</p>
                </div>

                <div className="dashboard-card disabled">
                    <span>🏛️</span>
                    <h3>Clubes</h3>
                    <p>Clubs a los que estás unido (próximamente)</p>
                </div>
            </div>
        </main>
    );
}

export default Dashboard;
