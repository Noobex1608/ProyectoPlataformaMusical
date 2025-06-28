<template>
  <header class="header">
    <div class="logo">
      <router-link to="/">🎶 MiApp</router-link>
    </div>

    <nav class="nav">
      <router-link to="/" class="link">Inicio</router-link>
      <router-link to="/perfil" v-if="isAuthenticated" class="link">Perfil</router-link>
      <router-link to="/login" v-if="!isAuthenticated" class="link">Iniciar sesión</router-link>
      <router-link to="/registro" v-if="!isAuthenticated" class="link">Registrarse</router-link>
      <button @click="logout" v-if="isAuthenticated" class="logout">Cerrar sesión</button>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { useUsuarioStore } from "../store/usuario";
import { useRouter } from "vue-router";

const usuarioStore = useUsuarioStore();
const router = useRouter();

const isAuthenticated = usuarioStore.isAuthenticated;

function logout() {
  usuarioStore.clearUsuario();
  router.push("/");
}
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #007acc;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin: 0;
}

.logo a {
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
  text-decoration: none;
}

.nav {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.link {
  color: white;
  text-decoration: none;
  font-weight: 500;
}

.link:hover {
  text-decoration: underline;
}

.logout {
  background: transparent;
  border: 1px solid white;
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  cursor: pointer;
}

.logout:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

</style>
