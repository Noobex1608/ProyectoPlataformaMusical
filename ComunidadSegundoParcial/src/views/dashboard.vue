<template>
  <headerComponent></headerComponent>
  <main class="dashboard">
    <h2>¡Bienvenido, {{ usuario?.name || "Usuario" }}! 🎶</h2>
    <p>Gestiona tu experiencia musical desde un solo lugar. Descubre, comparte y conecta con la comunidad.</p>

    <div class="dashboard-grid">
      <div class="dashboard-card" @click="goToPerfil">
        <span>👤</span>
        <h3>Perfil</h3>
        <p>Ver y editar tu perfil de usuario</p>
      </div>
      
      <div class="dashboard-card" @click="goToPlaylists">
        <span>🎶</span>
        <h3>Mis Playlists</h3>
        <p>Visualiza tus playlist o crea nuevas</p>
      </div>
      
      <div class="dashboard-card" @click="goToRadio">
        <span>📻</span>
        <h3>Radio</h3>
        <p>Escucha algo diferente, pruébalo</p>
      </div>
      
      <div class="dashboard-card" @click="goToClubes">
        <span>♣️</span>
        <h3>Clubes</h3>
        <p>Mira los clubes a los que estás unido (próximamente)</p>
      </div>
      
      <div class="dashboard-card" @click="goToMonetizacion">
        <span>💰</span>
        <h3>Monetización</h3>
        <p>Gestiona tus ingresos y estrategias de monetización</p>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { useUsuarioStore } from "../store/usuario";
import { useRouter } from "vue-router";
import headerComponent from "../components/headerComponent.vue";
const usuarioStore = useUsuarioStore();
const usuario = usuarioStore.usuario;
const router = useRouter();

function goToPerfil() {
  router.push("/perfil");
  
}
function goToPlaylists() {
  router.push("/playlist");
}

function goToRadio() {
  router.push("/radio");
}

function goToClubes() {
  router.push("/clubes");
}

function goToMonetizacion() {
  console.log('💰 Navegando al selector inteligente de monetización para fans');
  console.log('🎵 Usuario de comunidad accediendo a opciones de monetización');
  router.push("/monetizacion-selector");
}

</script>

<style scoped>
/* === Estilo del Dashboard === */
.dashboard {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  text-align: center;
  padding: 3rem 2rem;
  min-height: calc(100vh - 70px);
  color: #222;
  background-color: #f8f9fa;
  width: 100%;
  box-sizing: border-box;
  margin: 0;
  position: relative;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.dashboard h2 {
  color: #348e91;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-shadow: 0 2px 4px rgba(52, 142, 145, 0.1);
}

.dashboard > p {
  color: #666;
  font-size: 1.2rem;
  margin-bottom: 3rem;
  max-width: 600px;
  line-height: 1.6;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  width: 100%;
  justify-content: center;
  align-items: stretch;
  margin: 0 auto;
  padding: 0 1rem;
  justify-items: center;
  place-items: center;
  place-content: center;
}

.dashboard-grid > * {
  justify-self: center;
  align-self: center;
}

.dashboard-card {
  background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
  padding: 2.5rem 2rem;
  border-radius: 16px;
  box-shadow: 0 8px 25px rgba(52, 142, 145, 0.08);
  text-decoration: none;
  color: #222;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  overflow: hidden;
  width: 100%;
  max-width: 300px;
  min-height: 200px;
  justify-self: center;
  cursor: pointer;
}

.dashboard-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #348e91, #4facfe);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.dashboard-card:hover::before {
  transform: scaleX(1);
}

.dashboard-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 35px rgba(52, 142, 145, 0.15);
  border-color: rgba(52, 142, 145, 0.2);
}

.dashboard-card span {
  font-size: 3.5rem;
  display: block;
  margin-bottom: 1.5rem;
  filter: drop-shadow(0 4px 8px rgba(52, 142, 145, 0.1));
  transition: transform 0.3s ease;
}

.dashboard-card:hover span {
  transform: scale(1.1);
}

.dashboard-card h3 {
  font-size: 1.5rem;
  margin: 0.5rem 0 1rem 0;
  color: #348e91;
  font-weight: 600;
}

.dashboard-card p {
  color: #666;
  font-size: 1rem;
  line-height: 1.5;
  margin: 0;
}

.dashboard-card.disabled {
  opacity: 0.5;
  pointer-events: none;
}

/* Responsividad */
@media (max-width: 768px) {
  .dashboard {
    padding: 2rem 1rem;
  }
  
  .dashboard h2 {
    font-size: 2rem;
  }
  
  .dashboard > p {
    font-size: 1.1rem;
    margin-bottom: 2rem;
  }
  
  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .dashboard-card {
    padding: 2rem 1.5rem;
    max-width: 100%;
  }
  
  .dashboard-card span {
    font-size: 3rem;
  }
}

@media (max-width: 480px) {
  .dashboard {
    padding: 1.5rem 0.5rem;
  }
  
  .dashboard h2 {
    font-size: 1.8rem;
  }
  
  .dashboard-card {
    padding: 1.5rem 1rem;
  }
  
  .dashboard-card span {
    font-size: 2.5rem;
  }
  
  .dashboard-card h3 {
    font-size: 1.3rem;
  }
}
</style>
