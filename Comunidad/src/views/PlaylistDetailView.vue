<template>
  <div class="playlist-detail-view">
    <div v-if="playlist" class="playlist-header">
      <div class="playlist-info">
        <img 
          :src="playlist.cover_url || '/default-playlist.jpg'" 
          :alt="playlist.name"
          class="playlist-cover"
        >
        <div class="playlist-text">
          <h1>{{ playlist.name }}</h1>
          <p class="description">{{ playlist.description }}</p>
          <div class="meta-info">
            <span class="creator">
              <i class="fas fa-user"></i> {{ creatorProfile?.username || playlist.creator_id }}
            </span>
            <span v-if="playlist.is_collaborative" class="collaborative">
              <i class="fas fa-users"></i> Colaborativa
            </span>
            <span class="track-count">
              <i class="fas fa-music"></i> {{ tracks.length }} canciones
            </span>
          </div>
        </div>
      </div>
      
      <div class="actions" v-if="canModifyPlaylist">
        <button @click="showAddTrackModal = true" class="add-track-btn">
          <i class="fas fa-plus"></i> Añadir Canciones
        </button>
        <button @click="showEditModal = true" class="edit-btn">
          <i class="fas fa-edit"></i> Editar Playlist
        </button>
      </div>
    </div>

    <div v-if="tracks.length" class="tracks-list">
      <div 
        v-for="(track, index) in tracks" 
        :key="track.id"
        class="track-item"
        :class="{ 'playing': currentTrack?.id === track.id }"
      >
        <span class="track-number">{{ index + 1 }}</span>
        <img 
          :src="track.coverUrl || '/default-track.jpg'"
          :alt="track.title"
          class="track-cover"
        >
        <div class="track-info">
          <strong>{{ track.title }}</strong>
          <span>{{ track.artist }}</span>
        </div>
        <div class="track-duration">{{ formatDuration(track.duration) }}</div>
        <div class="track-actions">
          <button 
            @click="playTrack(track)"
            class="play-btn"
          >
            <i class="fas" :class="currentTrack?.id === track.id ? 'fa-pause' : 'fa-play'"></i>
          </button>
          <button 
            v-if="canModifyPlaylist"
            @click="removeTrack(track.id)"
            class="remove-btn"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <p>Esta playlist está vacía</p>
      <button v-if="canModifyPlaylist" @click="showAddTrackModal = true">
        Añadir Primera Canción
      </button>
    </div>

    <!-- Modal para añadir canciones -->
    <Modal v-if="showAddTrackModal" @close="showAddTrackModal = false">
      <template #header>
        <h3>Añadir Canciones</h3>
      </template>

      <template #default>
        <div class="search-section">
          <input 
            v-model="searchQuery"
            type="text"
            placeholder="Buscar canciones..."
            @input="searchTracks"
          >
          <div class="search-results" v-if="searchResults.length">
            <div 
              v-for="track in searchResults"
              :key="track.id"
              class="search-track-item"
              @click="addTrack(track)"
            >
              <img :src="track.coverUrl" :alt="track.title">
              <div>
                <strong>{{ track.title }}</strong>
                <span>{{ track.artist }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </Modal>

    <!-- Modal para editar playlist -->
    <Modal v-if="showEditModal" @close="showEditModal = false">
      <template #header>
        <h3>Editar Playlist</h3>
      </template>

      <template #default>
        <form @submit.prevent="updatePlaylist" class="edit-form">
          <div class="form-group">
            <label for="edit-name">Nombre</label>
            <input 
              id="edit-name"
              v-model="editForm.name"
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
            <label class="checkbox-label">
              <input 
                type="checkbox"
                v-model="editForm.is_collaborative"
              >
              Permitir colaboración
            </label>
          </div>

          <div class="form-group">
            <label for="edit-cover">Nueva Portada</label>
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
        <button @click="updatePlaylist" class="primary" :disabled="isUpdating">
          {{ isUpdating ? 'Guardando...' : 'Guardar Cambios' }}
        </button>
        <button @click="showEditModal = false">Cancelar</button>
      </template>
    </Modal>

    <div class="footer-actions">
      <!-- Botón externo para navegar a CommunityView -->
      <button @click="$router.push({ name: 'Community' })" class="external-nav-button">
        Ir a Comunidad
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useCommunityStore } from '@/stores/community.store';
import { useAuthStore } from '@/stores/auth.store';
import { supabase } from '@/lib/supabase';
import type { SocialPlaylist, UserProfile } from '@/types/community.types';
import type { Track } from '@/types/audio.types';
import Modal from '@/components/shared/Modal.vue';

const route = useRoute();
const communityStore = useCommunityStore();
const authStore = useAuthStore();

const playlist = ref<SocialPlaylist | null>(null);
const tracks = ref<Track[]>([]);
const currentTrack = ref<Track | null>(null);
const showAddTrackModal = ref(false);
const showEditModal = ref(false);
const searchQuery = ref('');
const searchResults = ref<Track[]>([]);
const isUpdating = ref(false);
const creatorProfile = ref<UserProfile | null>(null);

