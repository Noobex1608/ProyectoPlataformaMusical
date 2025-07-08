import { useState, useRef, useEffect } from 'react';
import { useArtistaData } from '../hooks/useArtistaData';
import ProfileImage from './ProfileImage';
import { supabase } from '../supabase';
import '../styles/PerfilArtista.css';

const PerfilArtistaForm = () => {
  const { artistaData, loading, error, updateUsuario, updateArtista, uploadImage } = useArtistaData();
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Debug de conexión a Supabase al cargar el componente
  useEffect(() => {
    console.log('🔍 PerfilArtistaForm - Verificando conexión a Supabase...');
    const testConnection = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        console.log('✅ Supabase session:', data);
        if (error) console.error('❌ Supabase session error:', error);
      } catch (err) {
        console.error('❌ Supabase connection error:', err);
      }
    };
    testConnection();
  }, []);

  // Estados para el formulario
  const [formData, setFormData] = useState({
    // Datos del usuario
    name: '',
    age: '',
    description: '',
    image_url: '',
    // Datos del artista
    nombre: '',
    genero: '',
    pais: '',
    descripcion: ''
  });

  // Inicializar formulario cuando se cargan los datos
  useEffect(() => {
    if (artistaData) {
      setFormData({
        name: artistaData.usuario.name || '',
        age: artistaData.usuario.age?.toString() || '',
        description: artistaData.usuario.description || '',
        image_url: artistaData.usuario.image_url || artistaData.artista.imagen || '',
        nombre: artistaData.artista.nombre || '',
        genero: artistaData.artista.genero || '',
        pais: artistaData.artista.pais || '',
        descripcion: artistaData.artista.descripcion || ''
      });
    }
  }, [artistaData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen debe ser menor a 5MB');
      return;
    }

    try {
      setUploading(true);
      const imageUrl = await uploadImage(file);
      setFormData(prev => ({
        ...prev,
        image_url: imageUrl
      }));
      console.log('✅ Imagen subida exitosamente:', imageUrl);
    } catch (err: any) {
      console.error('❌ Error subiendo imagen:', err);
      alert('Error al subir la imagen: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artistaData) return;

    try {
      setSaving(true);
      console.log('🚀 Iniciando guardado del perfil...');
      console.log('📋 Datos del formulario:', formData);

      // Preparar datos del usuario
      const usuarioData = {
        name: formData.name,
        age: formData.age ? parseInt(formData.age) : null,
        description: formData.description || null,
        image_url: formData.image_url || null
      };

      console.log('👤 Datos del usuario a actualizar:', usuarioData);

      // Actualizar datos del usuario
      await updateUsuario(usuarioData);

      // Preparar datos del artista
      const artistaDataToUpdate = {
        nombre: formData.nombre,
        genero: formData.genero || null,
        pais: formData.pais || null,
        descripcion: formData.descripcion || null,
        imagen: formData.image_url || null
      };

      console.log('🎤 Datos del artista a actualizar:', artistaDataToUpdate);

      // Actualizar datos del artista
      await updateArtista(artistaDataToUpdate);

      setIsEditing(false);
      console.log('✅ Perfil actualizado exitosamente');
      alert('✅ Perfil actualizado exitosamente');

    } catch (err: any) {
      console.error('❌ Error guardando perfil:', err);
      alert('Error al guardar: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (artistaData) {
      setFormData({
        name: artistaData.usuario.name || '',
        age: artistaData.usuario.age?.toString() || '',
        description: artistaData.usuario.description || '',
        image_url: artistaData.usuario.image_url || artistaData.artista.imagen || '',
        nombre: artistaData.artista.nombre || '',
        genero: artistaData.artista.genero || '',
        pais: artistaData.artista.pais || '',
        descripcion: artistaData.artista.descripcion || ''
      });
    }
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="perfil-loading">
        <h2>🔄 Cargando perfil del artista...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="perfil-error">
        <h2>❌ Error cargando perfil</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!artistaData) {
    return (
      <div className="perfil-error">
        <h2>❌ No se encontraron datos del artista</h2>
      </div>
    );
  }

  return (
    <div className="perfil-artista-container">
      {/* Header del perfil - siempre visible */}
      <div className="perfil-card">
        <div className="perfil-header">
          <ProfileImage 
            imageUrl={formData.image_url || artistaData.artista.imagen}
            size={120}
            name={artistaData.artista.nombre || artistaData.usuario.name}
          />

          <div className="perfil-info">
            <h1 className="artista-name">{artistaData.artista.nombre || artistaData.usuario.name}</h1>
            <p className="artista-genre">{artistaData.artista.genero || 'Género no especificado'}</p>
            {artistaData.artista.pais && (
              <p className="artista-country">📍 {artistaData.artista.pais}</p>
            )}
            {artistaData.artista.descripcion && (
              <p className="artista-description">{artistaData.artista.descripcion}</p>
            )}
          </div>

          <div className="perfil-actions">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="btn-edit"
              >
                ✏️ Modificar Perfil
              </button>
            ) : (
              <div className="edit-buttons">
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="btn-save"
                >
                  {saving ? '⏳ Guardando...' : '� Guardar'}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="btn-cancel"
                >
                  ❌ Cancelar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Formulario de edición - solo visible cuando isEditing es true */}
      {isEditing && (
        <div className="perfil-edit-form">
          <h2>🔧 Editar Información del Perfil</h2>
          
          <form onSubmit={handleSubmit} className="perfil-form">
            {/* Sección de imagen */}
            <div className="form-section">
              <h3>📷 Foto de Perfil</h3>
              <div className="image-upload-section">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="btn-upload-image"
                >
                  {uploading ? '⏳ Subiendo...' : '📷 Cambiar Foto'}
                </button>
                {uploading && <p className="upload-status">Subiendo imagen...</p>}
              </div>
            </div>

            <div className="form-sections">
              {/* Información Personal */}
              <div className="form-section">
                <h3>👤 Información Personal</h3>
                
                <div className="form-group">
                  <label htmlFor="name">Nombre Completo:</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="age">Edad:</label>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    min="13"
                    max="120"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description">Descripción Personal:</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Cuéntanos sobre ti..."
                  />
                </div>
              </div>

              {/* Información del Artista */}
              <div className="form-section">
                <h3>🎤 Información del Artista</h3>
                
                <div className="form-group">
                  <label htmlFor="nombre">Nombre Artístico:</label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="genero">Género Musical:</label>
                  <select
                    id="genero"
                    name="genero"
                    value={formData.genero}
                    onChange={handleInputChange}
                  >
                    <option value="">Seleccionar género</option>
                    <option value="Rock">Rock</option>
                    <option value="Pop">Pop</option>
                    <option value="Hip Hop">Hip Hop</option>
                    <option value="Reggaeton">Reggaeton</option>
                    <option value="Jazz">Jazz</option>
                    <option value="Blues">Blues</option>
                    <option value="Electronic">Electronic</option>
                    <option value="Folk">Folk</option>
                    <option value="Country">Country</option>
                    <option value="R&B">R&B</option>
                    <option value="Classical">Classical</option>
                    <option value="Latin">Latin</option>
                    <option value="Other">Otro</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="pais">País de Origen:</label>
                  <input
                    type="text"
                    id="pais"
                    name="pais"
                    value={formData.pais}
                    onChange={handleInputChange}
                    placeholder="Ej: Ecuador, Colombia, etc."
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="descripcion">Descripción Artística:</label>
                  <textarea
                    id="descripcion"
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Describe tu estilo musical, influencias, trayectoria..."
                  />
                </div>
              </div>

              {/* Información de la Cuenta */}
              <div className="form-section">
                <h3>📧 Información de la Cuenta</h3>
                
                <div className="form-group">
                  <label>Email:</label>
                  <p className="form-value readonly">{artistaData.usuario.email}</p>
                  <small>El email no se puede modificar</small>
                </div>

                <div className="form-group">
                  <label>Tipo de cuenta:</label>
                  <p className="form-value readonly">
                    {artistaData.usuario.type === 'artist' ? '🎤 Artista' : artistaData.usuario.type}
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default PerfilArtistaForm;
