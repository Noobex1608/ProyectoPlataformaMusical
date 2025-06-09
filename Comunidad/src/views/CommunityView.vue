<template>
  <div class="community-view">
    <!-- Header mejorado -->
    <header class="community-header">
      <div class="header-content">
        <h1>Comunidad Musical</h1>
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

    <!-- Estados de carga -->
    <div v-if="loading" class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      Cargando datos...
    </div>

    <!-- Contenido principal -->
    <main v-else>
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

const toast = useToast();
const authStore = useAuthStore();
const communityStore = useCommunityStore();

// Estado
const loading = ref(true);

// Definición de pestañas
const tabs = [
  { id: 'radio', label: 'Radio', icon: 'fas fa-broadcast-tower' },
  { id: 'clubs', label: 'Clubes', icon: 'fas fa-users' },
  { id: 'polls', label: 'Encuestas', icon: 'fas fa-poll' },
  { id: 'notifications', label: 'Notificaciones', icon: 'fas fa-bell' }
];

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
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.community-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.header-content h1 {
  color: #1db954;
  margin: 0;
}

.navigation-tabs {
  display: flex;
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

@media (max-width: 768px) {
  .community-view {
    padding: 1rem;
  }

  .header-content {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .navigation-tabs {
    overflow-x: auto;
    white-space: nowrap;
    padding-bottom: 0.5rem;
  }

  .navigation-tabs button {
    padding: 0.5rem 1rem;
  }
}
</style>