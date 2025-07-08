<template>
  <HeaderComponent />
  <div class="login-type-container">
    <div class="selection-card">
      <h2>¿Cómo quieres iniciar sesión?</h2>
      <p>Selecciona tu tipo de cuenta para acceder</p>
      
      <div class="type-buttons">
        <button 
          @click="selectUserType('fan')" 
          class="type-btn community-btn"
        >
          <span class="btn-icon">👥</span>
          <div class="btn-content">
            <h3>Usuario de Comunidad</h3>
            <p>Acceder a la plataforma de música</p>
          </div>
        </button>
        
        <button 
          @click="selectUserType('artist')" 
          class="type-btn artist-btn"
        >
          <span class="btn-icon">🎤</span>
          <div class="btn-content">
            <h3>Artista</h3>
            <p>Acceder al panel de artista</p>
          </div>
        </button>
      </div>
      
      <div class="register-link">
        <p>¿No tienes cuenta? 
          <router-link to="/registro-tipo">
            Regístrate aquí
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import HeaderComponent from "../components/headerComponent.vue";

const router = useRouter();

const selectUserType = (userType: string) => {
  // Guardar la selección en localStorage
  localStorage.setItem('selectedUserType', userType);
  
  // Redirigir al login con el tipo seleccionado
  router.push(`/login?userType=${userType}`);
};
</script>

<style scoped>
.login-type-container {
  min-height: calc(100vh - 80px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ffffff 0%, #cfcfd1 100%);
  padding: 2rem;
}

.selection-card {
  background: white;
  border-radius: 12px;
  padding: 3rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  width: 100%;
  text-align: center;
}

.selection-card h2 {
  color: #333;
  margin-bottom: 0.5rem;
  font-size: 2.2rem;
  font-weight: 600;
}

.selection-card > p {
  color: #666;
  margin-bottom: 3rem;
  font-size: 1.1rem;
}

.type-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.type-btn {
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  min-height: 180px;
}

.type-btn:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.community-btn:hover {
  border-color: #348e91;
  background: linear-gradient(135deg, #f8fdfd 0%, #e8f4f5 100%);
}

.artist-btn:hover {
  border-color: #ff6b35;
  background: linear-gradient(135deg, #fff8f6 0%, #fef0ec 100%);
}

.btn-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.btn-content {
  text-align: center;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.btn-content h3 {
  color: #333;
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0;
}

.btn-content p {
  color: #666;
  font-size: 0.95rem;
  margin: 0;
}

.register-link {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e0e0e0;
}

.register-link p {
  color: #666;
  margin: 0;
}

.register-link a {
  color: #348e91;
  text-decoration: none;
  font-weight: 500;
}

.register-link a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .login-type-container {
    padding: 1rem;
  }
  
  .selection-card {
    padding: 2rem;
  }
  
  .type-buttons {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .selection-card h2 {
    font-size: 1.8rem;
  }
  
  .type-btn {
    min-height: auto;
    padding: 1.5rem;
  }
  
  .btn-content h3 {
    font-size: 1.2rem;
  }
}
</style>
