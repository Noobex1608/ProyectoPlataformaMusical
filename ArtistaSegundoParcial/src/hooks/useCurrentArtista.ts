import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

interface Artista {
  id: string;
  nombre_artistico: string;
  nombre_real?: string;
  email?: string;
  telefono?: string;
  biografia?: string;
  generos_musicales?: string[];
  redes_sociales?: any;
  imagen_url?: string;
  fecha_nacimiento?: string;
  pais?: string;
  ciudad?: string;
  token_verificacion?: string;
  created_at?: string;
  updated_at?: string;
}

export const useCurrentArtista = () => {
  const [artista, setArtista] = useState<Artista | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCurrentArtista();
  }, []);

  const loadCurrentArtista = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener todos los artistas (asumiendo que solo hay uno por ahora)
      // En una implementación real, esto se basaría en el usuario autenticado
      const { data, error } = await supabase
        .from('artistas')
        .select('*')
        .limit(1)
        .single();

      if (error) {
        throw error;
      }

      setArtista(data);
    } catch (err: any) {
      console.error('❌ Error cargando artista:', err);
      setError(err.message);
      setArtista(null);
    } finally {
      setLoading(false);
    }
  };

  return {
    artista,
    loading,
    error,
    refetch: loadCurrentArtista
  };
};
