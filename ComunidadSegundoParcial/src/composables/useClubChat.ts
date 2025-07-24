import { ref } from 'vue';
import { supabase } from '../supabase';

export interface MensajeChat {
  id: number;
  club_id: number;
  usuario_id: number;
  contenido: string;
  tipo_mensaje: 'texto' | 'imagen' | 'archivo' | 'sistema';
  mensaje_padre_id?: number | null;
  editado: boolean;
  fecha_edicion?: string | null;
  archivo_adjunto?: string | null;
  metadata: any;
  created_at: string;
  updated_at: string;
  // Datos del usuario (join)
  usuario?: {
    id: number;
    name: string;
    image_url?: string;
  };
  // Para mostrar en la UI
  usuario_nombre?: string;
  usuario_avatar?: string;
}

export interface CrearMensajeInput {
  club_id: number;
  usuario_id: number;
  contenido: string;
  tipo_mensaje?: 'texto' | 'imagen' | 'archivo' | 'sistema';
  mensaje_padre_id?: number | null;
  archivo_adjunto?: string | null;
  metadata?: any;
}

export function useClubChat() {
  const loading = ref(false);
  const error = ref<string | null>(null);

  const obtenerMensajesClub = async (clubId: number, limite: number = 50): Promise<MensajeChat[]> => {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: supabaseError } = await supabase
        .from('club_mensajes')
        .select(`
          *,
          usuarios:usuario_id (
            id,
            name,
            image_url
          )
        `)
        .eq('club_id', clubId)
        .order('created_at', { ascending: true })
        .limit(limite);

      if (supabaseError) {
        throw supabaseError;
      }

      // Formatear los datos para la UI
      const mensajesFormateados = (data || []).map(mensaje => ({
        ...mensaje,
        usuario: mensaje.usuarios,
        usuario_nombre: mensaje.usuarios?.name || 'Usuario Desconocido',
        usuario_avatar: mensaje.usuarios?.image_url
      }));

      return mensajesFormateados;
    } catch (err: any) {
      console.error('Error obteniendo mensajes del club:', err);
      error.value = err.message;
      return [];
    } finally {
      loading.value = false;
    }
  };

  const enviarMensaje = async (input: CrearMensajeInput): Promise<MensajeChat | null> => {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: supabaseError } = await supabase
        .from('club_mensajes')
        .insert([{
          club_id: input.club_id,
          usuario_id: input.usuario_id,
          contenido: input.contenido,
          tipo_mensaje: input.tipo_mensaje || 'texto',
          mensaje_padre_id: input.mensaje_padre_id || null,
          archivo_adjunto: input.archivo_adjunto || null,
          metadata: input.metadata || {}
        }])
        .select(`
          *,
          usuarios:usuario_id (
            id,
            name,
            image_url
          )
        `)
        .single();

      if (supabaseError) {
        throw supabaseError;
      }

      // Formatear para la UI
      const mensajeFormateado: MensajeChat = {
        ...data,
        usuario: data.usuarios,
        usuario_nombre: data.usuarios?.name || 'Usuario Desconocido',
        usuario_avatar: data.usuarios?.image_url
      };

      return mensajeFormateado;
    } catch (err: any) {
      console.error('Error enviando mensaje:', err);
      error.value = err.message;
      return null;
    } finally {
      loading.value = false;
    }
  };

  const editarMensaje = async (mensajeId: number, nuevoContenido: string): Promise<boolean> => {
    loading.value = true;
    error.value = null;

    try {
      const { error: supabaseError } = await supabase
        .from('club_mensajes')
        .update({
          contenido: nuevoContenido,
          editado: true,
          fecha_edicion: new Date().toISOString()
        })
        .eq('id', mensajeId);

      if (supabaseError) {
        throw supabaseError;
      }

      return true;
    } catch (err: any) {
      console.error('Error editando mensaje:', err);
      error.value = err.message;
      return false;
    } finally {
      loading.value = false;
    }
  };

  const eliminarMensaje = async (mensajeId: number): Promise<boolean> => {
    loading.value = true;
    error.value = null;

    try {
      const { error: supabaseError } = await supabase
        .from('club_mensajes')
        .delete()
        .eq('id', mensajeId);

      if (supabaseError) {
        throw supabaseError;
      }

      return true;
    } catch (err: any) {
      console.error('Error eliminando mensaje:', err);
      error.value = err.message;
      return false;
    } finally {
      loading.value = false;
    }
  };

  const contarMensajesClub = async (clubId: number): Promise<number> => {
    try {
      const { count, error: supabaseError } = await supabase
        .from('club_mensajes')
        .select('*', { count: 'exact', head: true })
        .eq('club_id', clubId);

      if (supabaseError) {
        throw supabaseError;
      }

      return count || 0;
    } catch (err: any) {
      console.error('Error contando mensajes:', err);
      return 0;
    }
  };

  const obtenerMensajesRecientes = async (clubId: number, limite: number = 10): Promise<MensajeChat[]> => {
    try {
      const { data, error: supabaseError } = await supabase
        .from('club_mensajes')
        .select(`
          *,
          usuarios:usuario_id (
            id,
            name,
            image_url
          )
        `)
        .eq('club_id', clubId)
        .order('created_at', { ascending: false })
        .limit(limite);

      if (supabaseError) {
        throw supabaseError;
      }

      // Formatear y invertir para mostrar en orden cronológico
      const mensajesFormateados = (data || [])
        .reverse()
        .map(mensaje => ({
          ...mensaje,
          usuario: mensaje.usuarios,
          usuario_nombre: mensaje.usuarios?.name || 'Usuario Desconocido',
          usuario_avatar: mensaje.usuarios?.image_url
        }));

      return mensajesFormateados;
    } catch (err: any) {
      console.error('Error obteniendo mensajes recientes:', err);
      return [];
    }
  };

  // Función para suscribirse a mensajes en tiempo real (opcional)
  const suscribirseAMensajes = (clubId: number, callback: (mensaje: MensajeChat) => void) => {
    const subscription = supabase
      .channel(`club-messages-${clubId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'club_mensajes',
        filter: `club_id=eq.${clubId}`
      }, async (payload) => {
        // Obtener datos completos del usuario para el nuevo mensaje
        const { data: usuarioData } = await supabase
          .from('usuarios')
          .select('id, name, image_url')
          .eq('id', payload.new.usuario_id)
          .single();

        const mensajeCompleto: MensajeChat = {
          ...payload.new as any,
          usuario: usuarioData,
          usuario_nombre: usuarioData?.name || 'Usuario Desconocido',
          usuario_avatar: usuarioData?.image_url
        };

        callback(mensajeCompleto);
      })
      .subscribe();

    return subscription;
  };

  return {
    loading,
    error,
    obtenerMensajesClub,
    enviarMensaje,
    editarMensaje,
    eliminarMensaje,
    contarMensajesClub,
    obtenerMensajesRecientes,
    suscribirseAMensajes
  };
}
