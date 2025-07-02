<script setup lang="ts">
import {RouterView} from 'vue-router';
import { onMounted } from 'vue';

onMounted(() => {
  console.log('🎵 ComunidadSegundoParcial App montado');
});
</script>

<template>
  <div id="comunidad-app">
    <h1 style="color: #6c5ce7; text-align: center; padding: 2rem;">
      🎵 Comunidad Musical V2
    </h1>
    <RouterView />
  </div>
</template>

<style scoped>
#comunidad-app {
  min-height: 100vh;
  background: #f8f9fa;
}
</style>
