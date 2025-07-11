<template>
  <headerComponent />
  <div class="radio-container">
    <!-- Header -->
    <div class="radio-header">
      <h1 class="radio-title">📻 Radio Musical</h1>
      <p class="radio-subtitle">Música aleatoria las 24 horas</p>
    </div>

    <div class="radio-content">
      <!-- Player Principal -->
      <div class="radio-player" v-if="cancionActual">
        <!-- Imagen de la canción -->
        <div class="song-image-container">
          <img 
            :src="cancionActual.imagen_url || '/default-song.jpg'" 
            :alt="cancionActual.title"
            class="song-image"
            :class="{ 'playing': isPlaying }"
            @error="handleImageError"
          />
          <div class="playing-animation" v-if="isPlaying">
            <div class="wave"></div>
            <div class="wave"></div>
            <div class="wave"></div>
          </div>
        </div>

        <!-- Información de la canción -->
        <div class="song-info">
          <h2 class="song-title">{{ cancionActual.title }}</h2>
          <p class="song-artist">{{ cancionActual.artist }}</p>
          <p class="song-album" v-if="cancionActual.album">{{ cancionActual.album }}</p>
          <span class="song-genre" v-if="cancionActual.genre">{{ cancionActual.genre }}</span>
        </div>

        <!-- Barra de progreso -->
        <div class="progress-container">
          <span class="time-current">{{ formatearTiempo(tiempoActual) }}</span>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progreso + '%' }"></div>
          </div>
          <span class="time-total">{{ formatearTiempo(duracionTotal) }}</span>
        </div>

        <!-- Controles -->
        <div class="controls">
          <button 
            @click="togglePlay" 
            class="control-btn play-btn"
            :disabled="loading"
          >
            {{ isPlaying ? '⏸️' : '▶️' }}
          </button>
          
          <button 
            @click="saltarCancion" 
            class="control-btn skip-btn"
            :disabled="loading"
          >
            ⏭️
          </button>
        </div>

        <!-- Acciones de la canción -->
        <div class="song-actions">
          <button 
            @click="toggleLike"
            class="action-btn like-btn"
            :class="{ 'liked': cancionLiked }"
            :disabled="loadingLike"
            title="Me gusta"
          >
            <span class="action-icon">{{ cancionLiked ? '❤️' : '🤍' }}</span>
            <span class="action-text">{{ cancionLiked ? 'Te gusta' : 'Me gusta' }}</span>
          </button>
          
          <button 
            @click="mostrarPlaylists"
            class="action-btn playlist-btn"
            title="Agregar a playlist"
          >
            <span class="action-icon">📝</span>
            <span class="action-text">Agregar a playlist</span>
          </button>
        </div>

        <!-- Control de volumen -->
        <div class="volume-control">
          <span class="volume-icon">🔊</span>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.1" 
            v-model="volumen"
            class="volume-slider"
          />
          <span class="volume-percentage">{{ Math.round(volumen * 100) }}%</span>
        </div>
      </div>

      <!-- Estado de carga -->
      <div class="loading-state" v-else-if="loading">
        <div class="loading-spinner"></div>
        <p>Cargando música...</p>
      </div>

      <!-- Botón inicial -->
      <div class="initial-state" v-else>
        <div v-if="cancionesDisponibles.length > 0">
          <h2>🎵 Radio Musical Lista</h2>
          <p class="ready-message">{{ cancionesDisponibles.length }} canciones disponibles</p>
          <button @click="iniciarRadio" class="start-radio-btn">
            🎵 Iniciar Radio
          </button>
        </div>
        <div v-else>
          <h2>📻 Preparando Radio...</h2>
          <p>Cargando música...</p>
        </div>
      </div>

      <!-- Información Lateral -->
      <div class="radio-sidebar">
        <!-- Siguiente canción -->
        <div class="next-song" v-if="siguienteCancion">
          <h3>🎵 Próxima canción:</h3>
          <div class="next-song-info">
            <img 
              :src="siguienteCancion.imagen_url || '/default-song.jpg'" 
              :alt="siguienteCancion.title"
              class="next-song-image"
              @error="handleImageError"
            />
            <div>
              <p class="next-song-title">{{ siguienteCancion.title }}</p>
              <p class="next-song-artist">{{ siguienteCancion.artist }}</p>
            </div>
          </div>
        </div>

        <!-- Estadísticas -->
        <div class="radio-stats">
          <h3>📊 Estadísticas</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-number">{{ cancionesDisponibles.length }}</span>
              <span class="stat-label">Canciones disponibles</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">{{ historialCanciones.length }}</span>
              <span class="stat-label">Reproducidas</span>
            </div>
          </div>
        </div>

        <!-- Historial reciente -->
        <div class="recent-history" v-if="historialCanciones.length > 0">
          <h3>🕒 Reproducidas recientemente:</h3>
          <div class="history-list">
            <div 
              v-for="cancion in historialCanciones.slice(-5).reverse()" 
              :key="cancion.id"
              class="history-item"
            >
              <img 
                :src="cancion.imagen_url || '/default-song.jpg'" 
                :alt="cancion.title"
                class="history-image"
                @error="handleImageError"
              />
              <div class="history-info">
                <p class="history-title">{{ cancion.title }}</p>
                <p class="history-artist">{{ cancion.artist }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error -->
    <div class="error-message" v-if="error">
      ⚠️ {{ error }}
    </div>

    <!-- Modal de Playlists -->
    <div class="playlist-modal" v-if="showPlaylistModal" @click.self="showPlaylistModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>📝 Agregar a Playlist</h3>
          <button @click="showPlaylistModal = false" class="close-btn">✕</button>
        </div>
        
        <div class="modal-body">
          <div v-if="playlists.length > 0" class="playlist-list">
            <div 
              v-for="playlist in playlists"
              :key="playlist.id"
              @click="agregarAPlaylist(playlist.id)"
              class="playlist-item"
              :class="{ 'loading': loadingPlaylist }"
            >
              <div class="playlist-info">
                <h4>{{ playlist.name }}</h4>
                <p v-if="playlist.description">{{ playlist.description }}</p>
                <span class="playlist-meta">
                  {{ playlist.playlist_canciones?.[0]?.count || 0 }} canciones
                </span>
              </div>
              <div class="playlist-icon">📁</div>
            </div>
          </div>
          
          <div v-else class="no-playlists">
            <p>No tienes playlists creadas</p>
            <p class="suggestion">Crea una playlist primero para poder agregar canciones</p>
            
            <!-- Botón temporal para sincronizar playlists -->
            <button 
              @click="sincronizarPlaylists"
              style="margin-top: 15px; padding: 8px 16px; background: #f59e0b; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px;"
            >
              🔄 Sincronizar mis playlists
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { useRadio } from '../composables/useRadio';
import { useLikesSimple } from '../composables/useLikesSimple';
import { usePlaylist } from '../composables/usePlaylist';
import { supabase } from '../supabase';
import headerComponent from '../components/headerComponent.vue';

const {
  cancionesDisponibles,
  cancionActual,
  siguienteCancion,
  historialCanciones,
  isPlaying,
  loading,
  error,
  tiempoActual,
  duracionTotal,
  volumen,
  progreso,
  cargarRadio,
  iniciarRadio,
  togglePlay,
  saltarCancion,
  detenerRadio,
  formatearTiempo
} = useRadio();

const { darLike, quitarLike, verificarLike } = useLikesSimple();
const { playlists, obtenerPlaylists, agregarCancionAPlaylist } = usePlaylist();

// Estados locales
const cancionLiked = ref(false);
const showPlaylistModal = ref(false);
const loadingLike = ref(false);
const loadingPlaylist = ref(false);

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

// Verificar si la canción actual tiene like
const checkLikeStatus = async () => {
  if (cancionActual.value) {
    cancionLiked.value = await verificarLike(cancionActual.value.id);
  }
};

// Toggle like para la canción actual
const toggleLike = async () => {
  if (!cancionActual.value || loadingLike.value) return;
  
  loadingLike.value = true;
  try {
    if (cancionLiked.value) {
      await quitarLike(cancionActual.value.id);
      cancionLiked.value = false;
    } else {
      await darLike(cancionActual.value.id);
      cancionLiked.value = true;
    }
  } catch (error) {
    console.error('Error al dar/quitar like:', error);
  } finally {
    loadingLike.value = false;
  }
};

// Mostrar modal de playlists
const mostrarPlaylists = async () => {
  const usuarioId = await obtenerUsuarioId();
  
  if (!usuarioId) {
    console.error('No se pudo obtener el ID del usuario');
    return;
  }
  
  console.log('Usuario ID para buscar playlists:', usuarioId);
  
  showPlaylistModal.value = true;
  
  try {
    await obtenerPlaylists(usuarioId);
    console.log('Playlists encontradas:', playlists.value.length);
    console.log('Contenido de playlists:', playlists.value);
    
    if (playlists.value.length === 0) {
      // Verificar si hay playlists con otros user_id
      const { data: allPlaylists } = await supabase
        .from('playlists')
        .select('id, name, user_id')
        .limit(5);
      console.log('Todas las playlists en la DB:', allPlaylists);
    }
  } catch (error) {
    console.error('Error obteniendo playlists:', error);
  }
};

// Agregar canción a playlist
const agregarAPlaylist = async (playlistId: number) => {
  if (!cancionActual.value || loadingPlaylist.value) return;
  
  loadingPlaylist.value = true;
  try {
    await agregarCancionAPlaylist(playlistId, cancionActual.value.id);
    showPlaylistModal.value = false;
    // Mostrar notificación de éxito aquí
  } catch (error) {
    console.error('Error agregando a playlist:', error);
  } finally {
    loadingPlaylist.value = false;
  }
};

// Función temporal para sincronizar playlists
const sincronizarPlaylists = async () => {
  const usuarioId = await obtenerUsuarioId();
  if (!usuarioId) {
    console.error('No se pudo obtener el ID del usuario');
    return;
  }
  
  try {
    // Obtener el usuario autenticado
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    console.log('Sincronizando playlists para usuario:', usuarioId);
    
    // Buscar playlists que podrían ser del usuario actual pero con user_id incorrecto
    const { data: playlistsDesactualizadas } = await supabase
      .from('playlists')
      .select('id, name, user_id')
      .neq('user_id', usuarioId);
    
    console.log('Playlists con user_id diferente:', playlistsDesactualizadas);
    
    if (playlistsDesactualizadas && playlistsDesactualizadas.length > 0) {
      // Actualizar todas las playlists para que pertenezcan al usuario actual
      const { data: updated, error: updateError } = await supabase
        .from('playlists')
        .update({ user_id: usuarioId })
        .neq('user_id', usuarioId)
        .select();
      
      if (updateError) {
        console.error('Error actualizando playlists:', updateError);
        return;
      }
      
      console.log('Playlists sincronizadas:', updated);
      alert(`Se sincronizaron ${updated?.length || 0} playlists. Cierra y vuelve a abrir el modal.`);
    } else {
      alert('No hay playlists que sincronizar.');
    }
  } catch (error) {
    console.error('Error en sincronización:', error);
  }
};

// Función para manejar errores de imagen
const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  if (target) {
    target.src = '/default-song.jpg';
  }
};

