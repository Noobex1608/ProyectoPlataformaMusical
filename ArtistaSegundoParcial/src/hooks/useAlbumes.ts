import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';
import { useArtistaActual } from './useArtistaActual';

export interface Album {
  id: number;
  artista_id: string;
  titulo: string;
  cover_url: string | null;
  release_date: number | null;
  created_at: string;
  updated_at: string;
  canciones?: AlbumCancion[];
  cancionesVinculadas?: CancionVinculada[];
}

export interface AlbumCancion {
  id: number;
  album_id: number;
  cancion_name: string;
  orden: number;
  imagen_url: string | null;
  colaboradores: string | null;
  created_at: string;
}

export interface CancionDisponible {
  id: number;
  title: string;
  imagen_url: string | null;
  audio_data: string | null;
}

export interface CancionVinculada {
  id: number;
  title: string;
  artist: string;
  duration: number;
  genre: string | null;
  imagen_url: string | null;
  audio_data: string | null;
}

export const useAlbumes = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { artista } = useArtistaActual();

  useEffect(() => {
    if (artista?.id) {
      cargarAlbumes();
    }
  }, [artista?.id]);

  const cargarAlbumes = useCallback(async () => {
    if (!artista?.id) return;

    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Cargando álbumes para artista:', artista.id);

      const { data, error } = await supabase
        .from('albumes')
        .select(`
          *,
          album_canciones (*),
          canciones (
            id,
            title,
            artist,
            duration,
            genre,
            imagen_url,
            audio_data
          )
        `)
        .eq('artista_id', artista.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Mapear los datos para que coincidan con la interfaz Album
      const albumesFormateados = data?.map(album => ({
        ...album,
        canciones: album.album_canciones || [], // Canciones de la tabla album_canciones
        cancionesVinculadas: album.canciones || [] // Canciones de la tabla canciones
      })) || [];

      console.log('✅ Álbumes cargados:', albumesFormateados);
      setAlbums(albumesFormateados);
    } catch (err: any) {
      console.error('❌ Error cargando álbumes:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [artista?.id]);

  const crearAlbum = useCallback(async (albumData: {
    titulo: string;
    cover_url?: string;
    release_date?: number;
  }) => {
    if (!artista?.id) {
      throw new Error('No se encontró el artista actual');
    }

    if (saving) {
      console.log('⏳ Ya se está guardando un álbum, esperando...');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      console.log('📝 Creando nuevo álbum:', albumData);

      const { data, error } = await supabase
        .from('albumes')
        .insert([{
          artista_id: artista.id,
          titulo: albumData.titulo,
          cover_url: albumData.cover_url || null,
          release_date: albumData.release_date || Date.now()
        }])
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Álbum creado:', data);
      
      // Agregar el nuevo álbum a la lista existente
      setAlbums(prev => [data, ...prev]);
      
      return data;
    } catch (err: any) {
      console.error('❌ Error creando álbum:', err);
      setError(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [artista?.id, saving, cargarAlbumes]);

  const actualizarAlbum = async (id: number, updates: Partial<Album>) => {
    try {
      console.log('📝 Actualizando álbum:', id, updates);

      const { data, error } = await supabase
        .from('albumes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Álbum actualizado:', data);
      await cargarAlbumes(); // Recargar lista
      return data;
    } catch (err: any) {
      console.error('❌ Error actualizando álbum:', err);
      throw err;
    }
  };

  const eliminarAlbum = async (id: number) => {
    try {
      console.log('🗑️ Eliminando álbum:', id);

      const { error } = await supabase
        .from('albumes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      console.log('✅ Álbum eliminado');
      await cargarAlbumes(); // Recargar lista
    } catch (err: any) {
      console.error('❌ Error eliminando álbum:', err);
      throw err;
    }
  };

  const vincularCancionesAlAlbum = async (albumId: number, cancionesNames: string[]) => {
    try {
      console.log('🔗 Vinculando canciones al álbum:', albumId, cancionesNames);
      
      if (!artista?.id) {
        throw new Error('No se encontró el artista actual');
      }
      
      // Actualizar la tabla canciones para vincular con el album_id
      for (const cancionName of cancionesNames) {
        const { error } = await supabase
          .from('canciones')
          .update({ album_id: albumId })
          .eq('title', cancionName)
          .eq('artista_id', artista.id);
          
        if (error) {
          console.error('Error vinculando canción:', cancionName, error);
          throw error;
        }
      }
      
      // Recargar albums para actualizar el conteo
      await cargarAlbumes();
      
      console.log('✅ Canciones vinculadas exitosamente');
    } catch (error) {
      console.error('❌ Error vinculando canciones:', error);
      throw error;
    }
  };

  const subirImagenAlbum = async (file: File): Promise<string> => {
    try {
      console.log('📤 Subiendo imagen de álbum:', file.name);

      const fileExt = file.name.split('.').pop();
      const fileName = `album-${Date.now()}.${fileExt}`;
      const filePath = `albums/${fileName}`;

      const { data, error } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(data.path);

      console.log('✅ Imagen de álbum subida:', publicUrl);
      return publicUrl;
    } catch (err: any) {
      console.error('❌ Error subiendo imagen:', err);
      throw err;
    }
  };

  const obtenerCancionesDisponibles = useCallback(async (): Promise<CancionDisponible[]> => {
    if (!artista?.id) return [];

    try {
      console.log('🔍 Obteniendo canciones disponibles para artista:', artista.id);

      const { data, error } = await supabase
        .from('canciones')
        .select('id, title, imagen_url, audio_data')
        .eq('artista_id', artista.id)
        .order('title');

      if (error) throw error;

      console.log('✅ Canciones disponibles:', data);
      return data || [];
    } catch (err: any) {
      console.error('❌ Error obteniendo canciones:', err);
      return [];
    }
  }, [artista?.id]);

  const agregarCancionAlAlbum = async (albumId: number, cancionNombre: string, orden: number) => {
    try {
      console.log('➕ Agregando canción al álbum:', { albumId, cancionNombre, orden });

      const { data, error } = await supabase
        .from('album_canciones')
        .insert([{
          album_id: albumId,
          cancion_name: cancionNombre,
          orden: orden
        }])
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Canción agregada al álbum:', data);
      await cargarAlbumes(); // Recargar lista
      return data;
    } catch (err: any) {
      console.error('❌ Error agregando canción al álbum:', err);
      throw err;
    }
  };

  const removerCancionDelAlbum = async (albumCancionId: number) => {
    try {
      console.log('➖ Removiendo canción del álbum:', albumCancionId);

      const { error } = await supabase
        .from('album_canciones')
        .delete()
        .eq('id', albumCancionId);

      if (error) throw error;

      console.log('✅ Canción removida del álbum');
      await cargarAlbumes(); // Recargar lista
    } catch (err: any) {
      console.error('❌ Error removiendo canción del álbum:', err);
      throw err;
    }
  };

  return {
    albums,
    loading,
    saving,
    error,
    crearAlbum,
    actualizarAlbum,
    eliminarAlbum,
    vincularCancionesAlAlbum,
    subirImagenAlbum,
    obtenerCancionesDisponibles,
    agregarCancionAlAlbum,
    removerCancionDelAlbum,
    refetch: cargarAlbumes
  };
};
