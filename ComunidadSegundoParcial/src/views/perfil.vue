<template>
  <headerComponent></headerComponent>
  <div class="profile-container">
    <h2>Perfil de usuario</h2>

    <div class="profile-details" v-if="usuario">
      <h3><strong>Nombre:</strong> {{ usuario.name || "No definido" }}</h3>
      <h3><strong>Correo:</strong> {{ usuario.email }}</h3>
      <p><strong>Descripción:</strong></p>
      <p>{{ usuario.description || "No definido" }}</p>
      <p><strong>Fecha de creación:</strong> {{ new Date(usuario.created_at).toLocaleDateString() }}</p>

    <button @click='cambiarDescripcion'>Cambiar descripcion</button>  
    <br>
    <button @click="logout">Cerrar sesión</button>
    </div>

    <div v-else>
      <p>No hay usuario autenticado.</p>
      <router-link to="/">Ir a iniciar sesión</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUsuarioStore } from "../store/usuario";
import { useRouter } from "vue-router";
import headerComponent from "../components/headerComponent.vue";
const usuarioStore = useUsuarioStore();
const router = useRouter();

const usuario = usuarioStore.usuario;

function cambiarDescripcion() {
  const nuevaDescripcion = prompt("Ingrese la nueva descripción:");
  if (nuevaDescripcion) {
    usuarioStore.updateUsuario({ description: nuevaDescripcion });
  }
}
function logout() {
  usuarioStore.clearUsuario();
  router.push("/");
}
</script>

<style scoped>
.profile-container {
  max-width: 600px;
  margin: 2rem auto;
  padding: 1rem 2rem;
  background-color: #f5f5f5;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}
button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
  background-color: #007acc;
  border: none;
  color: white;
  border-radius: 4px;
}
button:hover {
  background-color: #005fa3;
}
.profile-details h3 {
  margin: 0.5rem 0;
}
.profile-details p {
  margin: 0.5rem 0;
  color: #555;
}
.profile-details strong {
  color: #333;
}
h3 {
  color: #007acc;
}
h2 {
  text-align: center;
  color: #333;
}
p {
  font-size: 1.1rem;
  line-height: 1.5;
    color: #666;
}
</style>