onMounted(() => {
  // Cargar canciones al montar el componente (sin reproducir automáticamente)
  cargarRadio();
});

onUnmounted(() => {
  // Limpiar audio al desmontar
  detenerRadio();
});

// Watcher para verificar el like cuando cambia la canción
watch(cancionActual, (nuevaCancion) => {
  if (nuevaCancion) {
    checkLikeStatus();
  }
}, { immediate: true });
</script>

<style scoped>
/* Contenedor principal de pantalla completa */
.radio-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%);
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  display: flex;
  flex-direction: column;
  position: relative;
}

.radio-view::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 300px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.03) 0%, rgba(29, 78, 216, 0.05) 100%);
  pointer-events: none;
}

/* Contenido principal con sidebar */
.radio-content {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 2rem;
  flex: 1;
  padding: 2rem;
  max-width: none;
  margin: 0;
}

/* Player principal */
.radio-player {
  background: white;
  border-radius: 20px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.8);
  padding: 2.5rem;
  backdrop-filter: blur(10px);
  position: relative;
  transition: all 0.3s ease;
}

.radio-player::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.02) 0%, rgba(29, 78, 216, 0.01) 100%);
  border-radius: 20px;
  pointer-events: none;
}

.radio-player:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 50px rgba(0, 0, 0, 0.12);
}

