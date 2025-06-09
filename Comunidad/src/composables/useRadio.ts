import { ref } from 'vue';
import CommunityService from '../services/community.service';
import type { Track } from '../types/audio.types';

export function useRadio() {
  const currentTrack = ref<Track | null>(null);
  const isLoading = ref(false);
  const radioHistory = ref<Array<Track>>([]);

  const generateRadio = async (userId: string, preferences: any) => {
    isLoading.value = true;
    try {
      // Lógica para generar radio basada en preferencias
      // y guardar interacción en Supabase
      await CommunityService.saveRadioInteraction(
        currentTrack.value?.id || '', 
        'play', 
        userId
      );
    } finally {
      isLoading.value = false;
    }
  };

  return {
    currentTrack,
    isLoading,
    radioHistory,
    generateRadio
  };
}