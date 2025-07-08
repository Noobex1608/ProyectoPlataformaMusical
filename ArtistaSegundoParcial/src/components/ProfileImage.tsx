import React, { useState } from 'react';
import styles from '../styles/ProfileImage.module.css';

interface ProfileImageProps {
  imageUrl?: string | null;
  size?: number;
  name?: string;
}

const ProfileImage: React.FC<ProfileImageProps> = ({ 
  imageUrl, 
  size = 120, 
  name = "Perfil" 
}) => {
  const [imageError, setImageError] = useState(false);
  

  // Estilos para imagen de perfil circular con dimensiones fijas
  const containerStyle: React.CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '50%', // Completamente circular
    overflow: 'hidden',
    border: '4px solid #6c5ce7',
    backgroundColor: '#f8f9fa',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px auto',
    position: 'relative',
    boxShadow: '0 4px 12px rgba(108, 92, 231, 0.3)',
    boxSizing: 'border-box',
    flexShrink: 0
  };

  const imageStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover', // Recorta la imagen para llenar el contenedor manteniendo proporciones
    objectPosition: 'center center',
    borderRadius: '0',
    margin: 0,
    padding: 0,
    border: 'none',
    display: 'block'
  };

  const placeholderStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: `${Math.max(24, size * 0.4)}px`,
    color: '#6c5ce7',
    margin: 0,
    padding: 0,
    border: 'none'
  };

  return (
    <div 
      className={styles.profileImageContainer} 
      style={containerStyle}
    >
      {imageUrl && !imageError ? (
        <img 
          src={imageUrl} 
          alt={`Foto de perfil de ${name}`}
          className={styles.profileImage}
          style={imageStyle}
          onError={() => setImageError(true)}
          onLoad={() => {}}
        />
      ) : (
        <div 
          className={styles.profileImagePlaceholder}
          style={placeholderStyle}
        >
          👤
        </div>
      )}
    </div>
  );
};

export default ProfileImage;