/* Header de la sección */
.radio-header {
  text-align: center;
  margin-bottom: 2rem;
}

.radio-title {
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
  letter-spacing: -0.025em;
}

.radio-subtitle {
  color: #64748b;
  font-size: 1.1rem;
  font-weight: 500;
}

/* Imagen de la canción */
.song-image-container {
  position: relative;
  text-align: center;
  margin-bottom: 2rem;
}

.song-image {
  width: 220px;
  height: 220px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 12px 40px rgba(59, 130, 246, 0.25);
  animation: rotate 20s linear infinite;
  border: 4px solid rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;
}

.song-image.playing {
  box-shadow: 0 16px 50px rgba(59, 130, 246, 0.35);
  transform: scale(1.02);
}

.song-image:not(.playing) {
  animation-play-state: paused;
  filter: grayscale(0.1);
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.playing-animation {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 3px;
}

.wave {
  width: 4px;
  height: 20px;
  background: #3b82f6;
  border-radius: 2px;
  animation: wave 1s ease-in-out infinite;
}

.wave:nth-child(2) { animation-delay: 0.2s; }
.wave:nth-child(3) { animation-delay: 0.4s; }

@keyframes wave {
  0%, 100% { transform: scaleY(1); }
  50% { transform: scaleY(2); }
}

/* Información de la canción */
.song-info {
  text-align: center;
  margin-bottom: 2rem;
}

.song-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.song-artist {
  font-size: 1.2rem;
  color: #64748b;
  margin-bottom: 0.3rem;
  font-weight: 500;
}

.song-album {
  font-size: 1rem;
  color: #94a3b8;
  margin-bottom: 0.5rem;
}

.song-genre {
  background: #e0f2fe;
  color: #0369a1;
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-size: 0.9rem;
  font-weight: 500;
  display: inline-block;
}

/* Progreso */
.progress-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  background: #f8fafc;
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  transition: width 0.3s ease;
  border-radius: 3px;
}

