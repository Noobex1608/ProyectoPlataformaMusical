<template>
  <div class="radio-algorithm">
    <div class="radio-header">
      <h2>Radio Algorítmica</h2>
      <div class="preferences-button">
        <button @click="showPreferences = true">
          <i class="fas fa-sliders-h"></i> Preferencias
        </button>
      </div>
    </div>

    <div class="player-container" v-if="currentTrack">
      <div class="track-info">
        <img 
          :src="currentTrack.coverUrl || coverImage"
          :loading="currentTrack.coverUrl ? 'lazy' : 'eager'" 
          :alt="currentTrack.title"
          class="cover-image"
        >
        <div class="track-details">
          <h3>{{ currentTrack.title }}</h3>
          <p>{{ currentTrack.artist }}</p>
        </div>
      </div>

      <div class="player-controls">
        <button @click="previousTrack" :disabled="!hasPrevious">
          <i class="fas fa-step-backward"></i>
        </button>
        <button @click="togglePlay" class="play-button">
          <i :class="isPlaying ? 'fas fa-pause' : 'fas fa-play'"></i>
        </button>
        <button @click="nextTrack">
          <i class="fas fa-step-forward"></i>
        </button>
      </div>

      <div class="track-actions">
        <button @click="likeTrack" :class="{ 'liked': isLiked }">
          <i class="fas fa-heart"></i>
        </button>
        <button @click="shareTrack">
          <i class="fas fa-share"></i>
        </button>
      </div>
    </div>

    <div v-else class="empty-state">
      <p>No hay pista en reproducción</p>
      <button @click="startRadio">Comenzar Radio</button>
    </div>

    <!-- Modal de Preferencias -->
    <Modal v-if="showPreferences" @close="showPreferences = false">
      <template #header>
        <h3>Preferencias de Radio</h3>
      </template>
      
      <template #default>
        <div class="preferences-form">
          <div class="preference-section">
            <h4>Géneros Favoritos</h4>
            <div class="tags-container">
              <span 
                v-for="genre in selectedGenres" 
                :key="genre"
                class="tag"
              >
                {{ genre }}
                <button @click="removeGenre(genre)">&times;</button>
              </span>
              <input 
                v-model="newGenre"
                @keyup.enter="addGenre"
                placeholder="Añadir género..."
              >
            </div>
          </div>

          <div class="preference-section">
            <h4>Artistas Favoritos</h4>
            <div class="tags-container">
              <span 
                v-for="artist in selectedArtists" 
                :key="artist"
                class="tag"
              >
                {{ artist }}
                <button @click="removeArtist(artist)">&times;</button>
              </span>
              <input 
                v-model="newArtist"
                @keyup.enter="addArtist"
                placeholder="Añadir artista..."
              >
            </div>
          </div>

          <div class="preference-section">
            <h4>Estados de Ánimo</h4>
            <div class="mood-grid">
              <button 
                v-for="mood in availableMoods"
                :key="mood"
                :class="{ active: selectedMoods.includes(mood) }"
                @click="toggleMood(mood)"
              >
                {{ mood }}
              </button>
            </div>
          </div>
        </div>
      </template>

      <template #footer>
        <button @click="savePreferences" class="primary">Guardar</button>
        <button @click="showPreferences = false">Cancelar</button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useCommunityStore } from '@/stores/community.store';
import { useAuthStore } from '@/stores/auth.store';
import type { Track } from '@/types/audio.types';
import Modal from '@/components/shared/Modal.vue';
import coverImage from '@/assets/cover1.jpg';

const communityStore = useCommunityStore();
const authStore = useAuthStore();

// Estado del reproductor
const currentTrack = ref<Track | null>(null);
const isPlaying = ref(false);
const hasPrevious = ref(false);
const isLiked = ref(false);

// Estado de preferencias
const showPreferences = ref(false);
const selectedGenres = ref<string[]>([]);
const selectedArtists = ref<string[]>([]);
const selectedMoods = ref<string[]>([]);
const newGenre = ref('');
const newArtist = ref('');

