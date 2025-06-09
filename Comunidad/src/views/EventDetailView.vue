<template>
  <div class="event-detail-view">
    <div v-if="event" class="event-header">
      <div class="event-info">
        <img 
          :src="event.cover_url || '/default-event.jpg'" 
          :alt="event.title"
          class="event-cover"
        >
        <div class="event-text">
          <span class="event-date">
            <i class="fas fa-calendar"></i>
            {{ formatDate(event.date) }}
          </span>
          <h1>{{ event.title }}</h1>
          <p class="description">{{ event.description }}</p>
          <div class="meta-info">
            <span class="location">
              <i class="fas fa-map-marker-alt"></i>
              {{ event.location }}
            </span>
            <span class="capacity">
              <i class="fas fa-users"></i>
              {{ event.attendees_count }}/{{ event.capacity || '∞' }} asistentes
            </span>
            <span class="creator">
              <i class="fas fa-user"></i>
              Organizado por {{ event.creator_id }}
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
      
      <div class="actions">
        <button 
          v-if="!isAttending"
          @click="attendEvent" 
          class="attend-btn"
          :disabled="isEventFull || isPast"
        >
          <i class="fas fa-check"></i>
          {{ isEventFull ? 'Evento Lleno' : 'Asistir al Evento' }}
        </button>
        <button 
          v-else
          @click="cancelAttendance" 
          class="cancel-btn"
        >
          <i class="fas fa-times"></i>
          Cancelar Asistencia
        </button>

        <button 
          v-if="canModifyEvent"
          @click="showEditModal = true" 
          class="edit-btn"
        >
          <i class="fas fa-edit"></i>
          Editar Evento
        </button>
      </div>
    </div>

    <div v-if="event" class="event-sections">
      <!-- Sección de Detalles -->
      <section class="details-section">
        <h2>Detalles del Evento</h2>
        <div class="details-content">
          <div class="detail-item">
            <i class="fas fa-clock"></i>
            <div>
              <h3>Horario</h3>
              <p>{{ formatTime(event.date) }}</p>
            </div>
          </div>
          <div class="detail-item">
            <i class="fas fa-map-marked-alt"></i>
            <div>
              <h3>Ubicación</h3>
              <p>{{ event.location }}</p>
              <a 
                :href="'https://maps.google.com/?q=' + encodeURIComponent(event.location)"
                target="_blank"
                class="maps-link"
              >
                Ver en Google Maps
              </a>
            </div>
          </div>
          <div class="detail-item">
            <i class="fas fa-info-circle"></i>
            <div>
              <h3>Información Adicional</h3>
              <p>{{ event.additional_info || 'No hay información adicional disponible.' }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Sección de Asistentes -->
      <section class="attendees-section">
        <h2>Asistentes ({{ event.attendees_count }})</h2>
        <div class="attendees-grid">
          <div 
            v-for="attendee in attendees" 
            :key="attendee.id"
            class="attendee-card"
          >
            <img 
              :src="attendee.avatar_url || '/default-avatar.jpg'"
              :alt="attendee.name"
            >
            <span>{{ attendee.name }}</span>
          </div>
        </div>
      </section>

      <!-- Sección de Comentarios -->
      <section class="comments-section">
        <h2>Comentarios</h2>
        <div class="comments-list">
          <div 
            v-for="comment in comments" 
            :key="comment.id"
            class="comment-item"
          >
            <img 
              :src="comment.user.avatar_url || '/default-avatar.jpg'"
              :alt="comment.user.name"
              class="comment-avatar"
            >
            <div class="comment-content">
              <div class="comment-header">
                <strong>{{ comment.user.name }}</strong>
                <span>{{ formatCommentDate(comment.created_at) }}</span>
              </div>
              <p>{{ comment.content }}</p>
            </div>
          </div>
        </div>

        <form @submit.prevent="addComment" class="comment-form">
          <textarea
            v-model="newComment"
            placeholder="Escribe un comentario..."
            rows="3"
          ></textarea>
          <button type="submit" :disabled="!newComment.trim()">
            Comentar
          </button>
        </form>
      </section>
    </div>

    <!-- Modal de Edición -->
    <Modal v-if="showEditModal" @close="showEditModal = false">
      <template #header>
        <h3>Editar Evento</h3>
      </template>

      <template #default>
        <form @submit.prevent="updateEvent" class="edit-form">
          <div class="form-group">
            <label for="edit-title">Título</label>
            <input 
              id="edit-title"
              v-model="editForm.title"
              type="text"
              required
            >
          </div>

          <div class="form-group">
            <label for="edit-description">Descripción</label>
            <textarea
              id="edit-description"
              v-model="editForm.description"
              rows="3"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="edit-date">Fecha y Hora</label>
            <input 
              id="edit-date"
              v-model="editForm.date"
              type="datetime-local"
              required
            >
          </div>

          <div class="form-group">
            <label for="edit-location">Ubicación</label>
            <input 
              id="edit-location"
              v-model="editForm.location"
              type="text"
              required
            >
          </div>

          <div class="form-group">
            <label for="edit-capacity">Capacidad</label>
            <input 
              id="edit-capacity"
              v-model="editForm.capacity"
              type="number"
              min="1"
            >
          </div>

          <div class="form-group">
            <label for="edit-tags">Etiquetas</label>
            <input 
              id="edit-tags"
              v-model="tagInput"
              type="text"
              @keydown.enter.prevent="addTag"
              placeholder="Presiona Enter para añadir"
            >
            <div class="tags-preview">
              <span 
                v-for="tag in editForm.tags" 
                :key="tag"
                class="tag"
              >
                {{ tag }}
                <button @click="removeTag(tag)" class="remove-tag">×</button>
              </span>
            </div>
          </div>

          <div class="form-group">
            <label for="edit-cover">Nueva Imagen de Portada</label>
            <input 
              id="edit-cover"
              type="file"
              accept="image/*"
              @change="handleCoverUpload"
            >
          </div>
        </form>
      </template>

      <template #footer>
        <button @click="updateEvent" class="primary" :disabled="isUpdating">
          {{ isUpdating ? 'Guardando...' : 'Guardar Cambios' }}
        </button>
        <button @click="showEditModal = false">Cancelar</button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCommunityStore } from '@/stores/community.store';