.time-current, .time-total {
  font-family: monospace;
  font-size: 0.9rem;
  color: #475569;
  font-weight: 600;
}

/* Controles */
.controls {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.control-btn {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  font-size: 1.5rem;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-btn:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #3b82f6;
  color: #3b82f6;
  transform: scale(1.05);
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.play-btn {
  width: 80px;
  height: 80px;
  font-size: 2rem;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border-color: #3b82f6;
}

.play-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  transform: scale(1.05);
}

/* Acciones de la canción */
.song-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: white;
  color: #64748b;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 140px;
  justify-content: center;
}

.action-btn:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #3b82f6;
  color: #3b82f6;
  transform: translateY(-1px);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn.liked {
  background: linear-gradient(135deg, #fef3f2 0%, #fee2e2 100%);
  border-color: #ef4444;
  color: #dc2626;
}

.action-btn.liked:hover {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  border-color: #dc2626;
}

.action-icon {
  font-size: 1.1rem;
}

.action-text {
  font-size: 0.9rem;
}

/* Control de volumen */
.volume-control {
  display: flex;
  align-items: center;
  gap: 1rem;
  justify-content: center;
  background: #f8fafc;
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.volume-slider {
  width: 150px;
  accent-color: #3b82f6;
}

.volume-percentage {
  font-size: 0.9rem;
  min-width: 40px;
  color: #475569;
  font-weight: 600;
}

/* Estados de carga */
.loading-state, .initial-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.start-radio-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border: none;
  color: white;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.start-radio-btn:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.ready-message {
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
  color: #64748b;
}

/* Sidebar */
.radio-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.next-song, .recent-history, .radio-stats {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  transition: all 0.3s ease;
}

.next-song:hover, .recent-history:hover, .radio-stats:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.1);
}

