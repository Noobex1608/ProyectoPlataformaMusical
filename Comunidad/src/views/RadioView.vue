<template>
  <div class="radio-view min-h-screen bg-white dark:bg-gray-900 p-6">
    <div class="max-w-7xl mx-auto">
      <header class="flex justify-between items-center mb-8">
        <h2 class="text-3xl font-bold text-primary-500">
          Radio 
        </h2>
        <ThemeSelector />
      </header>
      
      <!-- Preferencias de Radio -->
      <section class="preferences-section bg-gray-50 dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
            Tus Preferencias
          </h3>
          <button 
            @click="openPreferencesModal"
            class="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200 flex items-center gap-2"
          >
            <font-awesome-icon icon="fa-solid fa-sliders" />
            <span>Editar Preferencias</span>
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Géneros -->
          <div class="preference-group bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
            <h4 class="font-medium mb-4 text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <font-awesome-icon icon="fa-solid fa-music" class="text-primary-500" />
              Géneros Favoritos
            </h4>
            <div class="flex flex-wrap gap-2">
              <span v-for="genre in userPreferences.genres" 
                    :key="genre"
                    class="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full text-sm"
              >
                {{ genre }}
              </span>
            </div>
          </div>
          
          <!-- Artistas -->
          <div class="preference-group bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
            <h4 class="font-medium mb-4 text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <font-awesome-icon icon="fa-solid fa-microphone" class="text-primary-500" />
              Artistas Favoritos
            </h4>
            <div class="flex flex-wrap gap-2">
              <span v-for="artist in userPreferences.artists" 
                    :key="artist"
                    class="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full text-sm"
              >
                {{ artist }}
              </span>
            </div>
          </div>
          
          <!-- Estados de ánimo -->
          <div class="preference-group bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
            <h4 class="font-medium mb-4 text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <font-awesome-icon icon="fa-solid fa-face-smile" class="text-primary-500" />
              Estados de Ánimo
            </h4>
            <div class="flex flex-wrap gap-2">
              <span v-for="mood in userPreferences.moods" 
                    :key="mood"
                    class="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full text-sm"
              >
                {{ mood }}
              </span>
            </div>
          </div>
        </div>
      </section>
      
      <!-- Reproductor -->
      <section class="player-section bg-gray-50 dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div v-if="loading" class="flex items-center space-x-6">
          <div class="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          <div class="flex-1">
            <div class="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
            <div class="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>

        <div v-else class="flex items-center space-x-6">
          <div class="relative group">
            <img 
              :src=" coverImage || currentTrack.coverUrl"
              :loading="currentTrack.coverUrl ? 'lazy' : 'eager'"
              :alt="currentTrack.title"
              class="w-24 h-24 rounded-lg object-cover shadow-lg transition-transform duration-300 group-hover:scale-105"
            >
            <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-300 rounded-lg"></div>
          </div>
          
          <div class="flex-1">
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-1">
              {{ currentTrack.title }}
            </h3>
            <p class="text-gray-600 dark:text-gray-400 mb-4">
              {{ currentTrack.artist }}
            </p>
            
            <!-- Controles -->
            <div class="flex items-center space-x-4">
              <button 
                @click="previousTrack"
                class="p-3 text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors duration-200"
                :disabled="loading"
                title="Anterior"
              >
                <font-awesome-icon icon="fa-solid fa-backward-step" />
              </button>
              
              <button 
                @click="togglePlay"
                class="p-4 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors duration-200"
                :disabled="loading"
                :title="isPlaying ? 'Pausar' : 'Reproducir'"
              >
                <font-awesome-icon :icon="isPlaying ? 'fa-solid fa-pause' : 'fa-solid fa-play'" />
              </button>
              
              <button 
                @click="nextTrack"
                class="p-3 text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors duration-200"
                :disabled="loading"
                title="Siguiente"
              >
                <font-awesome-icon icon="fa-solid fa-forward-step" />
              </button>
              
              <button 
                @click="toggleLike"
                class="p-3 text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors duration-200"
                :class="{ 'text-primary-500': isLiked }"
                :disabled="loading"
                :title="isLiked ? 'Quitar de favoritos' : 'Añadir a favoritos'"
              >
                <font-awesome-icon icon="fa-solid fa-heart" />
              </button>

              <div class="flex-1"></div>

              <button 
                @click="toggleShuffle"
                class="p-3 text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors duration-200"
                :class="{ 'text-primary-500': isShuffle }"
                :disabled="loading"
                title="Aleatorio"
              >
                <font-awesome-icon icon="fa-solid fa-shuffle" />
              </button>

              <button 
                @click="toggleRepeat"
                class="p-3 text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors duration-200"
                :class="{ 'text-primary-500': repeatMode !== 'off' }"
                :disabled="loading"
                :title="getRepeatTitle"
              >
                <font-awesome-icon icon="fa-solid fa-repeat" />
              </button>
            </div>

            <!-- Barra de reproducción -->
            <div class="mt-4">
              <input 
                type="range" 
                min="0" 
                :max="audioDuration" 
                v-model="audioCurrentTime" 
                @input="seekAudio" 
                class="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer dark:bg-gray-700">
              <div class="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-1">
                <span>{{ formatTime(audioCurrentTime) }}</span>
                <span>{{ formatTime(audioDuration) }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Modal de Preferencias -->
      <Modal v-if="showPreferencesModal" @close="closePreferencesModal">
        <template #header>
          <h3>Preferencias de Radio</h3>
        </template>
        <template #default>
          <div>
            <h4>Editar tus preferencias</h4>
            <form @submit.prevent="savePreferences">
              <!-- Géneros -->
              <div class="mb-4">
                <label for="genres" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Géneros Favoritos</label>
                <select id="genres" v-model="editablePreferences.genres" multiple class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm">
                  <option v-for="genre in availableGenres" :key="genre" :value="genre">{{ genre }}</option>
                </select>
              </div>

              <!-- Artistas -->
              <div class="mb-4">
                <label for="artists" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Artistas Favoritos</label>
                <select id="artists" v-model="editablePreferences.artists" multiple class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm">
                  <option v-for="artist in availableArtists" :key="artist.id" :value="artist.name">{{ artist.name }}</option>
                </select>
              </div>

              <!-- Estados de ánimo -->
              <div class="mb-4">
                <label for="moods" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Estados de Ánimo</label>
                <input id="moods" v-model="editablePreferences.moods" type="text" placeholder="Añadir estados de ánimo separados por comas" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm">
              </div>

              <div class="flex justify-end">
                <button type="submit" class="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200">Guardar</button>
              </div>
            </form>
          </div>
        </template>
        <template #footer>
          <button @click="closePreferencesModal">Cerrar</button>
        </template>
      </Modal>

      <!-- Subir Canción -->
      <div class="flex justify-end mb-4">
        <button 
          @click="toggleUploadModal"
          class="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200"
        >
          Subir Música
        </button>
      </div>

      <Modal v-if="showUploadModal" @close="closeUploadModal">
        <template #header>
          <h3>Subir Canción</h3>
        </template>
        <template #default>
          <form @submit.prevent="uploadSong" class="space-y-4">
            <div>
              <label for="song-title" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Título de la Canción</label>
              <input id="song-title" v-model="newSong.title" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" required />
            </div>

            <div>
              <label for="song-artist" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Artista</label>
              <input id="song-artist" v-model="newSong.artist" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" required />
            </div>

            <div>
              <label for="song-file" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Archivo de la Canción</label>
              <input id="song-file" type="file" @change="handleFileUpload" class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border file:border-gray-300 file:text-sm file:font-medium file:bg-primary-500 file:text-white hover:file:bg-primary-600" required />
            </div>

            <div class="flex justify-end">
              <button type="submit" class="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200">Subir</button>
            </div>
          </form>
        </template>
        <template #footer>
          <button @click="closeUploadModal" class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200">Cerrar</button>
        </template>
      </Modal>

      <!-- Botón de prueba de conexión Supabase -->
      <div class="flex justify-end mb-4">
        <button 
          @click="testSupabaseConnection"
          class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200"
        >
          Probar Conexión Supabase
        </button>
      </div>

      <!-- Botón externo para navegar a CommunityView -->
      <div class="footer-actions">
        <button @click="$router.push({ name: 'Community' })" class="external-nav-button">
          Ir a Comunidad
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRadioStore } from '@/stores/radio.store';
import type { RadioPreference } from '@/types/community.types';
import ThemeSelector from '@/components/shared/ThemeSelector.vue';
import coverImage from '@/assets/cover1.jpg';
import { fetchArtists } from '@/services/community.service';
import { supabase } from '@/lib/supabase';

