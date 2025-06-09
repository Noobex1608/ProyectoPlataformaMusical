<template>
  <div class="events-view">
    <div class="events-header">
      <h2>Eventos</h2>
      <button @click="showCreateModal = true" class="create-button">
        <i class="fas fa-plus"></i> Nuevo Evento
      </button>
    </div>

    <div class="events-filters">
      <div class="filter-group">
        <label>Filtrar por:</label>
        <select v-model="filterType">
          <option value="all">Todos</option>
          <option value="upcoming">Próximos</option>
          <option value="past">Pasados</option>
          <option value="myEvents">Mis Eventos</option>
        </select>
      </div>
      <div class="search-group">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Buscar eventos..."
        >
      </div>
    </div>

    <div class="events-grid" v-if="filteredEvents.length">
      <div 
        v-for="event in filteredEvents" 
        :key="event.id"
        class="event-card"
        @click="navigateToEvent(event.id)"
      >
        <img 
          :src="event.cover_url || '/default-event.jpg'" 
          :alt="event.title"
          class="event-image"
        >
        <div class="event-info">
          <span class="event-date">
            <i class="fas fa-calendar"></i>
            {{ formatDate(event.date) }}
          </span>
          <h3>{{ event.title }}</h3>
          <p>{{ event.description }}</p>
          <div class="event-meta">
            <span class="location">
              <i class="fas fa-map-marker-alt"></i>
              {{ event.location }}
            </span>
            <span class="attendees">
              <i class="fas fa-users"></i>
              {{ event.attendees_count }} asistentes
            </span>
          </div>
          <div class="event-tags">
            <span 
              v-for="tag in event.tags" 
              :key="tag"
              class="tag"
            >
              {{ tag }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <p v-if="filterType === 'myEvents'">No has creado ningún evento aún</p>
      <p v-else-if="filterType === 'upcoming'">No hay eventos próximos</p>
      <p v-else-if="filterType === 'past'">No hay eventos pasados</p>
      <p v-else>No hay eventos disponibles</p>
      <button @click="showCreateModal = true">Crear Primer Evento</button>
    </div>

    <!-- Modal de Creación -->
    <Modal v-if="showCreateModal" @close="showCreateModal = false">
      <template #header>
        <h3>Crear Nuevo Evento</h3>
      </template>

      <template #default>
        <form @submit.prevent="createEvent" class="event-form">
          <div class="form-group">
            <label for="title">Título</label>
            <input 
              id="title"
              v-model="newEvent.title"
              type="text"
              required
              placeholder="Título del evento"
            >
          </div>

          <div class="form-group">
            <label for="description">Descripción</label>
            <textarea
              id="description"
              v-model="newEvent.description"
              rows="3"
              placeholder="Describe el evento..."
            ></textarea>
          </div>

          <div class="form-group">
            <label for="date">Fecha y Hora</label>
            <input 
              id="date"
              v-model="newEvent.date"
              type="datetime-local"
              required
            >
          </div>

          <div class="form-group">
            <label for="location">Ubicación</label>
            <input 
              id="location"
              v-model="newEvent.location"
              type="text"
              required
              placeholder="Ubicación del evento"
            >
          </div>

          <div class="form-group">
            <label for="capacity">Capacidad</label>
            <input 
              id="capacity"
              v-model="newEvent.capacity"
              type="number"
              min="1"
              placeholder="Número máximo de asistentes"
            >
          </div>

          <div class="form-group">
            <label for="tags">Etiquetas</label>
            <input 
              id="tags"
              v-model="tagInput"
              type="text"
              @keydown.enter.prevent="addTag"
              placeholder="Presiona Enter para añadir"
            >
            <div class="tags-preview">
              <span 
                v-for="tag in newEvent.tags" 
                :key="tag"
                class="tag"
              >
                {{ tag }}
                <button @click="removeTag(tag)" class="remove-tag">×</button>
              </span>
            </div>
          </div>

          <div class="form-group">
            <label for="cover">Imagen de Portada</label>
            <input 
              id="cover"
              type="file"
              accept="image/*"
              @change="(event) => handleCoverUpload(event as InputEvent)"
            >
          </div>
        </form>
      </template>

      <template #footer>
        <button @click="createEvent" class="primary" :disabled="isCreating">
          {{ isCreating ? 'Creando...' : 'Crear Evento' }}
        </button>
        <button @click="showCreateModal = false">Cancelar</button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCommunityStore } from '@/stores/community.store';