.next-song h3, .recent-history h3, .radio-stats h3 {
  margin-bottom: 1rem;
  font-size: 1.2rem;
  font-weight: 600;
  color: #1e293b;
}

.next-song-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.next-song-image {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid #e2e8f0;
}

.next-song-title {
  font-weight: 600;
  margin-bottom: 0.3rem;
  color: #1e293b;
}

.next-song-artist {
  color: #64748b;
  font-size: 0.9rem;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  max-height: 300px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  border-radius: 8px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.history-item:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.history-image {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  object-fit: cover;
  border: 1px solid #e2e8f0;
}

.history-title {
  font-size: 0.9rem;
  margin-bottom: 0.2rem;
  font-weight: 600;
  color: #1e293b;
}

.history-artist {
  font-size: 0.8rem;
  color: #64748b;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.stat-item {
  text-align: center;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.stat-number {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: #3b82f6;
  margin-bottom: 0.3rem;
}

.stat-label {
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 500;
}

.error-message {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  margin-top: 1rem;
}

/* Modal de Playlists */
.playlist-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 16px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  border: 1px solid #e2e8f0;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #64748b;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #e2e8f0;
  color: #374151;
}

.modal-body {
  padding: 1.5rem;
  max-height: 60vh;
  overflow-y: auto;
}

.playlist-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.playlist-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.2s ease;
}

.playlist-item:hover:not(.loading) {
  background: #f1f5f9;
  border-color: #3b82f6;
  transform: translateY(-1px);
}

.playlist-item.loading {
  opacity: 0.6;
  cursor: wait;
}

.playlist-info h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
}

.playlist-info p {
  margin: 0 0 0.25rem 0;
  font-size: 0.875rem;
  color: #64748b;
}

.playlist-meta {
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: 500;
}

.playlist-icon {
  font-size: 1.5rem;
  color: #3b82f6;
}

.no-playlists {
  text-align: center;
  padding: 2rem;
  color: #64748b;
}

.no-playlists p {
  margin: 0 0 0.5rem 0;
}

.suggestion {
  font-size: 0.875rem;
  color: #94a3b8;
  font-style: italic;
}

/* Responsive Design */
@media (max-width: 768px) {
  .radio-content {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    padding: 1rem;
  }
  
  .radio-title {
    font-size: 2rem;
  }
  
  .song-image {
    width: 180px;
    height: 180px;
  }
  
  .song-title {
    font-size: 1.5rem;
  }
  
  .volume-control {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .volume-slider {
    width: 200px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .song-actions {
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
  }
  
  .action-btn {
    width: 200px;
  }
}

@media (max-width: 480px) {
  .radio-content {
    padding: 0.75rem;
  }
  
  .radio-player,
  .next-song, .recent-history, .radio-stats {
    padding: 1.25rem;
  }
  
  .radio-title {
    font-size: 1.75rem;
  }
  
  .song-image {
    width: 150px;
    height: 150px;
  }
}

/* Animaciones adicionales */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.radio-player {
  animation: fadeInUp 0.6s ease-out;
}

.radio-sidebar > * {
  animation: fadeInUp 0.6s ease-out;
}

.radio-sidebar > *:nth-child(2) {
  animation-delay: 0.1s;
}

.radio-sidebar > *:nth-child(3) {
  animation-delay: 0.2s;
}

.song-image.playing {
  animation: rotate 20s linear infinite, pulse 2s ease-in-out infinite;
}

/* Efectos de hover mejorados */
.control-btn, .action-btn {
  position: relative;
  overflow: hidden;
  z-index: 1;
}

.control-btn::before, .action-btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.3s, height 0.3s;
}

.control-btn:hover::before, .action-btn:hover::before {
  width: 100%;
  height: 100%;
}

/* Scrollbar personalizado */
.history-list::-webkit-scrollbar {
  width: 6px;
}

.history-list::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.history-list::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.history-list::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>