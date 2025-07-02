<script setup lang="ts">
import {RouterView} from 'vue-router';
import { onMounted } from 'vue';

onMounted(() => {
  console.log('🎵 ComunidadSegundoParcial App montado');
});
</script>

<template>
  <div id="comunidad-app">
    <RouterView />
  </div>
</template>

<style scoped>
#comunidad-app {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  background: #f8f9fa;
  overflow: auto;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1;
}
</style>
