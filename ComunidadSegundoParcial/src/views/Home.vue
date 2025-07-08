<template>
  <HeaderComponent />
  <main class="user-type-container">
    <div class="welcome-section">
      <h1>¡Bienvenido a RawBeats! 🎵</h1>
      <p class="subtitle">Plataforma Musical Completa</p>
      <p class="description">Para comenzar, selecciona qué tipo de usuario eres. Esto nos ayudará a dirigirte a la experiencia correcta.</p>
    </div>

    <div class="user-type-selection">
      <h2>¿Qué tipo de usuario eres?</h2>
      <div class="button-grid">
        <button @click="selectUserType('artist')" class="user-type-btn artista-btn">
          <div class="button-icon">🎤</div>
          <div class="button-content">
            <h3>Soy Artista</h3>
            <p>Acceder al panel de gestión musical</p>
            <small>Gestiona tu música, álbumes, canciones y eventos</small>
          </div>
        </button>
        
        <button @click="selectUserType('fan')" class="user-type-btn comunidad-btn">
          <div class="button-icon">👥</div>
          <div class="button-content">
            <h3>Usuario de Comunidad</h3>
            <p>Explorar y disfrutar contenido musical</p>
            <small>Descubre música, sigue artistas y participa en la comunidad</small>
          </div>
        </button>
      </div>
      
      </div>
  </main>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import HeaderComponent from '../components/headerComponent.vue';

const router = useRouter();

const selectUserType = (userType: string) => {
  // Guardar la selección en localStorage
  localStorage.setItem('selectedUserType', userType);
  
  // Redirigir al login con el tipo seleccionado
  router.push(`/login?userType=${userType}`);
};
</script>

<style scoped>
.user-type-container {
  min-height: calc(100vh - 70px);
  padding: 2rem;
  background: linear-gradient(135deg, #186264 0%, #57e7ec 100%);
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
  color: #f2f2f2;
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.subtitle {
  color: #f2f2f2;
  font-size: 1.2rem;
  margin-bottom: 1rem;
  font-weight: 600;
}

.description {
  color: #f2f2f2;
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

.action-buttons {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e0e0e0;
  text-align: center;
}

.action-text {
  color: #555;
  font-size: 1rem;
  margin-bottom: 1.5rem;
  font-weight: 500;
}

.button-row {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.action-btn {
  display: inline-block;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.login-btn {
  background-color: #348e91;
  color: white;
}

.login-btn:hover {
  background-color: #2c7a7d;
  transform: translateY(-2px);
}

.register-btn {
  background-color: transparent;
  color: #348e91;
  border-color: #348e91;
}

.register-btn:hover {
  background-color: #348e91;
  color: white;
  transform: translateY(-2px);
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
