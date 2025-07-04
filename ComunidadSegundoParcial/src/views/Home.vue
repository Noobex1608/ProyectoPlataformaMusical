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
      <img :src="homeImageUrl" alt="Imagen de bienvenida" />
    </div>
  </main>
</template>


<script setup lang="ts">
import HeaderComponent from '../components/headerComponent.vue';

// Usar URL absoluta para desarrollo en microfrontend
const homeImageUrl = new URL('../assets/8e820c8108d7c3a6f57703176f25c23d.jpg', import.meta.url).href;



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


.navigation-buttons h3 {
  color: #333;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.button-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.nav-button {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  color: white;
  font-family: inherit;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.nav-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
}

.button-icon {
  font-size: 2rem;
  min-width: 60px;
  text-align: center;
}

.nav-button h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.nav-button p {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.9;
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
