<template>
  <HeaderComponent />
  <main class="homeContainer">
    <div class="homeText">
      <h1>Bienvenido a la Comunidad Musical</h1>
      <p class="subtitle">Explora, comparte y disfruta de la música con nosotros.</p>
      <p class="text">Esta es una plataforma para artistas y amantes de la música.</p>
      <p class="text">¡Únete a nuestra comunidad y descubre nuevos talentos!</p>
      
      <!-- Botones de navegación a otros microfrontends -->
      <div class="navigation-buttons">
        <h3>¿Qué tipo de usuario eres?</h3>
        <div class="button-grid">
          <button @click="navigateToArtista" class="nav-button artista-btn">
            <div class="button-icon">🎤</div>
            <div>
              <h4>Soy Artista</h4>
              <p>Comparte tu música y conecta con fans</p>
            </div>
          </button>
          
          <button @click="navigateToArtistaV2" class="nav-button artista-v2-btn">
            <div class="button-icon">🎸</div>
            <div>
              <h4>Artista Pro</h4>
              <p>Versión avanzada para artistas profesionales</p>
            </div>
          </button>
          
          <button @click="navigateToMonetizacion" class="nav-button monetizacion-btn">
            <div class="button-icon">💰</div>
            <div>
              <h4>Monetización</h4>
              <p>Gana dinero con tu música</p>
            </div>
          </button>
          
          <button @click="navigateToComunidad" class="nav-button comunidad-btn">
            <div class="button-icon">👥</div>
            <div>
              <h4>Comunidad</h4>
              <p>Versión clásica de la comunidad</p>
            </div>
          </button>
        </div>
      </div>
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

// Funciones de navegación que usan las funciones globales expuestas por Single SPA
const navigateToArtista = () => {
  console.log('🎤 Navegando a Artista...');
  if (typeof window.navigateToArtista === 'function') {
    window.navigateToArtista();
  } else {
    console.error('navigateToArtista no está disponible');
  }
};

const navigateToArtistaV2 = () => {
  console.log('🎸 Navegando a Artista V2...');
  if (typeof window.navigateToArtistaV2 === 'function') {
    window.navigateToArtistaV2();
  } else {
    console.error('navigateToArtistaV2 no está disponible');
  }
};

const navigateToMonetizacion = () => {
  console.log('💰 Navegando a Monetización...');
  if (typeof window.navigateToMonetizacion === 'function') {
    window.navigateToMonetizacion();
  } else {
    console.error('navigateToMonetizacion no está disponible');
  }
};

const navigateToComunidad = () => {
  console.log('👥 Navegando a Comunidad...');
  if (typeof window.navigateToComunidad === 'function') {
    window.navigateToComunidad();
  } else {
    console.error('navigateToComunidad no está disponible');
  }
};

// Declarar tipos para las funciones globales
declare global {
  interface Window {
    navigateToArtista: () => void;
    navigateToArtistaV2: () => void;
    navigateToMonetizacion: () => void;
    navigateToComunidad: () => void;
    navigateToHome: () => void;
    navigateToSPA: (path: string) => void;
  }
}
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

/* Estilos para los botones de navegación */
.navigation-buttons {
  margin-top: 2rem;
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

/* Colores específicos para cada botón */
.artista-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.artista-v2-btn {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.monetizacion-btn {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.comunidad-btn {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
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
