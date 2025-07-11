import { ref } from 'vue';
import { supabase } from '../supabase';

export const useLikesSimple = () => {
  const loading = ref(false);
  const userId = ref(1); // TODO: Obtener del sistema de auth real

  const darLike = async (cancionId: number) => {
    loading.value = true;
    try {
      console.log('Intentando dar like a canción:', cancionId, 'por usuario:', userId.value);
      
      // Método simple: verificar primero si ya existe
      const { data: existingLike, error: selectError } = await supabase
        .from('likes_canciones')
        .select('id')
        .eq('user_id', userId.value)
        .eq('cancion_id', cancionId)
        .limit(1);

      console.log('Resultado verificación:', existingLike, selectError);

      if (selectError) {
        console.error('Error verificando like existente:', selectError);
        return false;
      }

      if (existingLike && existingLike.length > 0) {
        console.log('Ya existe like');
        return true; // Ya existe, consideramos éxito
      }

      // Insertar nuevo like
      const { data, error } = await supabase
        .from('likes_canciones')
        .insert([{
          user_id: userId.value,
          cancion_id: cancionId
        }])
        .select();

      console.log('Resultado inserción:', data, error);

      if (error) {
        console.error('Error insertando like:', error);
        return false;
      }

      console.log('Like agregado exitosamente');
      return true;
    } catch (error) {
      console.error('Error general dando like:', error);
      return false;
    } finally {
      loading.value = false;
    }
  };

  const quitarLike = async (cancionId: number) => {
    loading.value = true;
    try {
      console.log('Intentando quitar like de canción:', cancionId, 'por usuario:', userId.value);
      
      const { data, error } = await supabase
        .from('likes_canciones')
        .delete()
        .eq('user_id', userId.value)
        .eq('cancion_id', cancionId)
        .select();

      console.log('Resultado eliminación:', data, error);

      if (error) {
        console.error('Error quitando like:', error);
        return false;
      }

      console.log('Like removido exitosamente');
      return true;
    } catch (error) {
      console.error('Error general quitando like:', error);
      return false;
    } finally {
      loading.value = false;
    }
  };

  const verificarLike = async (cancionId: number): Promise<boolean> => {
    try {
      console.log('Verificando like para canción:', cancionId, 'usuario:', userId.value);
      
      const { data, error } = await supabase
        .from('likes_canciones')
        .select('id')
        .eq('user_id', userId.value)
        .eq('cancion_id', cancionId)
        .limit(1);

      console.log('Resultado verificación:', data, error);

      if (error) {
        console.error('Error verificando like:', error);
        return false;
      }

      const hasLike = data && data.length > 0;
      console.log('¿Tiene like?', hasLike);
      return hasLike;
    } catch (error) {
      console.error('Error general verificando like:', error);
      return false;
    }
  };

  const obtenerLikesCancion = async (cancionId: number): Promise<number> => {
    try {
      console.log('Obteniendo cantidad de likes para canción:', cancionId);
      
      const { count, error } = await supabase
        .from('likes_canciones')
        .select('*', { count: 'exact' })
        .eq('cancion_id', cancionId);

      console.log('Resultado conteo:', count, error);

      if (error) {
        console.error('Error obteniendo likes:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Error general obteniendo likes:', error);
      return 0;
    }
  };

  const registrarReproduccion = async (cancionId: number, duracionReproducida: number = 0) => {
    try {
      console.log('Registrando reproducción para canción:', cancionId);
      
      const { error } = await supabase
        .from('reproducciones')
        .insert({
          user_id: userId.value,
          cancion_id: cancionId,
          duration_played: Math.floor(duracionReproducida), // Convertir a entero
          played_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error registrando reproducción:', error);
      } else {
        console.log('Reproducción registrada exitosamente');
      }
    } catch (error) {
      console.error('Error general registrando reproducción:', error);
    }
  };

  return {
    loading,
    darLike,
    quitarLike,
    verificarLike,
    obtenerLikesCancion,
    registrarReproduccion
  };
};
