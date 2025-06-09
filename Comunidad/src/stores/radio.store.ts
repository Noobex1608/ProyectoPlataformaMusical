import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { RadioPreference } from '@/types/community.types';

export const useRadioStore = defineStore('radio', () => {
  // Estado
  const currentTrack = ref<any>(null);
  const isPlaying = ref(false);
  const queue = ref<any[]>([]);
  const history = ref<any[]>([]);
  const userPreferences = ref<RadioPreference>({
    id: 'default',
    user_id: 'default',
    genres: ['Rock', 'Pop', 'Jazz'],
    artists: ['Artist 1', 'Artist 2', 'Artist 3'],
    moods: ['Energético', 'Relajado', 'Feliz'],
    updated_at: new Date().toISOString()
  });

  // Acciones
  async function getUserPreferences() {
    // TODO: Implementar llamada a la API para obtener preferencias
    return userPreferences.value;
  }

  async function updateUserPreferences(preferences: RadioPreference) {
    // TODO: Implementar llamada a la API para actualizar preferencias
    userPreferences.value = preferences;
  }

  async function getNextTrack() {
    // TODO: Implementar llamada a la API para obtener siguiente canción
    // basada en las preferencias del usuario
    return {
      id: 'track-1',
      title: 'Canción de ejemplo',
      artist: 'Artista de ejemplo',
      coverUrl: '/default-cover.jpg'
    };
  }

  async function getPreviousTrack() {
    // TODO: Implementar llamada a la API para obtener canción anterior
    if (history.value.length > 0) {
      const track = history.value.pop();
      if (currentTrack.value) {
        queue.value.unshift(currentTrack.value);
      }
      currentTrack.value = track;
      return track;
    }
    return null;
  }

  function likeTrack(trackId: string) {
    // TODO: Implementar llamada a la API para marcar canción como favorita
    console.log('Like track:', trackId);
  }

  function togglePlay() {
    isPlaying.value = !isPlaying.value;
  }

  return {
    currentTrack,
    isPlaying,
    queue,
    history,
    userPreferences,
    getUserPreferences,
    updateUserPreferences,
    getNextTrack,
    getPreviousTrack,
    likeTrack,
    togglePlay
  };
}); 