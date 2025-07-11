import { ref } from 'vue';
import { supabase } from '../supabase';

export const useReproducciones = () => {
  const loading = ref(false);
  const error = ref<string | null>(null);

  const registrarReproduccion = async (cancionId: number, userId: number | null = null, duracionReproducida: number = 0) => {
    loading.value = true;
    error.value = null;

    try {
      console.log('Registrando reproducción para canción:', cancionId);

      // Verificar si la canción existe
      const { data: cancion, error: cancionError } = await supabase
        .from('canciones')
        .select('id, title, artist')
        .eq('id', cancionId)
        .single();

      if (cancionError || !cancion) {
        throw new Error('Canción no encontrada');
      }

      // Registrar la reproducción
      const { error: insertError } = await supabase
        .from('reproducciones')
        .insert({
          user_id: userId, // Puede ser null si no hay usuario logueado
          cancion_id: cancionId,
          played_at: new Date().toISOString(),
          duration_played: Math.floor(duracionReproducida) // Convertir a entero
        });

      if (insertError) {
        throw insertError;
      }

      console.log('✅ Reproducción registrada exitosamente');
      return true;

    } catch (err: any) {
      console.error('❌ Error registrando reproducción:', err);
      error.value = err.message || 'Error al registrar reproducción';
      return false;
    } finally {
      loading.value = false;
    }
  };

  const obtenerReproduccionesCancion = async (cancionId: number) => {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: fetchError } = await supabase
        .from('reproducciones')
        .select('*')
        .eq('cancion_id', cancionId)
        .order('played_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      return data || [];

    } catch (err: any) {
      console.error('❌ Error obteniendo reproducciones:', err);
      error.value = err.message || 'Error al obtener reproducciones';
      return [];
    } finally {
      loading.value = false;
    }
  };

  const obtenerEstadisticasReproduccion = async (cancionId: number) => {
    loading.value = true;
    error.value = null;

    try {
      const { count, error: countError } = await supabase
        .from('reproducciones')
        .select('*', { count: 'exact', head: true })
        .eq('cancion_id', cancionId);

      if (countError) {
        throw countError;
      }

      return {
        totalReproducciones: count || 0
      };

    } catch (err: any) {
      console.error('❌ Error obteniendo estadísticas:', err);
      error.value = err.message || 'Error al obtener estadísticas';
      return { totalReproducciones: 0 };
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    error,
    registrarReproduccion,
    obtenerReproduccionesCancion,
    obtenerEstadisticasReproduccion
  };
};
