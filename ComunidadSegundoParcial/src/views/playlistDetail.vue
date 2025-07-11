<template>
  <div class="playlist-detail-container">
    <!-- Header Component -->
    <HeaderComponent />
    
    <!-- Main Content -->
    <div class="main-content">
      <!-- Back Button -->
      <div class="back-button-container">
        <button @click="$router.push('/playlist')" class="btn-back">
          ← Volver a Playlists
        </button>
      </div>

      <!-- Playlist Header -->
      <div v-if="playlist" class="playlist-header">
        <div class="playlist-info">
          <h1>{{ playlist.name }}</h1>
          <p class="playlist-description">{{ playlist.description || 'Sin descripción' }}</p>
          <div class="playlist-meta">
            <span class="song-count">🎵 {{ cancionesPlaylist.length }} canciones</span>
            <span class="visibility-badge" :class="{ public: playlist.is_public }">
              {{ playlist.is_public ? '🌍 Pública' : '🔒 Privada' }}
            </span>
          </div>
        </div>
        <div class="playlist-actions">
          <button @click="mostrarModalAgregarCancion = true" class="btn-primary">
            ➕ Agregar Canción
          </button>
        </div>
      </div>

      <!-- Music Player -->
      <div v-if="cancionActual" class="music-player">
        <div class="player-info">
          <div class="player-image-container">
            <img 
              v-if="cancionActual.imagen_url" 
              :src="cancionActual.imagen_url" 
              :alt="cancionActual.title" 
              class="player-image"
            />
            <div v-else class="player-image-placeholder">
              🎵
            </div>
          </div>
          <div class="player-details">
            <h3>{{ cancionActual.title }}</h3>
            <p>{{ cancionActual.artist }}</p>
            <p class="song-album">{{ cancionActual.album || 'Sin álbum' }}</p>
          </div>
        </div>
        
        <div class="player-controls">
          <button @click="anteriorCancion" class="btn-control" :disabled="indiceCancionActual <= 0">⏮️</button>
          <button 
            @click="toggleReproduccion" 
            class="btn-control-main"
            :disabled="!cancionActual?.audio_data || loadingAudio"
            :title="cancionActual?.audio_data ? 'Reproducir/Pausar' : 'No hay audio disponible'"
          >
            <span v-if="loadingAudio" class="loading-spinner-small"></span>
            <span v-else>{{ reproduciendose ? '⏸️' : '▶️' }}</span>
          </button>
          <button @click="siguienteCancion" class="btn-control" :disabled="indiceCancionActual >= cancionesPlaylist.length - 1">⏭️</button>
        </div>
        
        <div class="player-progress">
          <span class="time-current">{{ formatearTiempo(tiempoActual) }}</span>
          <div class="progress-bar" @click="cambiarProgreso">
            <div class="progress-fill" :style="{ width: `${progreso}%` }"></div>
          </div>
          <span class="time-total">{{ formatearTiempo(cancionActual.duration || 0) }}</span>
        </div>
        
        <!-- Volume Control -->
        <div class="volume-control">
          <button 
            @click="toggleMute" 
            class="btn-volume"
            :title="volumen === 0 ? 'Activar sonido' : 'Silenciar'"
          >
            {{ volumen === 0 ? '🔇' : volumen < 0.5 ? '🔉' : '🔊' }}
          </button>
          <div class="volume-slider-container">
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.1" 
              v-model="volumen" 
              @input="cambiarVolumen"
              class="volume-slider"
              :style="{ background: `linear-gradient(to right, #4a90e2 0%, #4a90e2 ${volumen * 100}%, #e9ecef ${volumen * 100}%, #e9ecef 100%)` }"
            />
          </div>
          <span class="volume-text">{{ Math.round(volumen * 100) }}%</span>
        </div>
      </div>

      <!-- Songs List -->
      <div class="songs-section">
        <h2>🎵 Canciones de la Playlist</h2>
        
        <div v-if="loadingCanciones" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Cargando canciones...</p>
        </div>

        <div v-else-if="cancionesPlaylist.length === 0" class="empty-state">
          <div class="empty-icon">🎵</div>
          <h3>No hay canciones en esta playlist</h3>
          <p>Agrega canciones para empezar a disfrutar de tu música</p>
          <button @click="mostrarModalAgregarCancion = true" class="btn-primary">
            ➕ Agregar Primera Canción
          </button>
        </div>

        <div v-else class="songs-list">
          <div
            v-for="(cancion, index) in cancionesPlaylist"
            :key="cancion.id"
            class="song-item"
            :class="{ active: cancionActual?.id === cancion.id }"
            @click="seleccionarCancion(cancion, index)"
          >
            <div class="song-order">{{ index + 1 }}</div>
            <div class="song-image-container">
              <img 
                v-if="cancion.imagen_url"
                :src="cancion.imagen_url" 
                :alt="cancion.title"
                class="song-image"
              />
              <div v-else class="song-image-placeholder">
                🎵
              </div>
            </div>
            <div class="song-details">
              <h4>{{ cancion.title }}</h4>
              <p>{{ cancion.artist }}</p>
              <p class="song-album">{{ cancion.album || 'Sin álbum' }}</p>
            </div>
            <div class="song-actions">
              <button 
                @click.stop="toggleLike(cancion.id)"
                class="btn-like"
                :class="{ liked: cancion.liked }"
                :disabled="loadingLikes[cancion.id]"
                :title="cancion.liked ? 'Quitar like' : 'Dar like'"
              >
                <span v-if="loadingLikes[cancion.id]">⏳</span>
                <span v-else>{{ cancion.liked ? '❤️' : '🤍' }}</span>
              </button>
              <span class="song-duration">{{ formatearTiempo(cancion.duration || 0) }}</span>
              <button 
                @click.stop="quitarCancionDePlaylist(cancion.id)"
                class="btn-remove"
                title="Quitar de la playlist"
              >
                ❌
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Audio Element (oculto) -->
    <audio 
      ref="audioElement"
      @loadedmetadata="onAudioLoaded"
      @timeupdate="onTimeUpdate"
      @ended="onAudioEnded"
      @error="onAudioError"
      @play="reproduciendose = true"
      @pause="reproduciendose = false"
      preload="metadata"
    ></audio>

    <!-- Modal para agregar canciones -->
    <div v-if="mostrarModalAgregarCancion" class="modal-overlay" @click="cerrarModalAgregar">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>➕ Agregar Canciones</h2>
          <button @click="cerrarModalAgregar" class="btn-close">✕</button>
        </div>
        <div class="modal-body">
          <div class="search-container">
            <input
              v-model="busquedaCancion"
              @input="buscarCanciones"
              type="text"
              placeholder="Buscar canciones..."
              class="search-input"
            />
          </div>
          
          <div v-if="cancionesBusqueda.length > 0" class="search-results">
            <h4>Resultados de búsqueda:</h4>
            <div class="songs-list">
              <div
                v-for="cancion in cancionesBusqueda"
                :key="cancion.id"
                class="song-item"
              >
                <img 
                  :src="cancion.imagen_url || '/placeholder-song.png'" 
                  :alt="cancion.title"
                  class="song-image"
                />
                <div class="song-details">
                  <h4>{{ cancion.title }}</h4>
                  <p>{{ cancion.artist }}</p>
                  <p class="song-album">{{ cancion.album || 'Sin álbum' }}</p>
                </div>
                <button 
                  @click="agregarCancionAPlaylist(cancion.id)"
                  class="btn-add-song"
                  :disabled="loadingAgregarCancion"
                >
                  {{ loadingAgregarCancion ? '⏳' : '➕' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import HeaderComponent from '../components/headerComponent.vue';
import { usePlaylist } from '../composables/usePlaylist';
import { useCanciones } from '../composables/useCanciones';
import { useLikesSimple } from '../composables/useLikesSimple';

// Route
const route = useRoute();
const playlistId = computed(() => parseInt(route.params.id as string));

// Composables
const {
  playlist,
  playlistCanciones,
  obtenerPlaylistPorId,
  obtenerCancionesPlaylist,
  agregarCancionAPlaylist: agregarCancionComposable,
  quitarCancionDePlaylist: quitarCancionComposable
} = usePlaylist();

const {
  canciones,
  buscarCanciones: buscarCancionesComposable
} = useCanciones();

// Composable de likes
const { darLike, quitarLike, verificarLike, registrarReproduccion } = useLikesSimple();

// Reactive data
const cancionesPlaylist = ref<any[]>([]);
const cancionActual = ref<any | null>(null);
const indiceCancionActual = ref(0);
const reproduciendose = ref(false);
const tiempoActual = ref(0);
const audioElement = ref<HTMLAudioElement | null>(null);
const loadingCanciones = ref(false);
const loadingAudio = ref(false);
const volumen = ref(1); // Volumen inicial al 100%
const volumenAnterior = ref(1); // Para recordar el volumen antes de silenciar
const loadingLikes = ref<{ [key: number]: boolean }>({});
const mostrarModalAgregarCancion = ref(false);
const busquedaCancion = ref('');
const cancionesBusqueda = ref<any[]>([]);
const loadingAgregarCancion = ref(false);

// Computed
const progreso = computed(() => {
  if (!cancionActual.value?.duration) return 0;
  return (tiempoActual.value / cancionActual.value.duration) * 100;
});

// Methods
const cargarDatosPlaylist = async () => {
  loadingCanciones.value = true;
  console.log('Iniciando carga de playlist:', playlistId.value);
  
  try {
    await obtenerPlaylistPorId(playlistId.value);
    await obtenerCancionesPlaylist(playlistId.value);
    
    console.log('Playlist cargada:', playlist.value);
    console.log('Canciones de playlist:', playlistCanciones.value);
    
    // Mapear las canciones y verificar likes
    const cancionesMapeadas = await Promise.all(
      playlistCanciones.value.map(async (playlistCancion: any) => {
        const cancionId = playlistCancion.canciones?.id || playlistCancion.cancion_id;
        console.log('Procesando canción:', cancionId);
        
        const cancion = {
          id: cancionId,
          title: playlistCancion.canciones?.title || 'Sin título',
          artist: playlistCancion.canciones?.artist || 'Artista desconocido',
          album: playlistCancion.canciones?.album || 'Sin álbum',
          duration: playlistCancion.canciones?.duration || 0,
          genre: playlistCancion.canciones?.genre || '',
          imagen_url: playlistCancion.canciones?.imagen_url || null,
          audio_data: playlistCancion.canciones?.audio_data || null,
          artista_id: playlistCancion.canciones?.artista_id || null,
          orden: playlistCancion.orden || 0,
          liked: false // Inicializar como false
        };
        
        // Verificar like asíncronamente
        try {
          const hasLike = await verificarLike(cancionId);
          cancion.liked = hasLike;
          console.log('Like verificado para canción', cancionId, ':', hasLike);
        } catch (error) {
          console.error('Error verificando like para canción', cancionId, ':', error);
        }
        
        return cancion;
      })
    );
    
    cancionesPlaylist.value = cancionesMapeadas;
    console.log('Canciones mapeadas:', cancionesPlaylist.value);
    
    // Seleccionar la primera canción por defecto
    if (cancionesPlaylist.value.length > 0) {
      seleccionarCancion(cancionesPlaylist.value[0], 0);
    }
  } catch (error) {
    console.error('Error cargando playlist:', error);
  } finally {
    loadingCanciones.value = false;
    console.log('Carga de playlist completada');
  }
};

const seleccionarCancion = async (cancion: any, indice: number) => {
  cancionActual.value = cancion;
  indiceCancionActual.value = indice;
  tiempoActual.value = 0;
  reproduciendose.value = false;
  loadingAudio.value = true;
  
  // Cargar la nueva canción en el reproductor
  if (audioElement.value && cancion.audio_data) {
    audioElement.value.src = cancion.audio_data;
    audioElement.value.volume = volumen.value; // Mantener el volumen configurado
    audioElement.value.load();
  }
};

const toggleReproduccion = async () => {
  if (!audioElement.value || !cancionActual.value?.audio_data) {
    console.warn('No hay audio disponible para reproducir');
    return;
  }

  try {
    if (reproduciendose.value) {
      audioElement.value.pause();
      reproduciendose.value = false;
      
      // Registrar reproducción si se reprodujo más de 30 segundos
      if (tiempoActual.value > 30 && cancionActual.value?.id) {
        await registrarReproduccion(cancionActual.value.id, tiempoActual.value);
      }
    } else {
      await audioElement.value.play();
      reproduciendose.value = true;
    }
  } catch (error) {
    console.error('Error reproduciendo audio:', error);
    reproduciendose.value = false;
  }
};

const cambiarProgreso = (event: MouseEvent) => {
  if (!cancionActual.value?.duration || !audioElement.value) return;
  
  const progressBar = event.currentTarget as HTMLElement;
  const rect = progressBar.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const width = rect.width;
  const newProgress = (clickX / width) * 100;
  
  const newTime = (newProgress / 100) * cancionActual.value.duration;
  audioElement.value.currentTime = newTime;
  tiempoActual.value = newTime;
};

// Funciones de manejo del audio
const onAudioLoaded = () => {
  loadingAudio.value = false;
  if (audioElement.value && cancionActual.value) {
    cancionActual.value.duration = audioElement.value.duration;
    audioElement.value.volume = volumen.value; // Aplicar volumen inicial
  }
};

const onTimeUpdate = () => {
  if (audioElement.value) {
    tiempoActual.value = audioElement.value.currentTime;
  }
};

const onAudioEnded = () => {
  reproduciendose.value = false;
  // Avanzar a la siguiente canción automáticamente
  siguienteCancion();
};

const onAudioError = (error: Event) => {
  console.error('Error en el reproductor de audio:', error);
  reproduciendose.value = false;
  loadingAudio.value = false;
};

const anteriorCancion = () => {
  if (indiceCancionActual.value > 0) {
    const nuevoIndice = indiceCancionActual.value - 1;
    seleccionarCancion(cancionesPlaylist.value[nuevoIndice], nuevoIndice);
  } else {
    // Si es la primera canción, reiniciar
    if (audioElement.value) {
      audioElement.value.currentTime = 0;
      tiempoActual.value = 0;
    }
  }
};

const siguienteCancion = () => {
  if (indiceCancionActual.value < cancionesPlaylist.value.length - 1) {
    const nuevoIndice = indiceCancionActual.value + 1;
    seleccionarCancion(cancionesPlaylist.value[nuevoIndice], nuevoIndice);
  } else {
    // Si es la última canción, parar la reproducción
    reproduciendose.value = false;
    if (audioElement.value) {
      audioElement.value.pause();
      audioElement.value.currentTime = 0;
    }
    tiempoActual.value = 0;
  }
};

const toggleLike = async (cancionId: number) => {
  const cancion = cancionesPlaylist.value.find(c => c.id === cancionId);
  if (!cancion) {
    console.error('Canción no encontrada:', cancionId);
    return;
  }

  // Evitar múltiples clicks mientras se procesa
  if (loadingLikes.value[cancionId]) {
    console.log('Operación ya en progreso para canción:', cancionId);
    return;
  }
  
  loadingLikes.value[cancionId] = true;
  console.log('Iniciando toggle like para canción:', cancionId, 'estado actual:', cancion.liked);

  try {
    if (cancion.liked) {
      console.log('Quitando like...');
      const success = await quitarLike(cancionId);
      if (success) {
        cancion.liked = false;
        console.log('Like removido exitosamente');
      } else {
        console.error('Error al quitar like');
      }
    } else {
      console.log('Agregando like...');
      const success = await darLike(cancionId);
      if (success) {
        cancion.liked = true;
        console.log('Like agregado exitosamente');
      } else {
        console.error('Error al agregar like');
      }
    }
  } catch (error) {
    console.error('Error al dar/quitar like:', error);
  } finally {
    loadingLikes.value[cancionId] = false;
    console.log('Toggle like completado para canción:', cancionId);
  }
};

const buscarCanciones = async () => {
  if (busquedaCancion.value.trim().length > 2) {
    await buscarCancionesComposable(busquedaCancion.value);
    // Mapear las canciones de búsqueda correctamente
    const cancionesMapeadas = canciones.value.map((cancion: any) => ({
      id: cancion.id,
      title: cancion.title || 'Sin título',
      artist: cancion.artist || 'Artista desconocido',
      album: cancion.album || 'Sin álbum',
      duration: cancion.duration || 0,
      genre: cancion.genre || '',
      imagen_url: cancion.imagen_url || null,
      audio_data: cancion.audio_data || null,
      artista_id: cancion.artista_id || null
    }));
    cancionesBusqueda.value = cancionesMapeadas;
  } else {
    cancionesBusqueda.value = [];
  }
};

const agregarCancionAPlaylist = async (cancionId: number) => {
  loadingAgregarCancion.value = true;
  try {
    await agregarCancionComposable(playlistId.value, cancionId);
    await cargarDatosPlaylist();
    // Remover canción de resultados de búsqueda
    cancionesBusqueda.value = cancionesBusqueda.value.filter(c => c.id !== cancionId);
  } catch (error) {
    console.error('Error agregando canción:', error);
  } finally {
    loadingAgregarCancion.value = false;
  }
};

const quitarCancionDePlaylist = async (cancionId: number) => {
  if (confirm('¿Estás seguro de que quieres quitar esta canción de la playlist?')) {
    try {
      await quitarCancionComposable(playlistId.value, cancionId);
      await cargarDatosPlaylist();
    } catch (error) {
      console.error('Error quitando canción:', error);
    }
  }
};

const cerrarModalAgregar = () => {
  mostrarModalAgregarCancion.value = false;
  busquedaCancion.value = '';
  cancionesBusqueda.value = [];
};

const formatearTiempo = (segundos: number) => {
  if (!segundos || isNaN(segundos)) return '0:00';
  const minutos = Math.floor(segundos / 60);
  const secs = Math.floor(segundos % 60);
  return `${minutos}:${secs.toString().padStart(2, '0')}`;
};

// Funciones de control de volumen
const cambiarVolumen = () => {
  if (audioElement.value) {
    audioElement.value.volume = volumen.value;
  }
};

const toggleMute = () => {
  if (volumen.value === 0) {
    volumen.value = volumenAnterior.value; // Restaurar volumen anterior
  } else {
    volumenAnterior.value = volumen.value; // Guardar volumen actual
    volumen.value = 0; // Silenciar
  }
  cambiarVolumen();
};

// Lifecycle
onMounted(() => {
  cargarDatosPlaylist();
});
</script>

<style scoped>
.playlist-detail-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%);
}

