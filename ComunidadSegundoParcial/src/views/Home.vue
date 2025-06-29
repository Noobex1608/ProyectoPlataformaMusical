<template>
  <HeaderComponent />
  <main class="homeContainer">
    <div class="homeText">
      <h1>Bienvenido a la Comunidad Musical</h1>
      <p class="subtitle">Explora, comparte y disfruta de la música con nosotros.</p>
      <p class="text">Esta es una plataforma para artistas y amantes de la música.</p>
      <p class="text">¡Únete a nuestra comunidad y descubre nuevos talentos!</p>
    </div>

    <div class="homeImage">
      <img src="../assets/8e820c8108d7c3a6f57703176f25c23d.jpg" alt="Imagen de bienvenida" />
    </div>
  </main>
</template>


<script setup lang="ts">
import HeaderComponent from '../components/headerComponent.vue';
</script>

<style scoped>
.homeContainer {
  max-width: 900px;
  margin: 2rem auto;
  padding: 2rem 1.5rem;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #222;
  display: flex;               
  gap: 2rem;                  
  align-items: center;        
  text-align: left;           
}

.homeText {
  flex: 1;                   
}

.homeImage {
  flex: 1;                    
  display: flex;
  justify-content: center;
}

.homeImage img {
  width: 100%;
  max-width: 400px;
  height: auto;
  border-radius: 15px;
  box-shadow: 0 4px 10px rgba(52, 142, 145, 0.3);
  object-fit: cover;
}

/* Para pantallas pequeñas, apilar verticalmente */
@media (max-width: 768px) {
  .homeContainer {
    flex-direction: column;
    text-align: center;
  }
  
  .homeText {
    margin-bottom: 1.5rem;
  }
  
  .homeImage img {
    max-width: 100%;
    height: 15rem;
  }
}

</style>
