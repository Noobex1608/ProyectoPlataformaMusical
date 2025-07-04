<template>
  <HeaderComponent />
  <main class="user-type-container">
    <div class="welcome-section">
      <h1>¡Bienvenido, {{ userName }}!</h1>
      <p class="subtitle">Verificación de tipo de usuario</p>
      <p class="description">Para completar el inicio de sesión, necesitamos verificar qué tipo de usuario eres para dirigirte a la plataforma correcta</p>
    </div>

    <div class="user-type-selection">
      <h2>Verificación de tipo de usuario</h2>
      <div class="button-grid">
        <button @click="selectUserType('artista')" class="user-type-btn artista-btn">
          <div class="button-icon">🎤</div>
          <div class="button-content">
            <h3>Soy Artista</h3>
            <p>Acceder al panel de gestión musical</p>
            <small>Gestiona tu música, álbumes, canciones y eventos</small>
          </div>
        </button>
        
        <button @click="selectUserType('comunidad')" class="user-type-btn comunidad-btn">
          <div class="button-icon">👥</div>
          <div class="button-content">
            <h3>Usuario de Comunidad</h3>
            <p>Explorar y disfrutar contenido musical</p>
            <small>Descubre música, sigue artistas y participa en la comunidad</small>
          </div>
        </button>
      </div>

      <div class="actions">
        <button @click="continueToDashboard" class="continue-btn">
          Saltar verificación (ir a Dashboard)
        </button>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUsuarioStore } from '../store/usuario';
import HeaderComponent from '../components/headerComponent.vue';

const router = useRouter();
const usuarioStore = useUsuarioStore();
const userName = ref('');
const selectedUserType = ref('');

onMounted(() => {
  // Obtener el nombre del usuario del store
  if (usuarioStore.usuario) {
    userName.value = usuarioStore.usuario.email?.split('@')[0] || 'Usuario';
  }
});

const selectUserType = (type: string) => {
  selectedUserType.value = type;
  console.log(`🔍 Verificando usuario como: ${type}`);
  
  // Guardar el tipo de usuario verificado
  localStorage.setItem('userType', type);
  localStorage.setItem('userVerified', 'true');
  
  // Completar el proceso de login navegando a la plataforma correspondiente
  completeLoginProcess(type);
};

const completeLoginProcess = (type: string) => {
  switch (type) {
    case 'artista':
      console.log('🎤 Verificación completada: Redirigiendo a ArtistaSegundoParcial...');
      if (typeof window.navigateToArtistaV2 === 'function') {
        window.navigateToArtistaV2();
      } else {
        // Fallback - ir a ArtistaSegundoParcial
        window.location.href = 'http://localhost:5178';
      }
      break;
    
    case 'comunidad':
      console.log('� Verificación completada: Redirigiendo a Dashboard de Comunidad...');
      router.push('/dashboard');
      break;
    
    default:
      router.push('/dashboard');
  }
};

const continueToDashboard = () => {
  router.push('/dashboard');
};
</script>

<style scoped>
.user-type-container {
  min-height: calc(100vh - 70px);
  padding: 2rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.welcome-section {
  text-align: center;
  margin-bottom: 3rem;
  max-width: 600px;
}

.welcome-section h1 {
  color: #348e91;
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.subtitle {
  color: #666;
  font-size: 1.2rem;
  margin-bottom: 1rem;
}

.description {
  color: #555;
  font-size: 1rem;
  line-height: 1.6;
}

.user-type-selection {
  width: 100%;
  max-width: 900px;
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.user-type-selection h2 {
  text-align: center;
  color: #333;
  margin-bottom: 2rem;
  font-size: 1.8rem;
}

.button-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  margin-bottom: 2rem;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}

.user-type-btn {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  min-height: 120px;
}

.user-type-btn:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.artista-btn:hover {
  border-color: #6c5ce7;
  background: linear-gradient(135deg, #6c5ce7, #a29bfe);
  color: white;
}

.comunidad-btn:hover {
  border-color: #348e91;
  background: linear-gradient(135deg, #348e91, #4ecdc4);
  color: white;
}

.button-icon {
  font-size: 2.5rem;
  line-height: 1;
  flex-shrink: 0;
}

.button-content h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.button-content p {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  opacity: 0.9;
}

.button-content small {
  font-size: 0.85rem;
  opacity: 0.7;
  line-height: 1.3;
}

.actions {
  text-align: center;
  padding-top: 1rem;
  border-top: 1px solid #e1e5e9;
}

.continue-btn {
  background: #348e91;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.continue-btn:hover {
  background: #2c7a7d;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(52, 142, 145, 0.3);
}

/* Responsive design */
@media (max-width: 768px) {
  .user-type-container {
    padding: 1rem;
  }
  
  .welcome-section h1 {
    font-size: 2rem;
  }
  
  .button-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    max-width: 400px;
  }
  
  .user-type-btn {
    padding: 1.5rem;
    min-height: auto;
  }
  
  .button-icon {
    font-size: 2rem;
  }
}
</style>
