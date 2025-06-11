<template>
    <div class="playlist-view">
      <div class="playlist-header">
        <h2>Playlists Sociales</h2>
        <button @click="showCreateModal = true" class="create-button">
          <i class="fas fa-plus"></i> Nueva Playlist
        </button>
      </div>
  
      <div class="playlists-grid" v-if="playlists.length">
        <div 
          v-for="playlist in playlists" 
          :key="playlist.id"
          class="playlist-card"
          @click="selectPlaylist(playlist)"
        >
          <img 
            :src="playlist.cover_url || '/default-playlist.jpg'" 
            :alt="playlist.name"
          >
          <div class="playlist-info">
            <h3>{{ playlist.name }}</h3>
            <p>{{ playlist.description || 'Sin descripción' }}</p>
            <div class="playlist-meta">
              <span>
                <i class="fas fa-user"></i> {{ playlist.creator_id }}
              </span>
              <span v-if="playlist.is_collaborative">
                <i class="fas fa-users"></i> Colaborativa
              </span>
            </div>
          </div>
        </div>
      </div>
  
      <div v-else class="empty-state">
        <p>No hay playlists creadas</p>
        <button @click="showCreateModal = true">Crear Primera Playlist</button>
      </div>
  
      <!-- Modal de Creación -->
      <Modal v-if="showCreateModal" @close="showCreateModal = false">
        <template #header>
          <h3>Crear Nueva Playlist</h3>
        </template>
  
        <template #default>
          <form @submit.prevent="createPlaylist" class="playlist-form">
            <div class="form-group">
              <label for="name">Nombre</label>
              <input 
                id="name"
                v-model="newPlaylist.name"
                type="text"
                required
                placeholder="Nombre de la playlist"
              >
            </div>
  
            <div class="form-group">
              <label for="description">Descripción</label>
              <textarea
                id="description"
                v-model="newPlaylist.description"
                placeholder="Describe tu playlist..."
                rows="3"
              ></textarea>
            </div>
  
            <div class="form-group">
              <label class="checkbox-label">
                <input 
                  type="checkbox"
                  v-model="newPlaylist.is_collaborative"
                >
                Permitir colaboración
              </label>
            </div>
  
            <div class="form-group">
              <label class="checkbox-label">
                <input 
                  type="checkbox"
                  v-model="newPlaylist.is_public"
                >
                Playlist pública
              </label>
            </div>
  
            <div class="form-group">
              <label for="cover">Portada</label>
              <input 
                id="cover"
                type="file"
                accept="image/*"
                @change="handleCoverUpload"
              >
            </div>
          </form>
        </template>
  
        <template #footer>
          <button @click="createPlaylist" class="primary" :disabled="isCreating">
            {{ isCreating ? 'Creando...' : 'Crear Playlist' }}
          </button>
          <button @click="showCreateModal = false">Cancelar</button>
        </template>
      </Modal>
  
      <!-- Vista Detallada de Playlist -->
      <Modal v-if="selectedPlaylist" @close="selectedPlaylist = null" class="playlist-detail-modal">
        <template #header>
          <div class="playlist-detail-header">
            <img 
              :src="selectedPlaylist.cover_url || '/default-playlist.jpg'"
              :alt="selectedPlaylist.name"
            >
            <div>
              <h3>{{ selectedPlaylist.name }}</h3>
              <p>{{ selectedPlaylist.description }}</p>
            </div>
          </div>
        </template>
  
        <template #default>
          <div class="playlist-tracks">
            <div 
              v-for="(track, index) in playlistTracks" 
              :key="track.id"
              class="track-item"
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
              <button 
                v-if="canModifyPlaylist"
                @click="removeTrack(track.id)"
                class="remove-track"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>
  
            <div v-if="canModifyPlaylist" class="add-track-section">
              <button @click="showAddTrackModal = true">
                <i class="fas fa-plus"></i> Añadir Canción
              </button>
            </div>
          </div>
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
  import { useCommunityStore } from '@/stores/community.store';
  import { useAuthStore } from '@/stores/auth.store';
  import type { SocialPlaylist, PlaylistTrack } from '@/types/community.types';
  import type { Track } from '@/types/audio.types';
  import Modal from '@/components/shared/Modal.vue';
  
  const communityStore = useCommunityStore();
  const authStore = useAuthStore();
  
  // Estado
  const showCreateModal = ref(false);
  const isCreating = ref(false);
  const selectedPlaylist = ref<SocialPlaylist | null>(null);
  const playlistTracks = ref<Track[]>([]);
  const showAddTrackModal = ref(false);
  
  const newPlaylist = ref({
    name: '',
    description: '',
    is_collaborative: false,
    is_public: true,
    cover_url: ''
  });
  
  // Computed
  const playlists = computed(() => communityStore.playlists);
  const canModifyPlaylist = computed(() => {
    if (!selectedPlaylist.value || !authStore.user) return false;
    return (
      selectedPlaylist.value.creator_id === authStore.user.id ||
      selectedPlaylist.value.is_collaborative
    );
  });
  
  // Métodos
  const createPlaylist = async () => {
    if (!authStore.user) return;
  
    try {
      isCreating.value = true;
      await communityStore.createPlaylist({
        ...newPlaylist.value,
        creator_id: authStore.user.id,
        created_at: new Date().toISOString()
      });
      
      showCreateModal.value = false;
      newPlaylist.value = {
        name: '',
        description: '',
        is_collaborative: false,
        is_public: true,
        cover_url: ''
      };
    } catch (error) {
      console.error('Error creating playlist:', error);
    } finally {
      isCreating.value = false;
    }
  };
  
  const handleCoverUpload = (event: Event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      // Aquí iría la lógica para subir la imagen
      // y obtener la URL
    }
  };
  
  const selectPlaylist = async (playlist: SocialPlaylist) => {
    selectedPlaylist.value = playlist;
    // Aquí cargaríamos las canciones de la playlist
  };
  
  const removeTrack = async (trackId: string) => {
    if (!selectedPlaylist.value || !canModifyPlaylist.value) return;
    
    try {
      // Aquí iría la lógica para eliminar la canción
      playlistTracks.value = playlistTracks.value.filter(t => t.id !== trackId);
    } catch (error) {
      console.error('Error removing track:', error);
    }
  };
  
  // Inicialización
  onMounted(async () => {
    await communityStore.fetchPlaylists();
  });
  </script>
  
  <style>
  .playlist-view {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }
  
  .playlist-header {
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
  
  .playlists-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
  }
  
  .playlist-card {
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: transform 0.2s;
  }
  
  .playlist-card:hover {
    transform: translateY(-4px);
  }
  
  .playlist-card img {
    width: 100%;
    height: 160px;
    object-fit: cover;
  }
  
  .playlist-info {
    padding: 1rem;
  }
  
  .playlist-info h3 {
    margin: 0;
    font-size: 1.1rem;
  }
  
  .playlist-info p {
    margin: 0.5rem 0;
    color: #666;
    font-size: 0.9rem;
  }
  
  .playlist-meta {
    display: flex;
    gap: 1rem;
    font-size: 0.8rem;
    color: #888;
  }
  
  .playlist-form {
    padding: 1rem;
  }
  
  .form-group {
    margin-bottom: 1rem;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    color: #333;
  }
  
  .form-group input[type="text"],
  .form-group textarea {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .playlist-detail-modal {
    max-width: 800px;
  }
  
  .playlist-detail-header {
    display: flex;
    gap: 1.5rem;
    padding: 1rem;
  }
  
  .playlist-detail-header img {
    width: 160px;
    height: 160px;
    object-fit: cover;
    border-radius: 8px;
  }
  
  .track-item {
    display: flex;
    align-items: center;
    padding: 0.5rem;
    border-bottom: 1px solid #eee;
  }
  
  .track-number {
    width: 30px;
    text-align: right;
    margin-right: 1rem;
    color: #888;
  }
  
  .track-cover {
    width: 40px;
    height: 40px;
    border-radius: 4px;
    margin-right: 1rem;
  }
  
  .track-info {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  
  .track-info span {
    color: #666;
    font-size: 0.9rem;
  }
  
  .remove-track {
    background: none;
    border: none;
    color: #e74c3c;
    cursor: pointer;
    padding: 0.5rem;
  }
  
  .add-track-section {
    padding: 1rem;
    text-align: center;
  }
  
  @media (max-width: 768px) {
    .playlist-view {
      padding: 1rem;
    }
  
    .playlist-detail-header {
      flex-direction: column;
      text-align: center;
    }
  
    .playlist-detail-header img {
      width: 120px;
      height: 120px;
      margin: 0 auto;
    }
  }
  </style>