<template>
  <div class="home-view">
    <h1>Bienvenido a la Plataforma Musical</h1>
    <p>Por favor, inicia sesión para continuar.</p>
    <router-link to="/login" class="primary">Iniciar Sesión</router-link>
  </div>
</template>

<script setup lang="ts">

</script>

<style scoped>
.home-view {
  width: 75%; /* Ajustar para abarcar el 75% de la pantalla */
  max-width: 1200px; /* Aumentar el ancho máximo */
  margin: 0 auto;
  text-align: center;
  padding: 2rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.home-view h1 {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.home-view p {
  margin-bottom: 2rem;
  font-size: 1.2rem;
}

.primary {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background-color: #1db954;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: bold;
}

.primary:hover {
  background-color: #17a74a;
}
</style>
