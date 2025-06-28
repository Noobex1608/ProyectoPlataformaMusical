import './App.css'

function App() {
  // const [count, setCount] = useState(0)

  
  return (
    <main>
      <h2>Bienvenido, ARTISTA 👋</h2>
      <p>Este es tu panel principal.</p>

      <div className="card-grid">
        <div className="card">
          <h3>👤 Perfil</h3>
          <p>Ver y editar tu perfil de artista</p>
        </div>
        <div className="card">
          <h3>🎵 Álbumes</h3>
          <p>Gestiona los álbumes de tu discografía</p>
        </div>
        <div className="card">
          <h3>🎶 Canciones</h3>
          <p>Sube y edita tus canciones</p>
        </div>
        <div className="card">
          <h3>📅 Eventos</h3>
          <p>Agrega tus conciertos y shows</p>
        </div>
      </div>
    </main>
  )
}

export default App;
