import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

interface ArtistaActual {
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

export const useArtistaActual = () => {
  const [artista, setArtista] = useState<ArtistaActual | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    obtenerArtistaActual();
  }, []);

  const obtenerArtistaActual = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Obteniendo artista actual...');

      // Por ahora, usar la misma lógica del hook existente
      // Obtener el primer artista (ya que tu perfil funciona así)
      const { data: artistaData, error: artistaError } = await supabase
        .from('artistas')
        .select('*')
        .limit(1)
        .single();

      if (artistaError) {
        if (artistaError.code === 'PGRST116') {
          throw new Error('No se encontró perfil de artista');
        }
        throw new Error(`Error obteniendo datos del artista: ${artistaError.message}`);
      }

      console.log('✅ Datos del artista obtenidos:', artistaData);

      // Mapear los datos usando los campos reales de la tabla artistas
      const artistaFormateado: ArtistaActual = {
        id: artistaData.id,
        nombre_artistico: artistaData.nombre || 'Artista',
        nombre_real: artistaData.nombre || '', // Usar el mismo nombre como fallback
        email: '', // Por ahora sin email hasta implementar autenticación completa
        telefono: '',
        biografia: artistaData.descripcion || '',
        generos_musicales: artistaData.genero ? [artistaData.genero] : [],
        redes_sociales: {},
        imagen_url: artistaData.imagen || '',
        fecha_nacimiento: '',
        pais: artistaData.pais || '',
        ciudad: '',
        token_verificacion: artistaData.token_verificacion || '',
        created_at: artistaData.created_at,
        updated_at: artistaData.updated_at
      };

      setArtista(artistaFormateado);
    } catch (err: any) {
      console.error('❌ Error obteniendo artista actual:', err);
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
    refetch: obtenerArtistaActual
  };
};