const editForm = ref({
  name: '',
  description: '',
  is_collaborative: false,
  cover_url: ''
});

const canModifyPlaylist = computed(() => {
  if (!playlist.value || !authStore.user) return false;
  return (
    playlist.value.creator_id === authStore.user.id ||
    playlist.value.is_collaborative
  );
});

const loadPlaylist = async () => {
  const playlistId = route.params.id as string;
  playlist.value = communityStore.getPlaylistById(playlistId) ?? null;
  if (!playlist.value) return;
  tracks.value = [];
  editForm.value = {
    name: playlist.value.name,
    description: playlist.value.description || '',
    is_collaborative: playlist.value.is_collaborative,
    cover_url: playlist.value.cover_url || ''
  };
  creatorProfile.value = await getUserProfile(playlist.value.creator_id);
};

async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error) return null;
    return data as UserProfile;
  } catch {
    return null;
  }
}

const searchTracks = async () => {
  // Simulación: no implementado
  searchResults.value = [];
};

const addTrack = async (track: Track) => {
  // Simulación: solo agrega localmente
  tracks.value.push(track);
  searchResults.value = searchResults.value.filter(t => t.id !== track.id);
};

const removeTrack = async (trackId: string) => {
  if (!playlist.value || !canModifyPlaylist.value) return;
  tracks.value = tracks.value.filter(t => t.id !== trackId);
};

const updatePlaylist = async () => {
  if (!playlist.value) return;
  try {
    isUpdating.value = true;
    // Simulación: solo actualiza localmente
    playlist.value = { ...playlist.value, ...editForm.value };
    showEditModal.value = false;
  } catch (error) {
    console.error('Error updating playlist:', error);
  } finally {
    isUpdating.value = false;
  }
};

const handleCoverUpload = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    // Aquí iría la lógica para subir la imagen
  }
};

const playTrack = (track: Track) => {
  if (currentTrack.value?.id === track.id) {
    currentTrack.value = null;
  } else {
    currentTrack.value = track;
  }
};

const formatDuration = (duration: number): string => {
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

onMounted(loadPlaylist);
</script>

<style>
.playlist-detail-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.playlist-header {
  background: linear-gradient(to bottom, rgba(29, 185, 84, 0.1), transparent);
  padding: 2rem;
  border-radius: 16px;
  margin-bottom: 2rem;
}

.playlist-info {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
}

.playlist-cover {
  width: 240px;
  height: 240px;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.playlist-text h1 {
  font-size: 2.5rem;
  font-weight: bold;
  margin: 0 0 1rem;
}

.description {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 1rem;
}

.meta-info {
  display: flex;
  gap: 1.5rem;
  color: #666;
}

.actions {
  display: flex;
  gap: 1rem;
}

.add-track-btn,
.edit-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 20px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.add-track-btn {
  background: #1db954;
  color: white;
}

.edit-btn {
  background: #ffffff;
  color: #333;
  border: 1px solid #ddd;
}

.tracks-list {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.track-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #eee;
}

.track-item:hover {
  background: #f8f8f8;
}

.track-item.playing {
  background: rgba(29, 185, 84, 0.1);
}

.track-number {
  width: 40px;
  text-align: right;
  color: #888;
}

.track-cover {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  margin: 0 1rem;
}

.track-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.track-info strong {
  color: #333;
}

.track-info span {
  color: #666;
  font-size: 0.9rem;
}

.track-duration {
  color: #888;
  margin: 0 1rem;
}

.track-actions {
  display: flex;
  gap: 0.5rem;
}

.play-btn,
.remove-btn {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
}

.play-btn {
  color: #1db954;
}

.remove-btn {
  color: #e74c3c;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.search-section {
  padding: 1rem;
}

.search-section input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.search-results {
  max-height: 400px;
  overflow-y: auto;
}

.search-track-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  cursor: pointer;
  border-radius: 8px;
}

.search-track-item:hover {
  background: #f8f8f8;
}

.search-track-item img {
  width: 48px;
  height: 48px;
  border-radius: 4px;
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
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.header-actions {
  margin-top: 1rem;
  text-align: right;
}

.external-nav-button {
  padding: 0.75rem 1.5rem;
  border-radius: 20px;
  border: none;
  cursor: pointer;
  background: #007bff;
  color: white;
  font-weight: bold;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.external-nav-button:hover {
  background: #0056b3;
}

@media (max-width: 768px) {
  .playlist-detail-view {
    padding: 1rem;
  }

  .playlist-header {
    padding: 1rem;
  }

  .playlist-info {
    flex-direction: column;
    gap: 1rem;
  }

  .playlist-cover {
    width: 200px;
    height: 200px;
    margin: 0 auto;
  }

  .playlist-text {
    text-align: center;
  }

  .playlist-text h1 {
    font-size: 2rem;
  }

  .meta-info {
    justify-content: center;
  }

  .actions {
    justify-content: center;
  }
}
</style>