.main-content {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.back-button-container {
  margin-bottom: 20px;
}

.btn-back {
  background: #6c757d;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}

.btn-back:hover {
  background: #5a6268;
}

.playlist-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
  margin-bottom: 30px;
  border: 1px solid #ddd;
}

.playlist-info h1 {
  color: #348e91;
  margin: 0 0 10px 0;
  font-size: 2.5rem;
}

.playlist-description {
  color: #666;
  margin-bottom: 15px;
  font-size: 1.1rem;
}

.playlist-meta {
  display: flex;
  gap: 20px;
  align-items: center;
}

.song-count {
  color: #4a90e2;
  font-weight: 600;
}

.visibility-badge {
  background: #e9ecef;
  color: #6c757d;
  padding: 6px 12px;
  border-radius: 15px;
  font-size: 0.9rem;
  font-weight: 500;
}

.visibility-badge.public {
  background: #d4edda;
  color: #155724;
}

.music-player {
  background: white;
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
  margin-bottom: 30px;
  border: 1px solid #ddd;
}

.player-info {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.player-image {
  width: 80px;
  height: 80px;
  border-radius: 10px;
  object-fit: cover;
}

.player-image-placeholder {
  width: 80px;
  height: 80px;
  border-radius: 10px;
  background: linear-gradient(135deg, #348e91 0%, #4a90e2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: white;
}

.song-image-placeholder {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  background: linear-gradient(135deg, #348e91 0%, #4a90e2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

.player-details h3 {
  color: #348e91;
  margin: 0 0 5px 0;
  font-size: 1.5rem;
}

.player-details p {
  color: #666;
  margin: 0;
  font-size: 1.1rem;
}

.player-controls {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 20px;
}

.btn-control,
.btn-control-main {
  background: #348e91;
  color: white;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.5rem;
  transition: all 0.3s ease;
}

.btn-control-main {
  width: 60px;
  height: 60px;
  font-size: 1.8rem;
  background: linear-gradient(135deg, #348e91 0%, #4a90e2 100%);
}

.btn-control:hover,
.btn-control-main:hover {
  transform: scale(1.05);
}

.player-progress {
  display: flex;
  align-items: center;
  gap: 15px;
}

.time-current,
.time-total {
  color: #666;
  font-size: 0.9rem;
  font-weight: 500;
  min-width: 40px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #348e91 0%, #4a90e2 100%);
  transition: width 0.3s ease;
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 15px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 8px;
}

.btn-volume {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 8px;
  border-radius: 6px;
  transition: background-color 0.3s ease;
  min-width: 40px;
}

.btn-volume:hover {
  background: #e9ecef;
}

.volume-slider-container {
  flex: 1;
  display: flex;
  align-items: center;
}

.volume-slider {
  width: 100%;
  height: 6px;
  background: #e9ecef;
  border-radius: 3px;
  outline: none;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  background: linear-gradient(135deg, #348e91 0%, #4a90e2 100%);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(52, 142, 145, 0.3);
  transition: transform 0.2s ease;
}

.volume-slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

.volume-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  background: linear-gradient(135deg, #348e91 0%, #4a90e2 100%);
  border-radius: 50%;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 6px rgba(52, 142, 145, 0.3);
}

.volume-text {
  color: #666;
  font-size: 0.9rem;
  font-weight: 500;
  min-width: 40px;
  text-align: center;
}

.songs-section {
  background: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
  border: 1px solid #ddd;
}

.songs-section h2 {
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

.loading-spinner-small {
  border: 2px solid #f3f3f3;
  border-top: 2px solid #348e91;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
  display: inline-block;
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

.songs-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.song-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border: 2px solid #f8f9fa;
  border-radius: 10px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.song-item:hover {
  border-color: #348e91;
  background: #f8f9fa;
}

.song-item.active {
  border-color: #348e91;
  background: #e8f5f5;
}

.song-order {
  color: #666;
  font-weight: 600;
  width: 30px;
  text-align: center;
}

.song-image {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
}

.song-details {
  flex: 1;
}

.song-details h4 {
  color: #333;
  margin: 0 0 5px 0;
  font-size: 1.1rem;
}

.song-details p {
  color: #666;
  margin: 0 0 3px 0;
  font-size: 0.9rem;
}

.song-album {
  color: #999;
  font-size: 0.8rem;
}

.song-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-like {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 5px;
  border-radius: 5px;
  transition: background-color 0.3s ease;
}

.btn-like:hover {
  background: #f8f9fa;
}

.btn-like.liked {
  animation: heartbeat 0.5s;
}

@keyframes heartbeat {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.song-duration {
  color: #666;
  font-size: 0.9rem;
  min-width: 45px;
  text-align: center;
}

.btn-remove {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  padding: 5px;
  border-radius: 5px;
  transition: background-color 0.3s ease;
}

.btn-remove:hover {
  background: #ffebee;
}

.btn-primary {
  background: linear-gradient(135deg, #348e91 0%, #4a90e2 100%);
  color: white;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(52, 142, 145, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(52, 142, 145, 0.4);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 15px;
  width: 90%;
  max-width: 700px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  border-bottom: 1px solid #ddd;
}

.modal-header h2 {
  color: #348e91;
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.3s ease;
}

.btn-close:hover {
  background: #f8f9fa;
}

.modal-body {
  padding: 20px 30px;
}

.search-container {
  margin-bottom: 20px;
}

.search-input {
  width: 100%;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #348e91;
}

.search-results h4 {
  color: #666;
  margin-bottom: 15px;
}

.btn-add-song {
  background: #4a90e2;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.3s ease;
}

.btn-add-song:hover {
  background: #357abd;
}

.btn-add-song:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .main-content {
    padding: 10px;
  }
  
  .playlist-header {
    flex-direction: column;
    gap: 20px;
  }
  
  .player-info {
    flex-direction: column;
    text-align: center;
  }
  
  .player-controls {
    gap: 10px;
  }
  
  .btn-control,
  .btn-control-main {
    width: 45px;
    height: 45px;
    font-size: 1.3rem;
  }
  
  .btn-control-main {
    width: 55px;
    height: 55px;
    font-size: 1.6rem;
  }
  
  .volume-control {
    flex-direction: column;
    gap: 8px;
  }
  
  .volume-slider-container {
    width: 100%;
  }
  
  .modal-content {
    width: 95%;
    margin: 20px 0;
  }
}
</style>
