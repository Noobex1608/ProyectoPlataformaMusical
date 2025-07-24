import { ref } from 'vue';
import { supabase } from '../supabase';

export interface Evento {
  id: string;
  artista_id: string;
  nombre: string;
  fecha: string;
  ubicacion: string;
  descripcion?: string;
  precio?: number;
  capacidad?: number;
  created_at: string;
  updated_at: string;
}

export function useEventos() {
  const loading = ref(false);
  const error = ref<string | null>(null);

  const obtenerEventosPorArtista = async (artistaId: string): Promise<Evento[]> => {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: supabaseError } = await supabase
        .from('eventos')
        .select('*')
        .eq('artista_id', artistaId)
        .order('fecha', { ascending: true });

      if (supabaseError) {
        throw supabaseError;
      }

      return data || [];
    } catch (err: any) {
      console.error('Error obteniendo eventos:', err);
      error.value = err.message;
      return [];
    } finally {
      loading.value = false;
    }
  };

  const crearEvento = async (evento: Omit<Evento, 'id' | 'created_at' | 'updated_at'>): Promise<Evento | null> => {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: supabaseError } = await supabase
        .from('eventos')
        .insert([evento])
        .select()
        .single();

      if (supabaseError) {
        throw supabaseError;
      }

      return data;
    } catch (err: any) {
      console.error('Error creando evento:', err);
      error.value = err.message;
      return null;
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    error,
    obtenerEventosPorArtista,
    crearEvento
  };
}
