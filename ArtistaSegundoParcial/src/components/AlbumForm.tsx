import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useAlbumes, type Album, type CancionDisponible } from '../hooks/useAlbumes';
import { useArtistaActual } from '../hooks/useArtistaActual';

interface Props {
  onSave: () => void;
  onCancel: () => void;
  albumToEdit?: Album;
}

const AlbumForm: React.FC<Props> = ({ onSave, onCancel, albumToEdit }) => {
  const [titulo, setTitulo] = useState('');
  const [imagen, setImagen] = useState<File | null>(null);
  const [imagenPreview, setImagenPreview] = useState<string | null>(null);
  const [cancionesSeleccionadas, setCancionesSeleccionadas] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const { crearAlbum, actualizarAlbum, obtenerCancionesDisponibles, vincularCancionesAlAlbum } = useAlbumes();
  const { artista } = useArtistaActual();
  const [cancionesDisponibles, setCancionesDisponibles] = useState<CancionDisponible[]>([]);

  useEffect(() => {
    if (albumToEdit) {
      setTitulo(albumToEdit.titulo);
      setImagenPreview(albumToEdit.cover_url);
      // Cargar canciones del álbum si las hay
      if (albumToEdit.canciones) {
        setCancionesSeleccionadas(albumToEdit.canciones.map(c => c.cancion_name));
      }
    }
  }, [albumToEdit]);

  useEffect(() => {
    const cargarCanciones = async () => {
      try {
        const canciones = await obtenerCancionesDisponibles();
        setCancionesDisponibles(canciones);
      } catch (error) {
        console.error('Error cargando canciones:', error);
      }
    };

    cargarCanciones();
  }, [obtenerCancionesDisponibles]);

  const subirImagen = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `album-${Date.now()}.${fileExt}`;
    const filePath = `albums/${fileName}`;

    console.log('📤 Subiendo imagen de álbum:', filePath);

    const { error } = await supabase.storage
      .from('images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('❌ Error subiendo imagen:', error);
      throw error;
    }

    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    console.log('✅ Imagen subida exitosamente:', publicUrl);
    return publicUrl;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagen(file);
      
      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagenPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!titulo.trim()) {
      alert('El título es obligatorio');
      return;
    }

    if (!artista?.id) {
      alert('Error: No se pudo identificar el artista');
      return;
    }

    setLoading(true);
    
    try {
      let imageUrl: string | undefined;
      
      // Subir imagen si hay una nueva
      if (imagen) {
        setUploadingImage(true);
        imageUrl = await subirImagen(imagen);
      }
      
      let albumId: number;
      
      if (albumToEdit) {
        await actualizarAlbum(albumToEdit.id, {
          titulo: titulo.trim(),
          cover_url: imageUrl || albumToEdit.cover_url
        });
        albumId = albumToEdit.id;
      } else {
        const nuevoAlbum = await crearAlbum({
          titulo: titulo.trim(),
          cover_url: imageUrl
        });
        albumId = nuevoAlbum.id;
      }
      
      // Actualizar las canciones seleccionadas con el album_id
      if (cancionesSeleccionadas.length > 0) {
        await vincularCancionesAlAlbum(albumId, cancionesSeleccionadas);
      }
      
      onSave();
    } catch (error) {
      console.error('Error guardando álbum:', error);
      alert('Error guardando álbum');
    } finally {
      setLoading(false);
      setUploadingImage(false);
    }
  };

  const handleCancionToggle = (cancionName: string) => {
    setCancionesSeleccionadas(prev => 
      prev.includes(cancionName) 
        ? prev.filter(c => c !== cancionName)
        : [...prev, cancionName]
    );
  };

  return (
    <div style={{ 
      background: '#1a1a1a', 
      padding: '2rem', 
      borderRadius: '12px',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      <h3 style={{ color: '#348e91', marginBottom: '1.5rem' }}>
        {albumToEdit ? '✏️ Editar Álbum' : '➕ Crear Nuevo Álbum'}
      </h3>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <label style={{ color: '#fff', display: 'block', marginBottom: '0.5rem' }}>
            Título del Álbum *
          </label>
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ingresa el título del álbum"
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '6px',
              border: '1px solid #333',
              background: '#2a2a2a',
              color: '#fff',
              fontSize: '1rem'
            }}
            required
            disabled={loading}
          />
        </div>

        <div>
          <label style={{ color: '#fff', display: 'block', marginBottom: '0.5rem' }}>
            Imagen de Portada
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '6px',
              border: '1px solid #333',
              background: '#2a2a2a',
              color: '#fff',
              fontSize: '1rem'
            }}
            disabled={loading}
          />
          {imagenPreview && (
            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <img
                src={imagenPreview}
                alt="Preview"
                style={{
                  maxWidth: '200px',
                  maxHeight: '200px',
                  borderRadius: '8px',
                  objectFit: 'cover'
                }}
              />
            </div>
          )}
        </div>

        <div>
          <label style={{ color: '#fff', display: 'block', marginBottom: '0.5rem' }}>
            Canciones del Álbum (opcional)
          </label>
          <div style={{ 
            border: '1px solid #333',
            borderRadius: '6px',
            background: '#2a2a2a',
            padding: '1rem',
            maxHeight: '200px',
            overflowY: 'auto'
          }}>
            {cancionesDisponibles.length === 0 ? (
              <p style={{ color: '#888', margin: 0 }}>
                No hay canciones disponibles. Crea algunas canciones primero.
              </p>
            ) : (
              cancionesDisponibles.map(cancion => (
                <div key={cancion.id} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  marginBottom: '0.5rem'
                }}>
                  <input
                    type="checkbox"
                    id={`cancion-${cancion.id}`}
                    checked={cancionesSeleccionadas.includes(cancion.title)}
                    onChange={() => handleCancionToggle(cancion.title)}
                    disabled={loading}
                  />
                  <label 
                    htmlFor={`cancion-${cancion.id}`}
                    style={{ color: '#fff', cursor: 'pointer' }}
                  >
                    {cancion.title}
                  </label>
                </div>
              ))
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '6px',
              border: '1px solid #666',
              background: '#333',
              color: '#fff',
              cursor: 'pointer'
            }}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '6px',
              border: 'none',
              background: loading ? '#666' : '#348e91',
              color: '#fff',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
            disabled={loading}
          >
            {loading ? (
              uploadingImage ? '📤 Subiendo imagen...' : '💾 Guardando...'
            ) : (
              albumToEdit ? 'Actualizar' : 'Crear Álbum'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AlbumForm;