interface Artist {
  id: string;
  name: string;
}

const radioStore = useRadioStore();
const isPlaying = ref(false);
const isLiked = ref(false);
const loading = ref(true);
const isShuffle = ref(false);
const repeatMode = ref<'off' | 'all' | 'one'>('off');
const showPreferencesModal = ref(false);
const showUploadModal = ref(false);

const userPreferences = ref<RadioPreference>({
  id: '1',
  user_id: '01',
  updated_at: '2023-10-01T12:00:00Z',
  genres: ['Rock', 'Pop', 'Jazz'],
  artists: ['Artist 1', 'Artist 2', 'Artist 3'],
  moods: ['Energético', 'Relajado', 'Feliz']
});

const currentTrack = ref({
  id: '1',
  title: 'Canción de ejemplo',
  artist: 'Artista de ejemplo',
  url: '', // Agregar la propiedad url para la reproducción
  coverUrl: coverImage,
});

const editablePreferences = ref({
  genres: [...userPreferences.value.genres],
  artists: [...userPreferences.value.artists],
  moods: [...userPreferences.value.moods],
});

const availableGenres = ['Rock', 'Pop', 'Jazz', 'Hip-Hop', 'Clásica', 'Reggae'];
const availableArtists = ref<Artist[]>([]);

const newSong = ref({
  title: '',
  artist: '',
  file: null as File | null,
});

