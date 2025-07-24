// ArtistaSegundoParcial/src/components/ExampleNewStateUsage.jsx
/**
 * Ejemplo de cómo usar el nuevo sistema de estado en un componente React
 */

import React, { useEffect } from 'react';
import { 
  useAuth, 
  useUI, 
  useArtistaState, 
  useArtistaNotifications 
} from '../services/newStateIntegration.jsx';

export default function ExampleNewStateUsage() {
  const auth = useAuth();
  const { theme, setTheme, notifications, markNotificationRead } = useUI();
  const { selectedArtist, setSelectedArtist, addToSharedContent } = useArtistaState();
  const { notifyContentUploaded, notifyProfileUpdated } = useArtistaNotifications();

  // Ejemplo de efecto que reacciona a cambios de autenticación
  useEffect(() => {
    if (auth.isAuthenticated && auth.user) {
      console.log('Usuario autenticado:', auth.user.name);
      
      // Si el usuario es un artista, seleccionar automáticamente
      if (auth.user.type === 'artist') {
        setSelectedArtist(auth.user);
      }
    }
  }, [auth.isAuthenticated, auth.user]);

  const handleUploadContent = async () => {
    try {
      // Simular subida de contenido
      const newContent = {
        id: Date.now(),
        title: 'Mi nueva canción',
        type: 'audio',
        uploadDate: new Date()
      };
      
      // Agregar al contenido compartido
      addToSharedContent(newContent);
      
      // Mostrar notificación
      notifyContentUploaded(newContent.title);
      
    } catch (error) {
      console.error('Error subiendo contenido:', error);
    }
  };

  const handleUpdateProfile = () => {
    // Simular actualización de perfil
    notifyProfileUpdated();
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="example-new-state">
      <h2>🎭 Ejemplo de Nuevo Estado Global</h2>
      
      {/* Estado de autenticación */}
      <div className="auth-section">
        <h3>Autenticación</h3>
        {auth.isAuthenticated ? (
          <div>
            <p>✅ Usuario: {auth.user?.name || 'Usuario'}</p>
            <p>🕒 Último login: {new Date(auth.lastLoginTime).toLocaleString()}</p>
            <button onClick={auth.logout}>Cerrar sesión</button>
          </div>
        ) : (
          <div>
            <p>❌ No autenticado</p>
            <button onClick={() => auth.login({ name: 'Artista Demo' }, 'demo-token')}>
              Login Demo
            </button>
          </div>
        )}
      </div>

      {/* Estado de UI */}
      <div className="ui-section">
        <h3>Interfaz</h3>
        <p>Tema actual: {theme}</p>
        <button onClick={toggleTheme}>
          Cambiar a {theme === 'light' ? 'oscuro' : 'claro'}
        </button>
        
        {notifications.length > 0 && (
          <div className="notifications">
            <h4>Notificaciones ({notifications.filter(n => !n.read).length} sin leer)</h4>
            {notifications.slice(0, 3).map(notification => (
              <div 
                key={notification.id} 
                className={`notification ${notification.type} ${notification.read ? 'read' : 'unread'}`}
                onClick={() => markNotificationRead(notification.id)}
              >
                <strong>{notification.title}</strong>
                <p>{notification.message}</p>
                <small>{new Date(notification.timestamp).toLocaleString()}</small>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Estado específico de artista */}
      <div className="artist-section">
        <h3>Estado del Artista</h3>
        {selectedArtist ? (
          <div>
            <p>🎤 Artista seleccionado: {selectedArtist.name || selectedArtist.artistName}</p>
            <button onClick={handleUploadContent}>Subir contenido</button>
            <button onClick={handleUpdateProfile}>Actualizar perfil</button>
          </div>
        ) : (
          <p>No hay artista seleccionado</p>
        )}
      </div>

      {/* Debug */}
      <div className="debug-section">
        <h3>Debug</h3>
        <button onClick={() => {
          const state = window.shellServices.stateManager.getState();
          console.log('🔍 Estado completo:', state);
        }}>
          Log Estado Completo
        </button>
      </div>

      <style jsx>{`
        .example-new-state {
          padding: 20px;
          max-width: 800px;
          margin: 0 auto;
        }
        
        .auth-section, .ui-section, .artist-section, .debug-section {
          margin: 20px 0;
          padding: 15px;
          border: 1px solid #ddd;
          border-radius: 8px;
        }
        
        .notification {
          padding: 10px;
          margin: 5px 0;
          border-radius: 4px;
          cursor: pointer;
          transition: opacity 0.3s;
        }
        
        .notification.unread {
          font-weight: bold;
          border-left: 4px solid #348e91;
        }
        
        .notification.read {
          opacity: 0.7;
        }
        
        .notification.success {
          background-color: #d4edda;
          color: #155724;
        }
        
        .notification.error {
          background-color: #f8d7da;
          color: #721c24;
        }
        
        .notification.info {
          background-color: #d1ecf1;
          color: #0c5460;
        }
        
        button {
          background-color: #348e91;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          margin: 5px;
        }
        
        button:hover {
          background-color: #2a7175;
        }
        
        h3 {
          color: #348e91;
          margin-bottom: 10px;
        }
      `}</style>
    </div>
  );
}
