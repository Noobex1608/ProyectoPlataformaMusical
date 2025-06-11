<template>
  <div class="community-view">
    <!-- Header siempre visible -->
    <header class="community-header">
      <div class="header-content">
        <h1 id="tituloPrincipalComunidadMusical">Comunidad Musical</h1>
        <div class="header-actions">
          <NotificationBell />
        </div>
      </div>
      <nav class="navigation-tabs">
        <router-link 
          v-for="tab in tabs" 
          :key="tab.id"
          :to="{ name: tab.id }"
          custom
          v-slot="{ isActive, navigate }"
        >
          <button 
            @click="navigate"
            :class="{ active: isActive }"
          >
            <i :class="tab.icon"></i>
            {{ tab.label }}
          </button>
        </router-link>
      </nav>
    </header>

    <!-- Contenido principal -->
    <main>
      <router-view v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useToast } from 'vue-toastification';
import NotificationBell from '../components/shared/NotificationBell.vue';
import { useAuthStore } from '@/stores/auth.store';
import { useCommunityStore } from '@/stores/community.store';
import { useRouter } from 'vue-router';

const toast = useToast();
const authStore = useAuthStore();
const communityStore = useCommunityStore();
const router = useRouter();

// Estado
const loading = ref(true);

// Definición de pestañas
const tabs = [
  { id: 'radio', label: 'Radio', icon: 'fas fa-broadcast-tower' },
  { id: 'clubs', label: 'Clubes', icon: 'fas fa-users' },
  { id: 'polls', label: 'Encuestas', icon: 'fas fa-poll' },
  { id: 'notifications', label: 'Notificaciones', icon: 'fas fa-bell' }
];

// // Navegación
// const navigateTo = (routeName: string) => {
//   router.push({ name: routeName });
// };

// Inicialización
onMounted(async () => {
  try {
    await authStore.init();
    await Promise.all([
      communityStore.fetchFanClubs(),
      communityStore.fetchActivePolls(),
      communityStore.fetchNotifications()
    ]);
    toast.success('Datos cargados correctamente');
  } catch (error) {
    toast.error('Error al cargar datos de la comunidad');
    console.error('Error loading data:', error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.community-view {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.community-header {
  flex-shrink: 0;
}

.header-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 1.5rem;
}

.header-content h1 {
  color: #1db954;
  margin: 0;
}

.navigation-tabs {
  display: flex;
  justify-content: center;
  gap: 1rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 1rem;
}

.navigation-tabs button {
  background: none;
  border: none;
  padding: 0.75rem 1.5rem;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.navigation-tabs button i {
  font-size: 1.1rem;
}

.navigation-tabs button.active {
  color: #1db954;
  border-bottom: 2px solid #1db954;
}

.loading-state {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.loading-state i {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #1db954;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

nav ul {
  display: flex;
  justify-content: center;
  gap: 1rem;
  list-style: none;
  padding: 0;
}

nav ul li {
  cursor: pointer;
  color: #1db954;
  font-weight: bold;
  transition: color 0.3s;
}

nav ul li:hover {
  color: #14833b;
}


@media (max-width: 768px) {
  .community-view {
    padding: 0; 
  }

  .header-content {
    margin-left: auto; /* Centrado completo */
    margin-right: auto;
  }

  .navigation-tabs {
    overflow-x: visible; /* Ajuste para evitar scroll horizontal */
    white-space: normal;
    padding-bottom: 1rem; /* Mantener consistencia */
  }

  .navigation-tabs button {
    padding: 0.75rem 1.5rem; /* Restaurar tamaño original */
  }
}

#tituloPrincipalComunidadMusical {
  font-size: 2rem;
  color: #1db954;
  margin: 0;
  
  font-weight: bold;
}
</style>