const getRepeatTitle = computed(() => {
  switch (repeatMode.value) {
    case 'off': return 'Repetición desactivada';
    case 'all': return 'Repetir todas';
    case 'one': return 'Repetir una';
  }
});

onMounted(async () => {
  try {
    await loadUserPreferences();
    await startRadio();
    availableArtists.value = await fetchArtists();
  } catch (error) {
    console.error('Error al cargar los artistas:', error);
  } finally {
    loading.value = false;
  }
});

async function loadUserPreferences() {
  userPreferences.value = await radioStore.getUserPreferences();
}

async function startRadio() {
  const track = await radioStore.getNextTrack();
  if (track) {
    currentTrack.value = {
      ...track,
      url: track.url || '', // Asegurar que la propiedad url esté presente
    };
  }
}

let audioPlayer: HTMLAudioElement | null = null;

function togglePlay() {
  if (!currentTrack.value.url) {
    console.error('No hay una URL de archivo para reproducir.');
    return;
  }

  console.log('Intentando reproducir la URL:', currentTrack.value.url); // Depuración de la URL

  if (!audioPlayer) {
    // Crear un nuevo objeto Audio si no existe
    audioPlayer = new Audio(currentTrack.value.url);
    audioPlayer.addEventListener('timeupdate', updateAudioProgress); // Registrar el evento aquí
    audioPlayer.addEventListener('ended', async () => {
      // Pasar automáticamente a la siguiente canción cuando termine la actual
      await nextTrack();
      togglePlay(); // Reproducir automáticamente la siguiente canción
    });
  }

  if (isPlaying.value) {
    audioPlayer.pause();
  } else {
    audioPlayer.play().catch((error) => {
      console.error('Error al reproducir el audio:', error);
    });
  }

  isPlaying.value = !isPlaying.value;
}

async function nextTrack() {
  loading.value = true;
  try {
    const track = await radioStore.getNextTrack();
    if (track) {
      currentTrack.value = track;
    }
  } finally {
    loading.value = false;
  }
}

async function previousTrack() {
  loading.value = true;
  try {
    const track = await radioStore.getPreviousTrack();
    if (track) {
      currentTrack.value = track;
    }
  } finally {
    loading.value = false;
  }
}

function toggleLike() {
  isLiked.value = !isLiked.value;
  if (isLiked.value) {
    radioStore.likeTrack(currentTrack.value.id);
  }
}

function toggleShuffle() {
  isShuffle.value = !isShuffle.value;
  // Implementar lógica de reproducción aleatoria
}

function toggleRepeat() {
  const modes: ('off' | 'all' | 'one')[] = ['off', 'all', 'one'];
  const currentIndex = modes.indexOf(repeatMode.value);
  repeatMode.value = modes[(currentIndex + 1) % modes.length];
  // Implementar lógica de repetición
}

function openPreferencesModal() {
  showPreferencesModal.value = true;
}

function closePreferencesModal() {
  showPreferencesModal.value = false;
}

function savePreferences() {
  userPreferences.value = {
    ...userPreferences.value, 
    genres: [...editablePreferences.value.genres],
    artists: [...editablePreferences.value.artists],
    moods: [...editablePreferences.value.moods],
  };
  closePreferencesModal();
}

function closeUploadModal() {
  showUploadModal.value = false;
}

