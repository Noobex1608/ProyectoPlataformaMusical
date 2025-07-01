<template>
  <headerComponent></headerComponent>
  <div class="dashboard-container">
    <h2>Bienvenido, {{ usuario?.name || "Usuario" }} 👋</h2>

    <p class="subtitle">Este es tu panel principal.</p>

    <div class="cards">
      <div class="card" @click="goToPerfil">
        <h3>👤 Perfil</h3>
        <p>Ver y editar tu perfil de usuario</p>
      </div>
      <div class="card" @click="goToPlaylists">
        <h3>🎶 playlists</h3>
        <p>Visualiza tus estadísticas (pendiente)</p>
      </div>
      <div class="card" @click="goToRadio">
        <h3>📻 radio</h3>
        <p>Mira las recomendaciones de esta semana (próximamente)</p>
      </div>
      <div class="card" @click="goToClubes">
        <h3>♣️ Clubes</h3>
        <p>Mira los clubes a los que estas unido(próximamente)</p>
      </div>
    </div>
  </div>
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

</script>

<style scoped>
:root{
  background-color: black;
}
.dashboard-container {
  max-width: 900px;
  margin: 2rem auto;
  padding: 1rem;
  text-align: center;
}

.subtitle {
  margin-bottom: 2rem;
  color: #555;
}

.cards {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1.5rem;
}

.card {
  width: 250px;
  padding: 1.5rem;
  background-color: #f0f4f8;
  border-radius: 10px;
  cursor: pointer;
  transition: transform 0.2s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.card:hover {
  transform: translateY(-5px);
  background-color: #e1ecf4;
}

.card h3 {
  margin-bottom: 0.5rem;
  color: #007acc;
}

.card p {
  color: #555;
}
</style>
