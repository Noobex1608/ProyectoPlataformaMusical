import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { RadioPreference } from '@/types/community.types';
import { supabase } from '@/lib/supabase'; // Importar correctamente supabase

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
    // Aquí deberías obtener la canción real de la base de datos
    // Simulación: obtener la última canción subida
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .order('id', { ascending: false })
      .limit(1);
    if (error || !data || data.length === 0) {
      return {
        id: 'track-1',
        title: 'Canción de ejemplo',
        artist: 'Artista de ejemplo',
        url: '',
        coverUrl: '/default-cover.jpg',
      };
    }
    const song = data[0];
    return {
      id: song.id || song.title,
      title: song.title,
      artist: song.artist,
      url: song.file_url, // Usar la URL pública guardada
      coverUrl: '/default-cover.jpg',
    };
  }

  async function getPreviousTrack() {
    if (history.value.length > 0) {
      const track = history.value.pop();
      if (currentTrack.value) {
        queue.value.unshift(currentTrack.value);
      }
      currentTrack.value = track;
      return track;
    }

    // Si el historial está vacío, consultar Supabase para obtener la canción anterior
    try {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .order('id', { ascending: true }) // Ordenar en orden ascendente para obtener canciones más antiguas
        .limit(1);

      if (error || !data || data.length === 0) {
        console.error('Error al obtener la canción anterior de Supabase:', error);
        return null;
      }

      const song = data[0];
      const previousTrack = {
        id: song.id || song.title,
        title: song.title,
        artist: song.artist,
        url: song.file_url, // Usar la URL pública guardada
        coverUrl: '/default-cover.jpg',
      };

      currentTrack.value = previousTrack;
      return previousTrack;
    } catch (err) {
      console.error('Error al consultar Supabase para la canción anterior:', err);
      return null;
    }
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