import { useAuthStore } from '@/stores/auth.store';
import type { CommunityEvent, User, Comment } from '@/types/community.types';
import Modal from '@/components/shared/Modal.vue';

const route = useRoute();
const router = useRouter();
const communityStore = useCommunityStore();
const authStore = useAuthStore();

// Estado
const event = ref<CommunityEvent | null>(null);
const attendees = ref<User[]>([]);
const comments = ref<Comment[]>([]);
const showEditModal = ref(false);
const isUpdating = ref(false);
const tagInput = ref('');
const newComment = ref('');

const editForm = ref({
  title: '',
  description: '',
  date: '',
  location: '',
  capacity: null as number | null,
  tags: [] as string[],
  cover_url: ''
});

// Computed
const canModifyEvent = computed(() => {
  if (!event.value || !authStore.user) return false;
  return event.value.creator_id === authStore.user.id;
});

const isAttending = computed(() => {
  if (!event.value || !authStore.user) return false;
  return attendees.value.some(a => a.id === authStore.user?.id);
});

const isEventFull = computed(() => {
  if (!event.value) return false;
  return event.value.capacity ? event.value.attendees_count >= event.value.capacity : false;
});

const isPast = computed(() => {
  if (!event.value) return false;
  return new Date(event.value.date) <= new Date();
});

// Métodos
const loadEvent = async () => {
  const eventId = route.params.id as string;
  event.value = await communityStore.fetchEventById(eventId);
  
  if (event.value) {
    attendees.value = await communityStore.fetchEventAttendees(eventId);
    comments.value = await communityStore.fetchEventComments(eventId);
    
    // Inicializar formulario de edición
    editForm.value = {
      title: event.value.title,
      description: event.value.description,
      date: event.value.date,
      location: event.value.location,
      capacity: event.value.capacity,
      tags: [...event.value.tags],
      cover_url: event.value.cover_url || ''
    };
  }
};

const attendEvent = async () => {
  if (!event.value || !authStore.user) return;
  
  try {
    await communityStore.attendEvent(event.value.id);
    attendees.value.push({
      id: authStore.user.id,
      name: authStore.user.user_metadata?.name || 'Usuario',
      avatar_url: authStore.user.user_metadata?.avatar_url
    });
    if (event.value) event.value.attendees_count++;
  } catch (error) {
    console.error('Error attending event:', error);
  }
};

