import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Album } from '../hooks/useAlbumes';
import { supabase } from '../supabase';

const AlbumDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarAlbum = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        console.log('🔍 Cargando álbum con ID:', id);
        
        // Cargar álbum con sus canciones
        const { data: albumData, error: albumError } = await supabase
          .from('albumes')
          .select(`
            *,
            canciones:canciones!album_id(
              id,
              title,
              duration,
              imagen_url,
              audio_data
            ),
            album_canciones:album_canciones!album_id(
              id,
              cancion_name,
              orden,
              imagen_url,
              colaboradores
            )
          `)
          .eq('id', parseInt(id))
          .single();

        if (albumError) {
          throw albumError;
        }

        if (!albumData) {
          throw new Error('Álbum no encontrado');
        }

        console.log('✅ Álbum cargado:', albumData);
        
        // Mapear los datos
        const albumFormateado: Album = {
          id: albumData.id,
          artista_id: albumData.artista_id,
          titulo: albumData.titulo,
          cover_url: albumData.cover_url,
          release_date: albumData.release_date,
          created_at: albumData.created_at,
          updated_at: albumData.updated_at,
          canciones: albumData.album_canciones || [],
          cancionesVinculadas: albumData.canciones || []
        };

        setAlbum(albumFormateado);
      } catch (err: any) {
        console.error('❌ Error cargando álbum:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    cargarAlbum();
  }, [id]);

  if (loading) {
    return (
      <div style={{ color: '#348E91', padding: '2rem', textAlign: 'center' }}>
        <p>🔄 Cargando álbum...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ color: '#fff', padding: '2rem', textAlign: 'center' }}>
        <p>❌ Error: {error}</p>
        <Link to="/albumes" style={{ color: '#1f9ea8' }}>&larr; Volver a álbumes</Link>
      </div>
    );
  }

  if (!album) {
    return (
      <div style={{ color: '#fff', padding: '2rem', textAlign: 'center' }}>
        <p>Álbum no encontrado.</p>
        <Link to="/albumes" style={{ color: '#1f9ea8' }}>&larr; Volver a álbumes</Link>
      </div>
    );
  }

  const totalCanciones = (album.canciones?.length || 0) + (album.cancionesVinculadas?.length || 0);

  return (
    <div style={{ color: '#fff', padding: '2rem', maxWidth: 800, margin: '0 auto' }}>
      <Link to="/albumes" style={{ color: '#1f9ea8', marginBottom: '1rem', display: 'inline-block' }}>&larr; Volver a álbumes</Link>
      
      {/* Header del álbum */}
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ 
          width: 180, 
          height: 180, 
          borderRadius: 12, 
          overflow: 'hidden',
          backgroundColor: '#333',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {album.cover_url ? (
            <img src={album.cover_url} alt={album.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ color: '#666', fontSize: '3rem' }}>🎵</div>
          )}
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '2.5rem', color: '#348E91', fontWeight: 800 }}>{album.titulo}</h1>
          <p style={{ color: '#b3b3b3', fontSize: '1.1rem', margin: '0.5rem 0' }}>
            {album.release_date ? new Date(album.release_date).getFullYear() : 'Sin fecha'}
          </p>
          <p style={{ color: '#888', fontSize: '1rem', margin: 0 }}>
            {totalCanciones} {totalCanciones === 1 ? 'canción' : 'canciones'}
          </p>
        </div>
      </div>

      {/* Lista de canciones */}
      <div>
        <h2 style={{ color: '#fff', marginBottom: '1rem' }}>Canciones</h2>
        
        {totalCanciones === 0 ? (
          <div style={{ 
            background: '#222', 
            borderRadius: 8, 
            padding: '2rem', 
            textAlign: 'center',
            color: '#888'
          }}>
            <p>No hay canciones en este álbum</p>
          </div>
        ) : (
          <div style={{ background: '#222', borderRadius: 8, padding: '1rem' }}>
            {/* Canciones de la tabla canciones (vinculadas) */}
            {album.cancionesVinculadas?.map((cancion, index) => (
              <div key={`vinculada-${cancion.id}`} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem', 
                padding: '0.5rem',
                borderBottom: '1px solid #333',
                marginBottom: '0.5rem'
              }}>
                <span style={{ color: '#888', minWidth: '30px' }}>{index + 1}</span>
                <div style={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: 4, 
                  backgroundColor: '#333',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}>
                  {cancion.imagen_url ? (
                    <img src={cancion.imagen_url} alt={cancion.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ color: '#666', fontSize: '1rem' }}>🎵</span>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0, color: '#fff', fontSize: '1rem' }}>{cancion.title}</h4>
                  <p style={{ margin: 0, color: '#888', fontSize: '0.9rem' }}>
                    {cancion.duration ? `${Math.floor(cancion.duration / 60)}:${(cancion.duration % 60).toString().padStart(2, '0')}` : 'Sin duración'}
                  </p>
                </div>
              </div>
            ))}
            
            {/* Canciones de album_canciones */}
            {album.canciones?.map((cancion, index) => (
              <div key={`album-${cancion.id}`} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem', 
                padding: '0.5rem',
                borderBottom: '1px solid #333',
                marginBottom: '0.5rem'
              }}>
                <span style={{ color: '#888', minWidth: '30px' }}>{(album.cancionesVinculadas?.length || 0) + index + 1}</span>
                <div style={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: 4, 
                  backgroundColor: '#333',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}>
                  {cancion.imagen_url ? (
                    <img src={cancion.imagen_url} alt={cancion.cancion_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ color: '#666', fontSize: '1rem' }}>🎵</span>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0, color: '#fff', fontSize: '1rem' }}>{cancion.cancion_name}</h4>
                  <p style={{ margin: 0, color: '#888', fontSize: '0.9rem' }}>
                    {cancion.colaboradores ? `Con: ${cancion.colaboradores}` : 'Sin colaboradores'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AlbumDetailPage;
