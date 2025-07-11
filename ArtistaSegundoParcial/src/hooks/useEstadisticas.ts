import { useState } from 'react';
import { supabase } from '../supabase';

interface EstadisticasArtista {
  likes: number;
  reproducciones: number;
  seguidores: number;
  updated_at: string;
}

interface CancionConLikes {
  id: number;
  title: string;
  artist: string;
  album?: string;
  artista_id: string;
  imagen_url?: string;
  total_likes: number;
  total_reproducciones: number;
}

interface EstadisticasDetalladas {
  estadisticas: EstadisticasArtista;
  cancionesMasGustadas: CancionConLikes[];
  cancionesMasReproducidas: CancionConLikes[];
  totalCanciones: number;
  totalAlbumes: number;
}

export const useEstadisticas = () => {
  const [estadisticas, setEstadisticas] = useState<EstadisticasArtista | null>(null);
  const [estadisticasDetalladas, setEstadisticasDetalladas] = useState<EstadisticasDetalladas | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarEstadisticas = async (artistaId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Cargando estadísticas para artista:', artistaId);

      // Obtener likes totales para este artista
      const { data: likesData, error: likesError } = await supabase
        .from('likes_canciones')
        .select(`
          cancion_id,
          canciones!inner(artista_id)
        `)
        .eq('canciones.artista_id', artistaId);

      if (likesError) {
        console.error('Error obteniendo likes:', likesError);
      }

      const totalLikes = likesData?.length || 0;
      console.log('Total likes encontrados:', totalLikes);

      // Obtener reproducciones
      const { data: reproduccionesData } = await supabase
        .from('reproducciones')
        .select(`
          cancion_id,
          canciones!inner(artista_id)
        `)
        .eq('canciones.artista_id', artistaId);

      const totalReproducciones = reproduccionesData?.length || 0;

      // Obtener seguidores
      const { count: totalSeguidores } = await supabase
        .from('seguidores')
        .select('*', { count: 'exact', head: true })
        .eq('artista_id', artistaId);

      // Obtener canciones del artista
      const { data: cancionesData } = await supabase
        .from('canciones')
        .select('id, title, artist, album, artista_id, imagen_url')
        .eq('artista_id', artistaId)
        .limit(5);

      // Calcular likes y reproducciones por cada canción
      let cancionesConLikes: CancionConLikes[] = [];
      if (cancionesData) {
        cancionesConLikes = await Promise.all(
          cancionesData.map(async (cancion) => {
            // Obtener likes de la canción
            const { count: likesCancion } = await supabase
              .from('likes_canciones')
              .select('*', { count: 'exact', head: true })
              .eq('cancion_id', cancion.id);
            
            // Obtener reproducciones de la canción
            const { count: reproduccionesCancion } = await supabase
              .from('reproducciones')
              .select('*', { count: 'exact', head: true })
              .eq('cancion_id', cancion.id);
            
            return {
              ...cancion,
              total_likes: likesCancion || 0,
              total_reproducciones: reproduccionesCancion || 0
            };
          })
        );
      }

      // Ordenar por likes descendente para canciones más gustadas
      const cancionesMasGustadas = [...cancionesConLikes].sort((a, b) => b.total_likes - a.total_likes);
      
      // Ordenar por reproducciones descendente para canciones más reproducidas
      const cancionesMasReproducidas = [...cancionesConLikes].sort((a, b) => b.total_reproducciones - a.total_reproducciones);

      // Contar total de canciones
      const { count: totalCanciones } = await supabase
        .from('canciones')
        .select('*', { count: 'exact', head: true })
        .eq('artista_id', artistaId);

      // Contar total de álbumes
      const { count: totalAlbumes } = await supabase
        .from('albumes')
        .select('*', { count: 'exact', head: true })
        .eq('artista_id', artistaId);

      // Actualizar estadísticas en perfil_artistas
      // Primero verificar si existe el registro
      const { data: existingProfile, error: selectError } = await supabase
        .from('perfil_artistas')
        .select('id')
        .eq('artista_id', artistaId)
        .single();

      if (selectError && selectError.code !== 'PGRST116') {
        console.error('Error verificando perfil existente:', selectError);
      }

      let updateError = null;
      
      if (existingProfile) {
        // Actualizar registro existente
        const { error } = await supabase
          .from('perfil_artistas')
          .update({
            likes: totalLikes,
            reproducciones: totalReproducciones,
            seguidores: totalSeguidores || 0,
            updated_at: new Date().toISOString()
          })
          .eq('artista_id', artistaId);
        updateError = error;
      } else {
        // Insertar nuevo registro
        const { error } = await supabase
          .from('perfil_artistas')
          .insert({
            artista_id: artistaId,
            likes: totalLikes,
            reproducciones: totalReproducciones,
            seguidores: totalSeguidores || 0,
            updated_at: new Date().toISOString()
          });
        updateError = error;
      }

      if (updateError) {
        console.error('Error actualizando perfil:', updateError);
      }

      // Actualizar estado
      const estadisticasActualizadas = {
        likes: totalLikes,
        reproducciones: totalReproducciones,
        seguidores: totalSeguidores || 0,
        updated_at: new Date().toISOString()
      };

      setEstadisticas(estadisticasActualizadas);

      setEstadisticasDetalladas({
        estadisticas: estadisticasActualizadas,
        cancionesMasGustadas: cancionesMasGustadas,
        cancionesMasReproducidas: cancionesMasReproducidas,
        totalCanciones: totalCanciones || 0,
        totalAlbumes: totalAlbumes || 0
      });

    } catch (error) {
      console.error('Error cargando estadísticas:', error);
      setError('Error cargando estadísticas del artista');
    } finally {
      setLoading(false);
    }
  };

  return {
    estadisticas,
    estadisticasDetalladas,
    loading,
    error,
    cargarEstadisticas
  };
};