import { useAuthStore } from '@/stores/auth.store';
import type { CommunityEvent as Event } from '@/types/community.types';
import Modal from '@/components/shared/Modal.vue';

const router = useRouter();
const communityStore = useCommunityStore();
const authStore = useAuthStore();

// Estado
const events = ref<Event[]>([]);
const showCreateModal = ref(false);
const isCreating = ref(false);
const filterType = ref('all');
const searchQuery = ref('');
const tagInput = ref('');

const newEvent = ref({
  title: '',
  description: '',
  date: '',
  location: '',
  capacity: null as number | null,
  tags: [] as string[],
  cover_url: ''
});

// Computed
const filteredEvents = computed(() => {
  let filtered = [...events.value];
  
  // Filtrar por tipo
  if (filterType.value === 'upcoming') {
    filtered = filtered.filter(event => new Date(event.date) > new Date());
  } else if (filterType.value === 'past') {
    filtered = filtered.filter(event => new Date(event.date) <= new Date());
  } else if (filterType.value === 'myEvents') {
    filtered = filtered.filter(event => event.creator_id === authStore.user?.id);
  }

  // Filtrar por búsqueda
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(event => 
      event.title.toLowerCase().includes(query) ||
      event.description.toLowerCase().includes(query) ||
      event.location.toLowerCase().includes(query) ||
      event.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }

  return filtered;
});

// Métodos
const loadEvents = async () => {
  const fetchedEvents = await communityStore.fetchUpcomingEvents();
  events.value = Array.isArray(fetchedEvents) ? fetchedEvents : [];
};

const createEvent = async () => {
  if (!authStore.user) return;

  try {
    isCreating.value = true;
    const eventData = {
      ...newEvent.value,
      creator_id: authStore.user.id,
      created_at: new Date().toISOString(),
      attendees_count: 0
    };

    await communityStore.createEvent(eventData);
    events.value = await communityStore.fetchUpcomingEvents();
    
    showCreateModal.value = false;
    newEvent.value = {
      title: '',
      description: '',
      date: '',
      location: '',
      capacity: null,
      tags: [],
      cover_url: ''
    };
  } catch (error) {
    console.error('Error creating event:', error);
  } finally {
    isCreating.value = false;
  }
};

const handleCoverUpload = (event: InputEvent) => {
  const input = event.target as HTMLInputElement;
  const file = input?.files?.[0];
  if (file) {
    // Lógica para subir la imagen y obtener la URL
  }
};

const addTag = () => {
  const tag = tagInput.value.trim();
  if (tag && !newEvent.value.tags.includes(tag)) {
    newEvent.value.tags.push(tag);
  }
  tagInput.value = '';
};

const removeTag = (tag: string) => {
  newEvent.value.tags = newEvent.value.tags.filter(t => t !== tag);
};

const navigateToEvent = (eventId: string) => {
  router.push(`/events/${eventId}`);
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Inicialización
onMounted(loadEvents);
</script>

<style scoped>
.events-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.events-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.create-button {
  background: #1db954;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.events-filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.filter-group,
.search-group {
  flex: 1;
}

.filter-group select,
.search-group input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.event-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: transform 0.2s;
}

.event-card:hover {
  transform: translateY(-4px);
}

.event-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.event-info {
  padding: 1.5rem;
}

.event-date {
  display: inline-block;
  color: #1db954;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.event-info h3 {
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
}

.event-info p {
  color: #666;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-clamp: 3;
}

.event-meta {
  display: flex;
  justify-content: space-between;
  color: #666;
  margin-bottom: 1rem;
}

.event-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  background: #f0f0f0;
  color: #666;
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.875rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.event-form {
  padding: 1rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
}

.form-group input[type="text"],
.form-group input[type="datetime-local"],
.form-group input[type="number"],
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.tags-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.remove-tag {
  background: none;
  border: none;
  margin-left: 0.25rem;
  cursor: pointer;
  color: #666;
}

@media (max-width: 768px) {
  .events-view {
    padding: 1rem;
  }

  .events-filters {
    flex-direction: column;
  }

  .events-grid {
    grid-template-columns: 1fr;
  }
}
</style>