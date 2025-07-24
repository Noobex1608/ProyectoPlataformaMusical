import { ref, computed } from 'vue';
import { supabase } from '../supabase';

export interface ClubFan {
  id: number;
  name: string;
  description: string | null;
  artista_id: string | null;
  created_at: string;
  updated_at: string;
  artistas?: {
    id: string;
    nombre: string;
    imagen?: string;
  };
}

export interface CreateClubFan {
  name: string;
  description?: string;
  artista_id: string;
}

export interface Artista {
  id: string;
  nombre: string;
  imagen?: string;
  descripcion?: string;
}

export const useClubFans = () => {
  const clubes = ref<ClubFan[]>([]);
  const artistas = ref<Artista[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const searchTerm = ref('');
  const loadingArtistas = ref(false);

  // Obtener todos los clubes de fans
  const obtenerClubes = async () => {
    loading.value = true;
    error.value = null;
    
    try {
      console.log('🏟️ Obteniendo clubes de fans...');
      
      const { data, error: supabaseError } = await supabase
        .from('club_fans')
        .select(`
          *,
          artistas (
            id,
            nombre,
            imagen
          )
        `)
        .order('created_at', { ascending: false });

      if (supabaseError) throw supabaseError;
      
      clubes.value = data || [];
      console.log('✅ Clubes obtenidos:', data?.length || 0);
    } catch (err: any) {
      console.error('❌ Error obteniendo clubes:', err);
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  // Buscar clubes por nombre o descripción
  const buscarClubes = async (termino: string = '') => {
    loading.value = true;
    error.value = null;
    
    try {
      console.log('🔍 Buscando clubes:', termino);
      
      let query = supabase
        .from('club_fans')
        .select(`
          *,
          artistas (
            id,
            nombre,
            imagen
          )
        `)
        .order('created_at', { ascending: false });

      if (termino.trim()) {
        query = query.or(`name.ilike.%${termino}%,description.ilike.%${termino}%`);
      }

      const { data, error: supabaseError } = await query.limit(50);

      if (supabaseError) throw supabaseError;
      
      clubes.value = data || [];
      console.log('✅ Clubes encontrados:', data?.length || 0);
    } catch (err: any) {
      console.error('❌ Error buscando clubes:', err);
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  // Obtener clubes por artista
  const obtenerClubesPorArtista = async (artistaId: string) => {
    loading.value = true;
    error.value = null;
    
    try {
      console.log('🎤 Obteniendo clubes del artista:', artistaId);
      
      const { data, error: supabaseError } = await supabase
        .from('club_fans')
        .select(`
          *,
          artistas (
            id,
            nombre,
            imagen
          )
        `)
        .eq('artista_id', artistaId)
        .order('created_at', { ascending: false });

      if (supabaseError) throw supabaseError;
      
      clubes.value = data || [];
      console.log('✅ Clubes del artista obtenidos:', data?.length || 0);
    } catch (err: any) {
      console.error('❌ Error obteniendo clubes del artista:', err);
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  // Crear nuevo club de fans
  const crearClub = async (nuevoClub: CreateClubFan): Promise<ClubFan | null> => {
    loading.value = true;
    error.value = null;
    
    try {
      console.log('🆕 Creando nuevo club:', nuevoClub.name);
      
      const { data, error: supabaseError } = await supabase
        .from('club_fans')
        .insert([{
          name: nuevoClub.name,
          description: nuevoClub.description || null,
          artista_id: nuevoClub.artista_id
        }])
        .select(`
          *,
          artistas (
            id,
            nombre,
            imagen
          )
        `)
        .single();

      if (supabaseError) throw supabaseError;
      
      // Agregar el nuevo club a la lista
      if (data) {
        clubes.value.unshift(data);
      }
      
      console.log('✅ Club creado exitosamente:', data.name);
      return data;
    } catch (err: any) {
      console.error('❌ Error creando club:', err);
      error.value = err.message;
      return null;
    } finally {
      loading.value = false;
    }
  };

  // Actualizar club existente
  const actualizarClub = async (id: number, datosActualizados: Partial<CreateClubFan>): Promise<ClubFan | null> => {
    loading.value = true;
    error.value = null;
    
    try {
      console.log('📝 Actualizando club:', id);
      
      const updateData: any = {};
      if (datosActualizados.name !== undefined) updateData.name = datosActualizados.name;
      if (datosActualizados.description !== undefined) updateData.description = datosActualizados.description;
      
      // Siempre actualizar timestamp
      updateData.updated_at = new Date().toISOString();

      const { data, error: supabaseError } = await supabase
        .from('club_fans')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          artistas (
            id,
            nombre,
            imagen
          )
        `)
        .single();

      if (supabaseError) throw supabaseError;
      
      // Actualizar en la lista local
      if (data) {
        const index = clubes.value.findIndex(club => club.id === id);
        if (index !== -1) {
          clubes.value[index] = data;
        }
      }
      
      console.log('✅ Club actualizado exitosamente:', data.name);
      return data;
    } catch (err: any) {
      console.error('❌ Error actualizando club:', err);
      error.value = err.message;
      return null;
    } finally {
      loading.value = false;
    }
  };

  // Eliminar club
  const eliminarClub = async (id: number): Promise<boolean> => {
    loading.value = true;
    error.value = null;
    
    try {
      console.log('🗑️ Eliminando club:', id);
      
      const { error: supabaseError } = await supabase
        .from('club_fans')
        .delete()
        .eq('id', id);

      if (supabaseError) throw supabaseError;
      
      // Remover de la lista local
      clubes.value = clubes.value.filter(club => club.id !== id);
      
      console.log('✅ Club eliminado exitosamente');
      return true;
    } catch (err: any) {
      console.error('❌ Error eliminando club:', err);
      error.value = err.message;
      return false;
    } finally {
      loading.value = false;
    }
  };

  // Obtener un club específico por ID
  const obtenerClubPorId = async (id: number): Promise<ClubFan | null> => {
    loading.value = true;
    error.value = null;
    
    try {
      console.log('🔍 Obteniendo club por ID:', id);
      
      const { data, error: supabaseError } = await supabase
        .from('club_fans')
        .select(`
          *,
          artistas (
            id,
            nombre,
            imagen
          )
        `)
        .eq('id', id)
        .single();

      if (supabaseError) {
        if (supabaseError.code === 'PGRST116') {
          return null; // Club no encontrado
        }
        throw supabaseError;
      }
      
      console.log('✅ Club obtenido:', data.name);
      return data;
    } catch (err: any) {
      console.error('❌ Error obteniendo club por ID:', err);
      error.value = err.message;
      return null;
    } finally {
      loading.value = false;
    }
  };

  // Computed properties
  const clubesFiltrados = computed(() => {
    if (!searchTerm.value.trim()) {
      return clubes.value;
    }
    
    const termino = searchTerm.value.toLowerCase();
    return clubes.value.filter(club => 
      club.name.toLowerCase().includes(termino) ||
      (club.description && club.description.toLowerCase().includes(termino))
    );
  });

  const totalClubes = computed(() => clubes.value.length);

  // Formatear fecha para mostrar
  const formatearFecha = (fecha: string): string => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Obtener todos los artistas para el selector
  const obtenerArtistas = async () => {
    loadingArtistas.value = true;
    error.value = null;
    
    try {
      console.log('🎤 Obteniendo lista de artistas...');
      
      const { data, error: supabaseError } = await supabase
        .from('artistas')
        .select('id, nombre, imagen, descripcion')
        .order('nombre', { ascending: true });

      if (supabaseError) throw supabaseError;
      
      artistas.value = data || [];
      console.log('✅ Artistas obtenidos:', data?.length || 0);
      return data || [];
    } catch (err: any) {
      console.error('❌ Error obteniendo artistas:', err);
      error.value = err.message;
      return [];
    } finally {
      loadingArtistas.value = false;
    }
  };

  // Buscar artistas por nombre (para autocompletado)
  const buscarArtistasPorNombre = async (nombre: string) => {
    if (!nombre.trim()) {
      return [];
    }
    
    try {
      console.log('🔍 Buscando artistas por nombre:', nombre);
      
      const { data, error: supabaseError } = await supabase
        .from('artistas')
        .select('id, nombre, imagen, descripcion')
        .ilike('nombre', `%${nombre}%`)
        .limit(10)
        .order('nombre', { ascending: true });

      if (supabaseError) throw supabaseError;
      
      console.log('✅ Artistas encontrados:', data?.length || 0);
      return data || [];
    } catch (err: any) {
      console.error('❌ Error buscando artistas:', err);
      return [];
    }
  };

  // Obtener artista por ID
  const obtenerArtistaPorId = async (id: string): Promise<Artista | null> => {
    try {
      console.log('🔍 Obteniendo artista por ID:', id);
      
      const { data, error: supabaseError } = await supabase
        .from('artistas')
        .select('id, nombre, imagen, descripcion')
        .eq('id', id)
        .single();

      if (supabaseError) throw supabaseError;
      
      console.log('✅ Artista encontrado:', data.nombre);
      return data;
    } catch (err: any) {
      console.error('❌ Error obteniendo artista:', err);
      return null;
    }
  };

  return {
    // Estado
    clubes,
    artistas,
    loading,
    loadingArtistas,
    error,
    searchTerm,
    
    // Computed
    clubesFiltrados,
    totalClubes,
    
    // Métodos
    obtenerClubes,
    buscarClubes,
    obtenerClubesPorArtista,
    crearClub,
    actualizarClub,
    eliminarClub,
    obtenerClubPorId,
    formatearFecha,
    
    // Métodos para artistas
    obtenerArtistas,
    buscarArtistasPorNombre,
    obtenerArtistaPorId
  };
};
