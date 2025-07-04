import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  
  // Usar URL absoluta para desarrollo en microfrontend (igual que ComunidadSegundoParcial)
  const logoUrl = new URL('../assets/logoBeats.svg', import.meta.url).href;

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
      </nav>
    </header>
  );
};

export default Header;
