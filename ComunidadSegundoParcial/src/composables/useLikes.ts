import { ref } from 'vue';
import { supabase } from '../supabase';

export const useLikes = () => {
  const loading = ref(false);
  const userId = ref(1); // TODO: Obtener del sistema de auth real

  const darLike = async (cancionId: number) => {
    loading.value = true;
    try {
      // Usar upsert para insertar o no hacer nada si ya existe
      const { data, error } = await supabase
        .from('likes_canciones')
        .upsert({
          user_id: userId.value,
          cancion_id: cancionId
        }, {
          onConflict: 'user_id,cancion_id',
          ignoreDuplicates: true
        })
        .select();

      if (error) {
        console.error('Error detallado:', error);
        throw error;
      }

      console.log('Like procesado exitosamente:', data);
      return true;
    } catch (error) {
      console.error('Error dando like:', error);
      return false;
    } finally {
      loading.value = false;
    }
  };

  const quitarLike = async (cancionId: number) => {
    loading.value = true;
    try {
      const { error } = await supabase
        .from('likes_canciones')
        .delete()
        .eq('user_id', userId.value)
        .eq('cancion_id', cancionId);

      if (error) throw error;

      console.log('Like removido exitosamente');
      return true;
    } catch (error) {
      console.error('Error quitando like:', error);
      return false;
    } finally {
      loading.value = false;
    }
  };

  const verificarLike = async (cancionId: number): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('likes_canciones')
        .select('id')
        .eq('user_id', userId.value)
        .eq('cancion_id', cancionId)
        .limit(1);

      if (error) {
        console.error('Error verificando like:', error);
        return false;
      }

      return data && data.length > 0;
    } catch (error) {
      console.error('Error verificando like:', error);
      return false;
    }
  };

  const obtenerLikesCancion = async (cancionId: number): Promise<number> => {
    try {
      const { count } = await supabase
        .from('likes_canciones')
        .select('*', { count: 'exact' })
        .eq('cancion_id', cancionId);

      return count || 0;
    } catch (error) {
      console.error('Error obteniendo likes:', error);
      return 0;
    }
  };

  const registrarReproduccion = async (cancionId: number, duracionReproducida: number = 0) => {
    try {
      const { error } = await supabase
        .from('reproducciones')
        .insert({
          user_id: userId.value,
          cancion_id: cancionId,
          duration_played: duracionReproducida,
          played_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error registrando reproducción:', error);
      } else {
        console.log('Reproducción registrada');
      }
    } catch (error) {
      console.error('Error registrando reproducción:', error);
    }
  };

  const obtenerCancionesMasGustadas = async (limite: number = 10) => {
    try {
      const { data, error } = await supabase
        .from('canciones_populares')
        .select('*')
        .limit(limite);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error obteniendo canciones populares:', error);
      return [];
    }
  };

  return {
    loading,
    darLike,
    quitarLike,
    verificarLike,
    obtenerLikesCancion,
    registrarReproduccion,
    obtenerCancionesMasGustadas
  };
};