function toggleUploadModal() {
  showUploadModal.value = !showUploadModal.value;
}

function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    newSong.value.file = target.files[0];
    console.log('Archivo seleccionado:', {
      name: newSong.value.file.name,
      type: newSong.value.file.type,
      size: newSong.value.file.size,
    });
  }
}

async function uploadSong() {
  if (!newSong.value.file) {
    alert('Por favor selecciona un archivo para subir.');
    return;
  }

  console.log('Iniciando la subida de la canción:', newSong.value);

  try {
    // Validar tamaño y tipo del archivo
    const file = newSong.value.file;
    if (file.size > 10 * 1024 * 1024) { // Limitar a 10 MB
      alert('El archivo es demasiado grande. Por favor selecciona un archivo menor a 10 MB.');
      return;
    }
    if (!['audio/mpeg', 'audio/mp3'].includes(file.type)) {
      alert('Tipo de archivo no permitido. Por favor selecciona un archivo MP3.');
      return;
    }

    // Normalizar el nombre del archivo
    const normalizedFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    console.log('Nombre del archivo normalizado:', normalizedFileName);

    console.log('Intentando subir el archivo al bucket...');
    const { data, error } = await supabase.storage
      .from('songs')
      .upload(`public/${normalizedFileName}`, file);

    if (error) {
      console.error('Error al subir el archivo al bucket:', error);
      throw new Error('Error al subir el archivo al bucket.');
    }

    console.log('Archivo subido exitosamente:', data);

    // Generar URL pública completa
    const { data: publicUrlData } = supabase.storage.from('songs').getPublicUrl(`public/${normalizedFileName}`);
    const publicUrl = publicUrlData?.publicUrl || '';
    console.log('URL pública generada:', publicUrl);

    const songData = {
      title: newSong.value.title,
      artist: newSong.value.artist,
      file_url: publicUrl, 
    };

    console.log('Intentando insertar datos en la tabla:', songData);
    const { error: dbError } = await supabase
      .from('songs')
      .insert(songData);

    if (dbError) {
      console.error('Error al insertar datos en la tabla:', dbError);
      throw new Error('Error al insertar datos en la tabla.');
    }

    console.log('Datos insertados exitosamente en la tabla.');
    alert('Canción subida exitosamente.');
    newSong.value = { title: '', artist: '', file: null };
  } catch (error) {
    console.error('Error general al subir la canción:', error);
    alert('Hubo un error al subir la canción. Por favor revisa la consola para más detalles.');
  }
}

async function testSupabaseConnection() {
  try {
    console.log('Probando conexión con Supabase...');

    // Verificar acceso al bucket
    const { data: bucketData, error: bucketError } = await supabase.storage.from('songs').list();
    if (bucketError) {
      console.error('Error al acceder al bucket:', bucketError);
      throw new Error('No se pudo acceder al bucket.');
    }
    console.log('Acceso al bucket exitoso:', bucketData);

    // Verificar acceso a la tabla
    const { data: tableData, error: tableError } = await supabase.from('songs').select('*').limit(1);
    if (tableError) {
      console.error('Error al acceder a la tabla:', tableError);
      throw new Error('No se pudo acceder a la tabla.');
    }
    console.log('Acceso a la tabla exitoso:', tableData);

    alert('Conexión con Supabase exitosa. Revisa la consola para más detalles.');
  } catch (error) {
    console.error('Error al probar la conexión con Supabase:', error);
    alert('Hubo un error al probar la conexión con Supabase. Revisa la consola para más detalles.');
  }
}

const audioCurrentTime = ref(0);
const audioDuration = ref(0);

function updateAudioProgress() {
  if (audioPlayer) {
    audioCurrentTime.value = audioPlayer.currentTime;
    audioDuration.value = audioPlayer.duration;
  }
}

function seekAudio() {
  if (audioPlayer) {
    audioPlayer.currentTime = audioCurrentTime.value;
  }
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

onMounted(() => {
  if (audioPlayer) {
    audioPlayer.addEventListener('timeupdate', updateAudioProgress);
  }
});

onUnmounted(() => {
  if (audioPlayer) {
    audioPlayer.removeEventListener('timeupdate', updateAudioProgress);
  }
});
</script>

<style>
input[type="text"], input[type="file"] {
  color: #ffffff; /* Cambiar el color del texto a blanco para mejor visibilidad en temas oscuros */
}

input[type="text"]::placeholder {
  color: #cccccc; /* Color del texto del placeholder */
}
</style>