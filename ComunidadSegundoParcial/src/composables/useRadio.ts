import { ref, computed, watch } from 'vue';
import { supabase } from '../supabase';
import { useLikesSimple } from './useLikesSimple';

export interface CancionRadio {
  id: number;
  title: string;
  artist: string;
  album: string | null;
  duration: number;
  genre: string | null;
  imagen_url: string | null;
  audio_data: string | null;
  artista_id: string | null;
}

export const useRadio = () => {
  const cancionesDisponibles = ref<CancionRadio[]>([]);
  const cancionActual = ref<CancionRadio | null>(null);
  const siguienteCancion = ref<CancionRadio | null>(null);
  const historialCanciones = ref<CancionRadio[]>([]);
  const isPlaying = ref(false);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const audio = ref<HTMLAudioElement | null>(null);
  const tiempoActual = ref(0);
  const duracionTotal = ref(0);
  const volumen = ref(0.7);
  
  const { registrarReproduccion } = useLikesSimple();

  // Cargar todas las canciones disponibles
  const cargarCancionesDisponibles = async () => {
    loading.value = true;
    error.value = null;
    
    try {
      const { data, error: supabaseError } = await supabase
        .from('canciones')
        .select('id, title, artist, album, duration, genre, imagen_url, audio_data, artista_id')
        .not('audio_data', 'is', null)
        .order('created_at', { ascending: false });

      if (supabaseError) throw supabaseError;
      
      cancionesDisponibles.value = data || [];
      console.log('✅ Canciones para radio cargadas:', data?.length || 0);
      
      // NO seleccionar canción automáticamente - esperar interacción del usuario
      
    } catch (err: any) {
      console.error('❌ Error cargando canciones para radio:', err);
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  // Seleccionar una canción aleatoria
  const seleccionarCancionAleatoria = () => {
    if (cancionesDisponibles.value.length === 0) return null;
    
    // Filtrar canciones que no estén en el historial reciente (últimas 10)
    const historialReciente = historialCanciones.value.slice(-10);
    const cancionesDisponiblesFiltradas = cancionesDisponibles.value.filter(
      cancion => !historialReciente.some(h => h.id === cancion.id)
    );
    
    // Si todas las canciones están en el historial, usar todas
    const cancionesParaSeleccionar = cancionesDisponiblesFiltradas.length > 0 
      ? cancionesDisponiblesFiltradas 
      : cancionesDisponibles.value;
    
    const randomIndex = Math.floor(Math.random() * cancionesParaSeleccionar.length);
    return cancionesParaSeleccionar[randomIndex];
  };

  // Reproducir canción
  const reproducirCancion = async (cancion: CancionRadio) => {
    if (!cancion.audio_data) {
      error.value = 'La canción no tiene audio disponible';
      return;
    }

    try {
      // Pausar audio anterior si existe
      if (audio.value) {
        audio.value.pause();
        audio.value = null;
      }

      // Crear nuevo elemento de audio
      audio.value = new Audio(cancion.audio_data);
      audio.value.volume = volumen.value;

      // Event listeners
      audio.value.addEventListener('timeupdate', () => {
        if (audio.value) {
          tiempoActual.value = audio.value.currentTime;
        }
      });

      audio.value.addEventListener('loadedmetadata', () => {
        if (audio.value) {
          duracionTotal.value = audio.value.duration;
        }
      });

      audio.value.addEventListener('ended', () => {
        siguienteCancionAutomatica();
      });

      audio.value.addEventListener('error', () => {
        error.value = 'Error al cargar el audio';
        siguienteCancionAutomatica();
      });

      // Reproducir
      await audio.value.play();
      
      // Actualizar estado
      cancionActual.value = cancion;
      isPlaying.value = true;
      
      // Agregar al historial
      if (!historialCanciones.value.some(h => h.id === cancion.id)) {
        historialCanciones.value.push(cancion);
        
        // Mantener solo las últimas 50 canciones en el historial
        if (historialCanciones.value.length > 50) {
          historialCanciones.value = historialCanciones.value.slice(-50);
        }
      }

      // Preparar siguiente canción
      siguienteCancion.value = seleccionarCancionAleatoria();

      console.log('🎵 Reproduciendo:', cancion.title, 'por', cancion.artist);
      
    } catch (err: any) {
      console.error('❌ Error reproduciendo canción:', err);
      if (err.name === 'NotAllowedError') {
        error.value = 'Haz clic en "Iniciar Radio" para comenzar la reproducción';
      } else {
        error.value = 'Error al reproducir la canción';
      }
      isPlaying.value = false;
    }
  };

  // Cargar canciones sin reproducir automáticamente
  const cargarRadio = async () => {
    if (cancionesDisponibles.value.length === 0) {
      await cargarCancionesDisponibles();
    }
  };

  // Iniciar radio
  const iniciarRadio = async () => {
    if (cancionesDisponibles.value.length === 0) {
      await cargarCancionesDisponibles();
    }
    
    if (!cancionActual.value) {
      const cancion = seleccionarCancionAleatoria();
      if (cancion) {
        await reproducirCancion(cancion);
      }
    } else {
      togglePlay();
    }
  };

  // Pausar/Reanudar
  const togglePlay = () => {
    if (!audio.value) return;
    
    if (isPlaying.value) {
      audio.value.pause();
      isPlaying.value = false;
    } else {
      audio.value.play();
      isPlaying.value = true;
    }
  };

  // Siguiente canción automática
  const siguienteCancionAutomatica = async () => {
    // Registrar reproducción si se escuchó más de 30 segundos
    if (cancionActual.value && tiempoActual.value > 30) {
      await registrarReproduccion(cancionActual.value.id, tiempoActual.value);
    }

    // Reproducir siguiente canción
    const nextCancion = siguienteCancion.value || seleccionarCancionAleatoria();
    if (nextCancion) {
      await reproducirCancion(nextCancion);
    }
  };

  // Saltar a siguiente canción manualmente
  const saltarCancion = async () => {
    await siguienteCancionAutomatica();
  };

  // Cambiar volumen
  const cambiarVolumen = (nuevoVolumen: number) => {
    volumen.value = Math.max(0, Math.min(1, nuevoVolumen));
    if (audio.value) {
      audio.value.volume = volumen.value;
    }
  };

  // Formatear tiempo
  const formatearTiempo = (segundos: number): string => {
    const minutos = Math.floor(segundos / 60);
    const seg = Math.floor(segundos % 60);
    return `${minutos}:${seg.toString().padStart(2, '0')}`;
  };

  // Computed para progreso
  const progreso = computed(() => {
    if (duracionTotal.value === 0) return 0;
    return (tiempoActual.value / duracionTotal.value) * 100;
  });

  // Computed para tiempo restante
  const tiempoRestante = computed(() => {
    return duracionTotal.value - tiempoActual.value;
  });

  // Watch para cambios de volumen
  watch(volumen, (nuevoVolumen) => {
    if (audio.value) {
      audio.value.volume = nuevoVolumen;
    }
  });

  // Cleanup al desmontar
  const detenerRadio = () => {
    if (audio.value) {
      audio.value.pause();
      audio.value = null;
    }
    isPlaying.value = false;
    cancionActual.value = null;
    tiempoActual.value = 0;
    duracionTotal.value = 0;
  };

  return {
    // State
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
    
    // Actions
    cargarCancionesDisponibles,
    cargarRadio,
    iniciarRadio,
    togglePlay,
    saltarCancion,
    cambiarVolumen,
    detenerRadio,
    formatearTiempo,
    
    // Computed
    progreso,
    tiempoRestante
  };
};