const availableMoods = [
  'Energético', 'Relajado', 'Feliz', 'Melancólico',
  'Romántico', 'Concentrado', 'Fiesta', 'Chill'
];

// Métodos del reproductor
const togglePlay = () => {
  isPlaying.value = !isPlaying.value;
  if (currentTrack.value) {
    communityStore.saveRadioInteraction(
      currentTrack.value.id,
      isPlaying.value ? 'play' : 'pause',
      authStore.user?.id || ''
    );
  }
};

const nextTrack = async () => {
  if (currentTrack.value) {
    await communityStore.saveRadioInteraction(
      currentTrack.value.id,
      'skip',
      authStore.user?.id || ''
    );
  }
  // Aquí iría la lógica para obtener la siguiente pista
};

const previousTrack = () => {
  hasPrevious.value && nextTrack();
};

const likeTrack = async () => {
  if (!currentTrack.value) return;
  
  isLiked.value = !isLiked.value;
  await communityStore.saveRadioInteraction(
    currentTrack.value.id,
    'like',
    authStore.user?.id || ''
  );
};

const shareTrack = () => {
  // Implementar lógica de compartir
};

const startRadio = async () => {
  // Implementar lógica para iniciar radio
};

// Métodos de preferencias
const addGenre = () => {
  if (newGenre.value && !selectedGenres.value.includes(newGenre.value)) {
    selectedGenres.value.push(newGenre.value);
    newGenre.value = '';
  }
};

const removeGenre = (genre: string) => {
  selectedGenres.value = selectedGenres.value.filter(g => g !== genre);
};

const addArtist = () => {
  if (newArtist.value && !selectedArtists.value.includes(newArtist.value)) {
    selectedArtists.value.push(newArtist.value);
    newArtist.value = '';
  }
};

const removeArtist = (artist: string) => {
  selectedArtists.value = selectedArtists.value.filter(a => a !== artist);
};

const toggleMood = (mood: string) => {
  const index = selectedMoods.value.indexOf(mood);
  if (index === -1) {
    selectedMoods.value.push(mood);
  } else {
    selectedMoods.value.splice(index, 1);
  }
};

const savePreferences = async () => {
  if (!authStore.user?.id) return;

  await communityStore.updateRadioPreferences({
    user_id: authStore.user.id,
    genres: selectedGenres.value,
    artists: selectedArtists.value,
    moods: selectedMoods.value 
  });
  
  showPreferences.value = false;
};

// Inicialización
onMounted(async () => {
  if (authStore.user?.id) {
    const preferences = await communityStore.radioPreferences;
    if (preferences) {
      selectedGenres.value = preferences.genres;
      selectedArtists.value = preferences.artists;
      selectedMoods.value = preferences.moods; 
    }
  }
});
</script>

<style scoped>
.radio-algorithm {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.radio-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.player-container {
  background: #fff;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.track-info {
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
}

.cover-image {
  width: 120px;
  height: 120px;
  border-radius: 8px;
  margin-right: 1.5rem;
  object-fit: cover;
}

.track-details h3 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
}

.track-details p {
  margin: 0.5rem 0 0;
  color: #666;
}

.player-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.play-button {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #1db954;
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.track-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.track-actions button {
  background: none;
  border: 1px solid #ddd;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  cursor: pointer;
}

.track-actions button.liked {
  color: #e74c3c;
  border-color: #e74c3c;
}

.preferences-form {
  padding: 1rem;
}

.preference-section {
  margin-bottom: 2rem;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.tag {
  background: #f0f0f0;
  padding: 0.25rem 0.5rem;
  border-radius: 15px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tag button {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 0;
}

.mood-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.mood-grid button {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
}

.mood-grid button.active {
  background: #1db954;
  color: white;
  border-color: #1db954;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  background: #f9f9f9;
  border-radius: 12px;
}

@media (max-width: 768px) {
  .radio-algorithm {
    padding: 1rem;
  }

  .track-info {
    flex-direction: column;
    text-align: center;
  }

  .cover-image {
    margin: 0 0 1rem 0;
  }
}
</style>