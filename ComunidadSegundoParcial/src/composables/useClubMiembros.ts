import { ref } from 'vue';
import { supabase } from '../supabase';

export interface MiembroClub {
  id: number;
  club_id: number;
  user_id: number;
  joined_at: string;
  role: 'member' | 'moderator' | 'admin';
  usuario?: {
    id: number;
    name: string;
    image_url?: string;
  };
  online?: boolean;
}

export function useClubMiembros() {
  const loading = ref(false);
  const error = ref<string | null>(null);

  const obtenerMiembrosClub = async (clubId: number): Promise<MiembroClub[]> => {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: supabaseError } = await supabase
        .from('club_fans_miembros')
        .select(`
          *,
          usuarios:user_id (
            id,
            name,
            image_url
          )
        `)
        .eq('club_id', clubId)
        .order('joined_at', { ascending: false });

      if (supabaseError) {
        throw supabaseError;
      }

      // Agregar estado online simulado (en producción esto vendría de presencia en tiempo real)
      const miembrosConEstado = (data || []).map(miembro => ({
        ...miembro,
        usuario: miembro.usuarios,
        online: Math.random() > 0.5 // Simulamos estado online aleatorio
      }));

      return miembrosConEstado;
    } catch (err: any) {
      console.error('Error obteniendo miembros del club:', err);
      error.value = err.message;
      return [];
    } finally {
      loading.value = false;
    }
  };

  const unirseAlClub = async (clubId: number, userId: number): Promise<MiembroClub | null> => {
    loading.value = true;
    error.value = null;

    try {
      // Verificar si ya es miembro
      const { data: existingMember } = await supabase
        .from('club_fans_miembros')
        .select('id')
        .eq('club_id', clubId)
        .eq('user_id', userId)
        .single();

      if (existingMember) {
        throw new Error('Ya eres miembro de este club');
      }

      // Crear nueva membresía
      const { data, error: supabaseError } = await supabase
        .from('club_fans_miembros')
        .insert([{
          club_id: clubId,
          user_id: userId,
          role: 'member'
        }])
        .select(`
          *,
          usuarios:user_id (
            id,
            name,
            image_url
          )
        `)
        .single();

      if (supabaseError) {
        // Si el error es porque ya existe, lo manejamos
        if (supabaseError.code === '23505') {
          throw new Error('Ya eres miembro de este club');
        }
        throw supabaseError;
      }

      return {
        ...data,
        usuario: data.usuarios,
        online: true
      };
    } catch (err: any) {
      console.error('Error uniéndose al club:', err);
      error.value = err.message;
      return null;
    } finally {
      loading.value = false;
    }
  };

  const salirDelClub = async (clubId: number, userId: number): Promise<boolean> => {
    loading.value = true;
    error.value = null;

    try {
      const { error: supabaseError } = await supabase
        .from('club_fans_miembros')
        .delete()
        .eq('club_id', clubId)
        .eq('user_id', userId);

      if (supabaseError) {
        throw supabaseError;
      }

      return true;
    } catch (err: any) {
      console.error('Error saliendo del club:', err);
      error.value = err.message;
      return false;
    } finally {
      loading.value = false;
    }
  };

  const contarMiembros = async (clubId: number): Promise<number> => {
    try {
      const { count, error: supabaseError } = await supabase
        .from('club_fans_miembros')
        .select('*', { count: 'exact', head: true })
        .eq('club_id', clubId);

      if (supabaseError) {
        throw supabaseError;
      }

      return count || 0;
    } catch (err: any) {
      console.error('Error contando miembros:', err);
      return 0;
    }
  };

  return {
    loading,
    error,
    obtenerMiembrosClub,
    unirseAlClub,
    salirDelClub,
    contarMiembros
  };
}
