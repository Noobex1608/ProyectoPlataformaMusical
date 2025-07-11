import { ref } from 'vue';
import { supabase } from '../supabase';

export interface PlaylistSupabase {
  id: number;
  name: string;
  description: string | null;
  user_id: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  playlist_canciones?: { count: number }[];
}

export interface PlaylistCancion {
  id: number;
  playlist_id: number;
  cancion_id: number;
  orden: number;
  added_at: string;
  canciones?: {
    id: number;
    title: string;
    artist: string;
    album: string;
    duration: number;
    genre: string;
    imagen_url: string;
    audio_data: string;
    artista_id: string;
  };
}

export interface NuevaPlaylist {
  name: string;
  description?: string;
  is_public?: boolean;
}

export const usePlaylist = () => {
  const playlists = ref<PlaylistSupabase[]>([]);
  const playlist = ref<PlaylistSupabase | null>(null);
  const playlistCanciones = ref<PlaylistCancion[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Obtener playlist por ID
  const obtenerPlaylistPorId = async (playlistId: number) => {
    loading.value = true;
    error.value = null;
    
    try {
      const { data, error: supabaseError } = await supabase
        .from('playlists')
        .select('*')
        .eq('id', playlistId)
        .single();

      if (supabaseError) throw supabaseError;
      
      playlist.value = data;
      return data;
    } catch (err: any) {
      error.value = err.message;
      console.error('Error obteniendo playlist:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Obtener todas las playlists del usuario
  const obtenerPlaylists = async (userId: number) => {
    loading.value = true;
    error.value = null;
    
    try {
      const { data, error: supabaseError } = await supabase
        .from('playlists')
        .select(`
          *,
          playlist_canciones(count)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (supabaseError) throw supabaseError;
      
      playlists.value = data || [];
    } catch (err: any) {
      error.value = err.message;
      console.error('Error obteniendo playlists:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Crear nueva playlist
  const crearPlaylist = async (userId: number, nuevaPlaylist: NuevaPlaylist) => {
    loading.value = true;
    error.value = null;
    
    try {
      const { data, error: supabaseError } = await supabase
        .from('playlists')
        .insert([{
          name: nuevaPlaylist.name,
          description: nuevaPlaylist.description || null,
          user_id: userId,
          is_public: nuevaPlaylist.is_public || false
        }])
        .select()
        .single();

      if (supabaseError) throw supabaseError;
      
      return data;
    } catch (err: any) {
      error.value = err.message;
      console.error('Error creando playlist:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Eliminar playlist
  const eliminarPlaylist = async (id: number) => {
    loading.value = true;
    error.value = null;
    
    try {
      const { error: supabaseError } = await supabase
        .from('playlists')
        .delete()
        .eq('id', id);

      if (supabaseError) throw supabaseError;
      
    } catch (err: any) {
      error.value = err.message;
      console.error('Error eliminando playlist:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Obtener canciones de una playlist
  const obtenerCancionesPlaylist = async (playlistId: number) => {
    loading.value = true;
    error.value = null;
    
    try {
      const { data, error: supabaseError } = await supabase
        .from('playlist_canciones')
        .select(`
          *,
          canciones (
            id,
            title,
            artist,
            album,
            duration,
            genre,
            imagen_url,
            audio_data,
            artista_id
          )
        `)
        .eq('playlist_id', playlistId)
        .order('orden', { ascending: true });

      if (supabaseError) throw supabaseError;
      
      playlistCanciones.value = data || [];
      return data;
    } catch (err: any) {
      error.value = err.message;
      console.error('Error obteniendo canciones de playlist:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Agregar canción a playlist
  const agregarCancionAPlaylist = async (playlistId: number, cancionId: number) => {
    loading.value = true;
    error.value = null;
    
    try {
      // Obtener el orden siguiente
      const { data: cancionesExistentes } = await supabase
        .from('playlist_canciones')
        .select('orden')
        .eq('playlist_id', playlistId)
        .order('orden', { ascending: false })
        .limit(1);

      const siguienteOrden = cancionesExistentes && cancionesExistentes.length > 0 
        ? cancionesExistentes[0].orden + 1 
        : 1;

      const { data, error: supabaseError } = await supabase
        .from('playlist_canciones')
        .insert([{
          playlist_id: playlistId,
          cancion_id: cancionId,
          orden: siguienteOrden
        }])
        .select();

      if (supabaseError) throw supabaseError;
      
      return data;
    } catch (err: any) {
      error.value = err.message;
      console.error('Error agregando canción a playlist:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Quitar canción de playlist
  const quitarCancionDePlaylist = async (playlistId: number, cancionId: number) => {
    loading.value = true;
    error.value = null;
    
    try {
      const { error: supabaseError } = await supabase
        .from('playlist_canciones')
        .delete()
        .eq('playlist_id', playlistId)
        .eq('cancion_id', cancionId);

      if (supabaseError) throw supabaseError;
      
    } catch (err: any) {
      error.value = err.message;
      console.error('Error quitando canción de playlist:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    // State
    playlists,
    playlist,
    playlistCanciones,
    loading,
    error,
    
    // Actions
    obtenerPlaylistPorId,
    obtenerPlaylists,
    crearPlaylist,
    eliminarPlaylist,
    obtenerCancionesPlaylist,
    agregarCancionAPlaylist,
    quitarCancionDePlaylist
  };
};
