<template>
  <div class="playlist-container">
    <!-- Header Component -->
    <HeaderComponent />
    
    <!-- Main Content -->
    <div class="main-content">
      <!-- Page Title -->
      <div class="page-header">
        <h1>🎵 Mis Playlists</h1>
        <p>Crea y gestiona tus listas de reproducción favoritas</p>
      </div>

      <!-- Create Playlist Form -->
      <div class="create-playlist-section">
        <h2>✨ Crear Nueva Playlist</h2>
        <form @submit.prevent="crearPlaylist" class="playlist-form">
          <div class="form-group">
            <label for="nombre">Nombre de la Playlist</label>
            <input
              id="nombre"
              v-model="nuevaPlaylist.name"
              type="text"
              class="form-input"
              placeholder="Ej: Mis favoritas"
              required
            />
          </div>

          <div class="form-group">
            <label for="descripcion">Descripción (opcional)</label>
            <textarea
              id="descripcion"
              v-model="nuevaPlaylist.description"
              class="form-textarea"
              placeholder="Describe tu playlist..."
              rows="3"
            ></textarea>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input
                v-model="nuevaPlaylist.is_public"
                type="checkbox"
                class="form-checkbox"
              />
              <span class="checkbox-text">Hacer playlist pública</span>
            </label>
          </div>

          <button type="submit" :disabled="loading" class="btn-primary">
            {{ loading ? '⏳ Creando...' : '🎵 Crear Playlist' }}
          </button>
        </form>
      </div>

      <!-- My Playlists -->
      <div class="playlists-section">
        <h2>📚 Mis Playlists</h2>
        
        <div v-if="playlistsLoading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Cargando playlists...</p>
        </div>

        <div v-else-if="playlists.length === 0" class="empty-state">
          <div class="empty-icon">🎵</div>
          <h3>No tienes playlists aún</h3>
          <p>Crea tu primera playlist para empezar a organizar tu música favorita</p>
        </div>

        <div v-else class="playlists-grid">
          <div
            v-for="playlist in playlists"
            :key="playlist.id"
            class="playlist-card"
            @click="irAPlaylistDetail(playlist.id)"
          >
            <div class="playlist-header">
              <h3>{{ playlist.name }}</h3>
              <div class="playlist-actions">
                <button
                  @click.stop="eliminarPlaylist(playlist.id)"
                  class="btn-danger-small"
                  title="Eliminar playlist"
                >
                  🗑️
                </button>
              </div>
            </div>
            
            <p class="playlist-description">
              {{ playlist.description || 'Sin descripción' }}
            </p>
            
            <div class="playlist-info">
              <span class="song-count">
                🎵 {{ playlist.playlist_canciones?.[0]?.count || 0 }} canciones
              </span>
              <span class="visibility-badge" :class="{ public: playlist.is_public }">
                {{ playlist.is_public ? '🌍 Pública' : '🔒 Privada' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import HeaderComponent from '../components/headerComponent.vue';
import { usePlaylist } from '../composables/usePlaylist';
import { supabase } from '../supabase';

// Router
const router = useRouter();

// Composables
const {
  playlists,
  loading,
  crearPlaylist: crearPlaylistComposable,
  obtenerPlaylists,
  eliminarPlaylist: eliminarPlaylistComposable
} = usePlaylist();

// Reactive data
const nuevaPlaylist = ref({
  name: '',
  description: '',
  is_public: false
});

const playlistsLoading = ref(false);

// Función para obtener el ID numérico del usuario actual
const obtenerUsuarioId = async (): Promise<number | null> => {
  try {
    // Obtener el usuario autenticado de Supabase Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Error obteniendo usuario de auth:', authError);
      return null;
    }

    // Buscar en la tabla usuarios usando el auth_id (UUID)
    const { data: usuario, error: userError } = await supabase
      .from('usuarios')
      .select('id, name, email, auth_id')
      .eq('auth_id', user.id)
      .single();

    if (userError || !usuario) {
      console.error('Error obteniendo usuario de la tabla:', userError);
      return null;
    }

    return usuario.id;
  } catch (error) {
    console.error('Error en obtenerUsuarioId:', error);
    return null;
  }
};

// Methods
const crearPlaylist = async () => {
  try {
    // Obtener el ID del usuario actual
    const userId = await obtenerUsuarioId();
    if (!userId) {
      console.error('Error: No se pudo identificar al usuario');
      return;
    }

    await crearPlaylistComposable(userId, nuevaPlaylist.value);
    nuevaPlaylist.value = {
      name: '',
      description: '',
      is_public: false
    };
    await obtenerPlaylists(userId);
  } catch (error) {
    console.error('Error creando playlist:', error);
  }
};

const eliminarPlaylist = async (id: number) => {
  if (confirm('¿Estás seguro de que quieres eliminar esta playlist?')) {
    try {
      // Obtener el ID del usuario actual
      const userId = await obtenerUsuarioId();
      if (!userId) {
        console.error('Error: No se pudo identificar al usuario');
        return;
      }

      await eliminarPlaylistComposable(id);
      await obtenerPlaylists(userId);
    } catch (error) {
      console.error('Error eliminando playlist:', error);
    }
  }
};

const irAPlaylistDetail = (playlistId: number) => {
  router.push(`/playlist/${playlistId}`);
};

// Lifecycle
onMounted(async () => {
  playlistsLoading.value = true;
  try {
    // Obtener el ID del usuario actual
    const userId = await obtenerUsuarioId();
    if (userId) {
      await obtenerPlaylists(userId);
    } else {
      console.error('No se pudo obtener el ID del usuario');
    }
  } catch (error) {
    console.error('Error cargando playlists:', error);
  } finally {
    playlistsLoading.value = false;
  }
});
</script>

<style scoped>
.playlist-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%);
}

