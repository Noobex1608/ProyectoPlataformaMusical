import { ref, computed } from 'vue';
import { supabase } from '../supabase';

export interface Cancion {
  id: number;
  title: string;
  artist: string;
  album: string | null;
  duration: number;
  genre: string | null;
  release_date: string | null;
  imagen_url: string | null;
  audio_data: string | null;
  artista_id: string | null;
  created_at: string;
  updated_at: string;
}

export const useCanciones = () => {
  const canciones = ref<Cancion[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const searchTerm = ref('');

  // Buscar canciones
  const buscarCanciones = async (termino: string = '') => {
    loading.value = true;
    error.value = null;
    
    try {
      let query = supabase
        .from('canciones')
        .select('*')
        .order('created_at', { ascending: false });

      if (termino.trim()) {
        query = query.or(`title.ilike.%${termino}%,artist.ilike.%${termino}%,album.ilike.%${termino}%`);
      }

      const { data, error: supabaseError } = await query.limit(50);

      if (supabaseError) throw supabaseError;
      
      canciones.value = data || [];
      console.log('✅ Canciones encontradas:', data?.length || 0);
    } catch (err: any) {
      console.error('❌ Error buscando canciones:', err);
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  // Obtener todas las canciones
  const obtenerTodasLasCanciones = async () => {
    await buscarCanciones();
  };

  // Obtener canciones por artista
  const obtenerCancionesPorArtista = async (artistaId: string) => {
    loading.value = true;
    error.value = null;
    
    try {
      const { data, error: supabaseError } = await supabase
        .from('canciones')
        .select('*')
        .eq('artista_id', artistaId)
        .order('created_at', { ascending: false });

      if (supabaseError) throw supabaseError;
      
      canciones.value = data || [];
      console.log('✅ Canciones del artista cargadas:', data?.length || 0);
    } catch (err: any) {
      console.error('❌ Error cargando canciones del artista:', err);
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  // Obtener canciones por género
  const obtenerCancionesPorGenero = async (genero: string) => {
    loading.value = true;
    error.value = null;
    
    try {
      const { data, error: supabaseError } = await supabase
        .from('canciones')
        .select('*')
        .eq('genre', genero)
        .order('created_at', { ascending: false });

      if (supabaseError) throw supabaseError;
      
      canciones.value = data || [];
      console.log('✅ Canciones del género cargadas:', data?.length || 0);
    } catch (err: any) {
      console.error('❌ Error cargando canciones del género:', err);
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  // Formatear duración
  const formatearDuracion = (segundos: number): string => {
    const minutos = Math.floor(segundos / 60);
    const seg = segundos % 60;
    return `${minutos}:${seg.toString().padStart(2, '0')}`;
  };

  // Computed para búsqueda filtrada
  const cancionesFiltradas = computed(() => {
    if (!searchTerm.value.trim()) return canciones.value;
    
    return canciones.value.filter(cancion => 
      cancion.title.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      cancion.artist.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      (cancion.album && cancion.album.toLowerCase().includes(searchTerm.value.toLowerCase()))
    );
  });

  // Computed para estadísticas
  const totalCanciones = computed(() => canciones.value.length);
  const generos = computed(() => {
    const generosSet = new Set(canciones.value.map(c => c.genre).filter(Boolean));
    return Array.from(generosSet);
  });

  return {
    // States
    canciones,
    loading,
    error,
    searchTerm,
    
    // Actions
    buscarCanciones,
    obtenerTodasLasCanciones,
    obtenerCancionesPorArtista,
    obtenerCancionesPorGenero,
    formatearDuracion,
    
    // Computed
    cancionesFiltradas,
    totalCanciones,
    generos
  };
};
