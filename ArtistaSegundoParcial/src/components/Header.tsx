import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../supabase';
import '../styles/Header.css';

const Header = () => {
  const location = useLocation();
  
  // Usar URL absoluta para desarrollo en microfrontend (igual que ComunidadSegundoParcial)
  const logoUrl = new URL('../assets/logoBeats.svg', import.meta.url).href;

  const handleLogout = async () => {
    try {
      console.log('🔄 Cerrando sesión...');
      
      // Cerrar sesión en Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Error al cerrar sesión:', error.message);
        return;
      }
      
      console.log('✅ Sesión cerrada exitosamente');
      
      // Limpiar localStorage
      localStorage.removeItem('selectedUserType');
      localStorage.removeItem('usuario');
      
      // Redirigir al home de ComunidadSegundoParcial
      window.location.href = '/';
      
    } catch (err) {
      console.error('❌ Error al cerrar sesión:', err);
    }
  };

  return (
    <header className="header">
      <div className="logo">
        <Link to="/">
          <span>RawBeats</span>
          <img src={logoUrl} alt="RawBeats Logo" />
        </Link>
      </div>

      <nav className="nav">
        <Link 
          to="/" 
          className={`link ${location.pathname === '/' ? 'active' : ''}`}
        >
          Dashboard
        </Link>
        <Link 
          to="/artista" 
          className={`link ${location.pathname === '/artista' ? 'active' : ''}`}
        >
          Mi Perfil
        </Link>
        <Link 
          to="/estadisticas" 
          className={`link ${location.pathname === '/estadisticas' ? 'active' : ''}`}
        >
          Estadísticas
        </Link>
        <Link 
          to="/canciones" 
          className={`link ${location.pathname === '/canciones' ? 'active' : ''}`}
        >
          Canciones
        </Link>
        <Link 
          to="/albumes" 
          className={`link ${location.pathname === '/albumes' ? 'active' : ''}`}
        >
          Álbumes
        </Link>
        <Link 
          to="/eventos" 
          className={`link ${location.pathname === '/eventos' ? 'active' : ''}`}
        >
          Eventos
        </Link>
        
        <button 
          onClick={handleLogout}
          className="logout-btn"
          title="Cerrar sesión"
        >
          <span className="logout-icon">🚪</span>
          Cerrar Sesión
        </button>
      </nav>
    </header>
  );
};

export default Header;