.main-content {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-header h1 {
  color: #348e91;
  font-size: 2.5rem;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
}

.page-header p {
  color: #666;
  font-size: 1.1rem;
}

.create-playlist-section {
  background: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
  margin-bottom: 30px;
  border: 1px solid #ddd;
}

.create-playlist-section h2 {
  color: #348e91;
  margin-bottom: 20px;
  font-size: 1.5rem;
}

.playlist-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  color: #333;
  font-weight: 600;
  margin-bottom: 8px;
}

.form-input,
.form-textarea {
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #348e91;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.form-checkbox {
  width: 18px;
  height: 18px;
  accent-color: #348e91;
}

.checkbox-text {
  color: #333;
  font-weight: 500;
}

.btn-primary {
  background: linear-gradient(135deg, #348e91 0%, #4a90e2 100%);
  color: white;
  padding: 15px 25px;
  border: none;
  border-radius: 25px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(52, 142, 145, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(52, 142, 145, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.playlists-section {
  background: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
  border: 1px solid #ddd;
}

.playlists-section h2 {
  color: #348e91;
  margin-bottom: 20px;
  font-size: 1.5rem;
}

.loading-state {
  text-align: center;
  padding: 40px;
  color: #666;
}

.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #348e91;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #666;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.playlists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.playlist-card {
  background: #f8f9fa;
  border: 2px solid #ddd;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.playlist-card:hover {
  border-color: #348e91;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(52, 142, 145, 0.2);
}

.playlist-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.playlist-header h3 {
  color: #348e91;
  margin: 0;
  font-size: 1.2rem;
}

.playlist-actions {
  display: flex;
  gap: 5px;
}

.btn-danger-small {
  background: #ff4444;
  color: white;
  border: none;
  padding: 5px 8px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.3s ease;
}

.btn-danger-small:hover {
  background: #cc0000;
}

.playlist-description {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 15px;
  line-height: 1.4;
}

.playlist-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.song-count {
  color: #4a90e2;
  font-weight: 600;
  font-size: 0.9rem;
}

.visibility-badge {
  background: #e9ecef;
  color: #6c757d;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.visibility-badge.public {
  background: #d4edda;
  color: #155724;
}

@media (max-width: 768px) {
  .main-content {
    padding: 10px;
  }
  
  .create-playlist-section,
  .playlists-section {
    padding: 20px;
  }
  
  .playlists-grid {
    grid-template-columns: 1fr;
  }
}
</style>
