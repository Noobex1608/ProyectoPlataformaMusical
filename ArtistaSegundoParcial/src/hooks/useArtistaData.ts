import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

interface Usuario {
  id: number;
  name: string;
  email: string;
  age: number | null;
  description: string | null;
  image_url: string | null;
  type: string;
}

interface Artista {
  id: string;
  user_id: number;
  imagen: string | null;
  nombre: string;
  genero: string | null;
  pais: string | null;
  descripcion: string | null;
}

export interface ArtistaCompleto {
  usuario: Usuario;
  artista: Artista;
}

export const useArtistaData = () => {
  const [artistaData, setArtistaData] = useState<ArtistaCompleto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArtistaData = async () => {
    try {
      console.log('🔍 useArtistaData - Iniciando fetch de datos...');
      setLoading(true);
      setError(null);

      // Debug: Verificar que Supabase esté correctamente inicializado
      console.log('🔍 Supabase client:', supabase);
      console.log('🔍 Supabase URL:', (supabase as any).supabaseUrl);
      console.log('🔍 Supabase Key:', (supabase as any).supabaseKey?.substring(0, 20) + '...');

      // Obtener usuario actual de Supabase Auth
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error('❌ Error de autenticación:', authError);
        throw new Error('No hay usuario autenticado');
      }

      console.log('✅ Usuario autenticado:', user.id);

      // Obtener datos del usuario desde la tabla usuarios
      const { data: usuario, error: usuarioError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('auth_id', user.id)
        .single();

      if (usuarioError || !usuario) {
        throw new Error('No se encontraron datos del usuario');
      }

      console.log('📊 Datos del usuario:', usuario);

      // Obtener datos del artista
      const { data: artista, error: artistaError } = await supabase
        .from('artistas')
        .select('*')
        .eq('user_id', usuario.id)
        .single();

      if (artistaError || !artista) {
        throw new Error('No se encontraron datos del artista');
      }

      console.log('🎤 Datos del artista:', artista);

      setArtistaData({
        usuario,
        artista
      });

    } catch (err: any) {
      console.error('❌ Error obteniendo datos del artista:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateUsuario = async (datosActualizados: Partial<Usuario>) => {
    if (!artistaData) return;

    try {
      const { error } = await supabase
        .from('usuarios')
        .update({
          ...datosActualizados,
          updated_at: new Date().toISOString()
        })
        .eq('id', artistaData.usuario.id);

      if (error) throw error;

      // Actualizar estado local
      setArtistaData(prev => prev ? {
        ...prev,
        usuario: { ...prev.usuario, ...datosActualizados }
      } : null);

      return true;
    } catch (err: any) {
      console.error('❌ Error actualizando usuario:', err);
      throw err;
    }
  };

  const updateArtista = async (datosActualizados: Partial<Artista>) => {
    if (!artistaData) {
      console.error('❌ No hay datos del artista para actualizar');
      return;
    }

    try {
      console.log('🔄 Iniciando actualización del artista...');
      console.log('📊 Datos a actualizar:', datosActualizados);
      console.log('🎯 ID del artista:', artistaData.artista.id);

      const updateData = {
        ...datosActualizados,
        updated_at: new Date().toISOString()
      };

      console.log('📦 Objeto completo de actualización:', updateData);

      const { data, error } = await supabase
        .from('artistas')
        .update(updateData)
        .eq('id', artistaData.artista.id)
        .select();

      if (error) {
        console.error('❌ Error de Supabase al actualizar artista:', error);
        throw error;
      }

      console.log('✅ Respuesta de Supabase después de actualizar:', data);

      // Actualizar estado local
      setArtistaData(prev => prev ? {
        ...prev,
        artista: { ...prev.artista, ...datosActualizados }
      } : null);

      console.log('✅ Estado local actualizado exitosamente');
      return true;
    } catch (err: any) {
      console.error('❌ Error actualizando artista:', err);
      throw err;
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    try {
      console.log('📤 Iniciando subida de imagen...');
      console.log('📁 Archivo:', file.name, 'Tamaño:', file.size, 'bytes', 'Tipo:', file.type);
      
      // Verificar autenticación
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('👤 Usuario autenticado:', user?.id, 'Error:', authError);
      
      if (!user) {
        throw new Error('Usuario no autenticado');
      }
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${artistaData?.usuario.id}-${Date.now()}.${fileExt}`;
      const filePath = `profile-images/${fileName}`;

      console.log('📂 Ruta del archivo:', filePath);
      console.log('🔑 ID del usuario:', artistaData?.usuario.id);

      // Verificar si el bucket existe y es accesible
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      console.log('🗂️ Buckets disponibles:', buckets, 'Error:', bucketsError);

      // Subir archivo a Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('❌ Error subiendo archivo:', uploadError);
        console.error('❌ Detalles del error:', JSON.stringify(uploadError, null, 2));
        throw uploadError;
      }

      console.log('✅ Archivo subido exitosamente:', uploadData);

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      console.log('🔗 URL pública generada:', publicUrl);

      return publicUrl;
    } catch (err: any) {
      console.error('❌ Error subiendo imagen:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchArtistaData();
  }, []);

  return {
    artistaData,
    loading,
    error,
    updateUsuario,
    updateArtista,
    uploadImage,
    refetch: fetchArtistaData
  };
};
