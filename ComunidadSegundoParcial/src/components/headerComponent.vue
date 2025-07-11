<template>
  <header class="header">
    <div class="logo">
      <router-link to="/" v-if="!isAuthenticated">
        <span>RawBeats</span>
        <img :src="logoUrl" alt="Logo" />
      </router-link>
      <router-link to="/dashboard" v-if="isAuthenticated">
        <span>RawBeats</span>
        <img :src="logoUrl" alt="Logo" />
      </router-link>
    </div>

    <nav class="nav">
      <router-link to="/" v-if="!isAuthenticated" class="link">Inicio</router-link>
      <router-link to="/dashboard" v-if="isAuthenticated" class="link">Explorar</router-link>
      <router-link to="/perfil" v-if="isAuthenticated" class="link">Perfil</router-link>
      <router-link to="/login-tipo" v-if="!isAuthenticated"class="link">Iniciar Sesion</router-link>
      <router-link to="/registro-tipo" v-if="!isAuthenticated" class="link">Registrarse</router-link>
      <button @click="logout" v-if="isAuthenticated" class="logout"><strong>Cerrar sesión</strong></button>
    </nav>
  </header>
</template>


<script setup lang="ts">
import { useUsuarioStore } from "../store/usuario";
import { useRouter } from "vue-router";

// Usar URL absoluta para desarrollo en microfrontend
const logoUrl = new URL('../assets/logoBeats.svg', import.meta.url).href;
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
  padding: 0.5rem 1.5rem;
  background-color: #348e91;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  width: 100%;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.logo a {
  display: flex;
  align-items: center;
  gap: 0.1rem;
  text-decoration: none;
  color: white;
}

.logo img {
  height: 50px;
  width: auto;
  margin-right: 0.5rem;
  filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.5));
  transition: transform 0.3s ease;
  transition: filter 0.3s ease;

}

.logo span {
  font-size: 1.8rem;
  font-weight: bold;
  line-height: 1;
}

.nav {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.nav button {
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 1rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
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
