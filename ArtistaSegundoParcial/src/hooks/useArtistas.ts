import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import type { Artista } from '../types/Artista';

// Tipo para los datos tal como están en la base de datos (snake_case)
interface ArtistaDB {
  id: string;
  nombre: string;
  genero: string;
  pais: string;
  descripcion: string;
  imagen: string;
  token_verificacion?: string;
  created_at?: string;
  updated_at?: string;
}

// Función para convertir de snake_case (DB) a camelCase (Frontend)
const mapDBToFrontend = (artistaDB: ArtistaDB): Artista => {
  return {
    id: artistaDB.id,
    nombre: artistaDB.nombre,
    genero: artistaDB.genero,
    pais: artistaDB.pais,
    descripcion: artistaDB.descripcion,
    imagen: artistaDB.imagen,
    tokenVerificacion: artistaDB.token_verificacion
  };
};

// Función para convertir de camelCase (Frontend) a snake_case (DB)
const mapFrontendToDB = (artista: Partial<Artista>): Partial<ArtistaDB> => {
  const { tokenVerificacion, ...resto } = artista;
  return {
    ...resto,
    ...(tokenVerificacion !== undefined && { token_verificacion: tokenVerificacion })
  };
};

interface UseArtistasReturn {
  artistas: Artista[];
  loading: boolean;
  error: string | null;
  fetchArtistas: () => Promise<void>;
  agregarArtista: (artista: Omit<Artista, 'id'>) => Promise<Artista>;
  editarArtista: (id: string, artista: Partial<Artista>) => Promise<void>;
  eliminarArtista: (id: string) => Promise<void>;
}

export const useArtistas = (): UseArtistasReturn => {
  const [artistas, setArtistas] = useState<Artista[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArtistas = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching artistas from Supabase...');
      
      const { data, error } = await supabase
        .from('artistas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      console.log('✅ Artistas fetched:', data);
      
      // Mapear los datos de la DB al formato del frontend
      const artistasMapped = data ? data.map(mapDBToFrontend) : [];
      setArtistas(artistasMapped);
    } catch (err: any) {
      console.error('❌ Error fetching artistas:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const agregarArtista = async (artistaData: Omit<Artista, 'id'>): Promise<Artista> => {
    try {
      console.log('➕ Adding artista to Supabase...', artistaData);
      
      // Mapear los datos del frontend al formato de la DB
      const dataParaSupabase = mapFrontendToDB(artistaData);
      
      const { data, error } = await supabase
        .from('artistas')
        .insert([dataParaSupabase])
        .select()
        .single();

      if (error) {
        throw error;
      }

      console.log('✅ Artista added:', data);
      
      // Mapear el resultado de vuelta al formato del frontend
      const artistaAgregado = mapDBToFrontend(data);
      
      // Actualizar lista local
      setArtistas(prev => [artistaAgregado, ...prev]);
      
      return artistaAgregado;
    } catch (err: any) {
      console.error('❌ Error adding artista:', err);
      setError(err.message);
      throw err;
    }
  };

  const editarArtista = async (id: string, artistaData: Partial<Artista>) => {
    try {
      console.log('✏️ Editing artista in Supabase...', { id, artistaData });
      
      // Mapear los datos del frontend al formato de la DB
      const dataParaSupabase = mapFrontendToDB(artistaData);
      
      const { data, error } = await supabase
        .from('artistas')
        .update(dataParaSupabase)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      console.log('✅ Artista updated:', data);
      
      // Mapear el resultado de vuelta al formato del frontend
      const artistaActualizado = mapDBToFrontend(data);
      
      // Actualizar lista local
      setArtistas(prev => 
        prev.map(artista => 
          artista.id === id ? artistaActualizado : artista
        )
      );
    } catch (err: any) {
      console.error('❌ Error editing artista:', err);
      setError(err.message);
      throw err;
    }
  };

  const eliminarArtista = async (id: string) => {
    try {
      console.log('🗑️ Deleting artista from Supabase...', id);
      
      const { error } = await supabase
        .from('artistas')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      console.log('✅ Artista deleted');
      
      // Actualizar lista local
      setArtistas(prev => prev.filter(artista => artista.id !== id));
    } catch (err: any) {
      console.error('❌ Error deleting artista:', err);
      setError(err.message);
      throw err;
    }
  };

  // Cargar artistas al montar el componente
  useEffect(() => {
    fetchArtistas();
  }, []);

  return {
    artistas,
    loading,
    error,
    fetchArtistas,
    agregarArtista,
    editarArtista,
    eliminarArtista
  };
};
