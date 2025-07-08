import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import type { song as Song } from '../types/cancion';
import { useCurrentArtista } from './useCurrentArtista';

export interface CancionDB {
  id: number;
  title: string;
  artist: string;
  album?: string;
  duration: number;
  genre?: string;
  release_date?: string;
  created_at: string;
  updated_at: string;
  album_id?: number;
  artista_id?: string;
  imagen_url?: string;
  audio_data?: string;
  lyrics?: string;
}

export const useCanciones = () => {
  const [canciones, setCanciones] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { artista } = useCurrentArtista();

  // Cargar canciones desde Supabase
  const cargarCanciones = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🎵 Cargando canciones desde Supabase...');
      
      const { data, error: dbError } = await supabase
        .from('canciones')
        .select('*')
        .order('created_at', { ascending: false });

      if (dbError) {
        throw new Error(`Error cargando canciones: ${dbError.message}`);
      }

      // Mapear datos de DB a formato del frontend
      const cancionesMapeadas: Song[] = (data || []).map((cancion: CancionDB) => ({
        id: cancion.id,
        title: cancion.title,
        artist: cancion.artist,
        album: cancion.album || '',
        duration: cancion.duration,
        genre: cancion.genre || '',
        releaseDate: cancion.release_date ? new Date(cancion.release_date) : undefined,
        createdAt: new Date(cancion.created_at),
        updatedAt: new Date(cancion.updated_at),
        imagenUrl: cancion.imagen_url,
        audioData: cancion.audio_data,
        lyrics: cancion.lyrics || ''
      }));

      setCanciones(cancionesMapeadas);
      console.log(`✅ ${cancionesMapeadas.length} canciones cargadas`);
      
    } catch (err: any) {
      console.error('❌ Error cargando canciones:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Crear nueva canción
  const crearCancion = async (cancion: Omit<Song, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true);
    setError(null);

    try {
      console.log('🆕 Creando nueva canción:', cancion.title);

      // Mapear datos del frontend a formato de DB
      const cancionDB = {
        title: cancion.title,
        artist: cancion.artist,
        album: cancion.album || null,
        duration: cancion.duration,
        genre: cancion.genre || null,
        release_date: cancion.releaseDate ? cancion.releaseDate.toISOString().split('T')[0] : null,
        imagen_url: cancion.imagenUrl || null,
        audio_data: cancion.audioData || null,
        lyrics: cancion.lyrics || null,
        artista_id: artista?.id || null, // Incluir ID del artista actual
      };

      const { data, error: dbError } = await supabase
        .from('canciones')
        .insert([cancionDB])
        .select()
        .single();

      if (dbError) {
        throw new Error(`Error creando canción: ${dbError.message}`);
      }

      console.log('✅ Canción creada exitosamente:', data.title);
      
      // Recargar canciones para actualizar la lista
      await cargarCanciones();
      
      return data;
    } catch (err: any) {
      console.error('❌ Error creando canción:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar canción existente
  const actualizarCancion = async (id: number, cancion: Partial<Song>) => {
    setLoading(true);
    setError(null);

    try {
      console.log('📝 Actualizando canción:', id);

      // Mapear datos del frontend a formato de DB, excluyendo campos que no deben actualizarse
      const cancionDB: Partial<CancionDB> = {};
      
      if (cancion.title !== undefined) cancionDB.title = cancion.title;
      if (cancion.artist !== undefined) cancionDB.artist = cancion.artist;
      if (cancion.album !== undefined) cancionDB.album = cancion.album || undefined;
      if (cancion.duration !== undefined) cancionDB.duration = cancion.duration;
      if (cancion.genre !== undefined) cancionDB.genre = cancion.genre || undefined;
      if (cancion.releaseDate !== undefined) {
        cancionDB.release_date = cancion.releaseDate ? cancion.releaseDate.toISOString().split('T')[0] : undefined;
      }
      if (cancion.imagenUrl !== undefined) cancionDB.imagen_url = cancion.imagenUrl || undefined;
      if (cancion.audioData !== undefined) cancionDB.audio_data = cancion.audioData || undefined;
      if (cancion.lyrics !== undefined) cancionDB.lyrics = cancion.lyrics || undefined;
      
      // Siempre actualizar timestamp
      cancionDB.updated_at = new Date().toISOString();

      const { data, error: dbError } = await supabase
        .from('canciones')
        .update(cancionDB)
        .eq('id', id)
        .select()
        .single();

      if (dbError) {
        throw new Error(`Error actualizando canción: ${dbError.message}`);
      }

      console.log('✅ Canción actualizada exitosamente');
      
      // Recargar canciones para actualizar la lista
      await cargarCanciones();
      
      return data;
    } catch (err: any) {
      console.error('❌ Error actualizando canción:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar canción
  const eliminarCancion = async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      console.log('🗑️ Eliminando canción:', id);

      const { error: dbError } = await supabase
        .from('canciones')
        .delete()
        .eq('id', id);

      if (dbError) {
        throw new Error(`Error eliminando canción: ${dbError.message}`);
      }

      console.log('✅ Canción eliminada exitosamente');
      
      // Recargar canciones para actualizar la lista
      await cargarCanciones();
      
    } catch (err: any) {
      console.error('❌ Error eliminando canción:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Subir archivo de audio a Supabase Storage
  const subirAudio = async (archivo: File): Promise<string> => {
    try {
      console.log('🎵 Subiendo archivo de audio:', archivo.name);

      // Generar nombre único para el archivo
      const timestamp = Date.now();
      const fileExt = archivo.name.split('.').pop();
      const fileName = `audio_${timestamp}.${fileExt}`;
      const filePath = `songs/${fileName}`;

      // Subir archivo al bucket 'audio'
      const { data, error: uploadError } = await supabase.storage
        .from('audio')
        .upload(filePath, archivo, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Error subiendo audio: ${uploadError.message}`);
      }

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('audio')
        .getPublicUrl(data.path);

      console.log('✅ Audio subido exitosamente:', publicUrl);
      return publicUrl;

    } catch (err: any) {
      console.error('❌ Error subiendo audio:', err);
      throw err;
    }
  };

  // Subir imagen de la canción
  const subirImagen = async (archivo: File): Promise<string> => {
    try {
      console.log('🖼️ Subiendo imagen de canción:', archivo.name);

      // Generar nombre único para el archivo
      const timestamp = Date.now();
      const fileExt = archivo.name.split('.').pop();
      const fileName = `song_${timestamp}.${fileExt}`;
      const filePath = `songs/${fileName}`;

      // Subir archivo al bucket 'images'
      const { data, error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, archivo, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Error subiendo imagen: ${uploadError.message}`);
      }

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(data.path);

      console.log('✅ Imagen subida exitosamente:', publicUrl);
      return publicUrl;

    } catch (err: any) {
      console.error('❌ Error subiendo imagen:', err);
      throw err;
    }
  };

  // Cargar canciones al montar el hook
  useEffect(() => {
    cargarCanciones();
  }, []);

  return {
    canciones,
    loading,
    error,
    cargarCanciones,
    crearCancion,
    actualizarCancion,
    eliminarCancion,
    subirAudio,
    subirImagen
  };
};