const cancelAttendance = async () => {
  if (!event.value || !authStore.user) return;
  
  try {
    await communityStore.cancelEventAttendance(event.value.id);
    attendees.value = attendees.value.filter(a => a.id !== authStore.user?.id);
    if (event.value) event.value.attendees_count--;
  } catch (error) {
    console.error('Error canceling attendance:', error);
  }
};

const updateEvent = async () => {
  if (!event.value) return;

  try {
    isUpdating.value = true;
    await communityStore.updateEvent(event.value.id, editForm.value);
    event.value = { ...event.value, ...editForm.value };
    showEditModal.value = false;
  } catch (error) {
    console.error('Error updating event:', error);
  } finally {
    isUpdating.value = false;
  }
};

const handleCoverUpload = (e: Event) => {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (file) {
    // Aquí iría la lógica para subir la imagen
    // y obtener la URL
  }
};

const addTag = () => {
  const tag = tagInput.value.trim();
  if (tag && !editForm.value.tags.includes(tag)) {
    editForm.value.tags.push(tag);
  }
  tagInput.value = '';
};

const removeTag = (tag: string) => {
  editForm.value.tags = editForm.value.tags.filter(t => t !== tag);
};

const addComment = async () => {
  if (!event.value || !authStore.user || !newComment.value.trim()) return;

  try {
    const comment = await communityStore.addEventComment(event.value.id, newComment.value);
    comments.value.unshift(comment);
    newComment.value = '';
  } catch (error) {
    console.error('Error adding comment:', error);
  }
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatTime = (date: string) => {
  return new Date(date).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatCommentDate = (date: string) => {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Inicialización
onMounted(loadEvent);
</script>

<style scoped>
.event-detail-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.event-header {
  background: linear-gradient(to bottom, rgba(29, 185, 84, 0.1), transparent);
  padding: 2rem;
  border-radius: 16px;
  margin-bottom: 2rem;
}

.event-info {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
}

.event-cover {
  width: 300px;
  height: 300px;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.event-text {
  flex: 1;
}

.event-date {
  display: inline-block;
  color: #1db954;
  font-weight: 500;
  margin-bottom: 1rem;
}

.event-text h1 {
  font-size: 2.5rem;
  font-weight: bold;
  margin: 0 0 1rem;
}

.description {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 1.5rem;
  white-space: pre-line;
}

.meta-info {
  display: flex;
  gap: 2rem;
  color: #666;
  margin-bottom: 1.5rem;
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

.actions {
  display: flex;
  gap: 1rem;
}

.attend-btn,
.cancel-btn,
.edit-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 20px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.attend-btn {
  background: #1db954;
  color: white;
}

.attend-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.cancel-btn {
  background: #e74c3c;
  color: white;
}

.edit-btn {
  background: #ffffff;
  color: #333;
  border: 1px solid #ddd;
}

.event-sections {
  display: grid;
  gap: 2rem;
}

.details-section,
.attendees-section,
.comments-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.details-content {
  display: grid;
  gap: 1.5rem;
}

.detail-item {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.detail-item i {
  color: #1db954;
  font-size: 1.5rem;
}

.maps-link {
  color: #1db954;
  text-decoration: none;
  display: inline-block;
  margin-top: 0.5rem;
}

.attendees-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.attendee-card {
  text-align: center;
}

.attendee-card img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  margin-bottom: 0.5rem;
}

.comments-list {
  margin: 1rem 0;
}

.comment-item {
  display: flex;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid #eee;
}

.comment-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.comment-form {
  margin-top: 2rem;
}

.comment-form textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 1rem;
  resize: vertical;
}

.comment-form button {
  background: #1db954;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 20px;
  cursor: pointer;
}

.comment-form button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.edit-form {
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
  .event-detail-view {
    padding: 1rem;
  }

  .event-header {
    padding: 1rem;
  }

  .event-info {
    flex-direction: column;
    gap: 1rem;
  }

  .event-cover {
    width: 100%;
    height: 200px;
  }

  .event-text h1 {
    font-size: 2rem;
  }

  .meta-info {
    flex-direction: column;
    gap: 1rem;
  }

  .actions {
    flex-direction: column;
  }

  .attend-btn,
  .cancel-btn,
  .edit-btn {
    width: 100%;
    justify-content: center;
  }
}
</style> 