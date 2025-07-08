# 🗄️ Configuración de Base de Datos Supabase
## Plataforma Musical - RawBeats

### 📋 Resumen de Tablas Creadas

#### **Tablas Principales:**
1. **usuarios** - Gestión de usuarios (fans, artistas, admin)
2. **artistas** - Información específica de artistas
3. **perfil_artistas** - Estadísticas de artistas (reproducciones, likes, seguidores)
4. **canciones** - Biblioteca de música
5. **albumes** - Álbumes de los artistas
6. **eventos** - Eventos y conciertos
7. **playlists** - Listas de reproducción de usuarios
8. **radios** - Estaciones de radio personalizadas
9. **club_fans** - Clubes de fans por artista

#### **Tablas de Relación:**
10. **playlist_canciones** - Canciones en playlists
11. **radio_canciones** - Canciones en radios
12. **club_fans_miembros** - Miembros de clubs de fans
13. **album_canciones** - Canciones en álbumes
14. **seguidores** - Relación follower-artista
15. **likes_canciones** - Likes de usuarios a canciones
16. **reproducciones** - Historial de reproducciones

### 🚀 Instrucciones de Instalación

#### 1. Ejecutar en Supabase SQL Editor:
```sql
-- Copiar y pegar todo el contenido de supabase_schema.sql
-- en el SQL Editor de tu proyecto Supabase
```

#### 2. Verificar Creación de Tablas:
- Ve a "Table Editor" en Supabase
- Deberías ver todas las 16 tablas listadas arriba

#### 3. Configurar Autenticación:
- Habilita Email/Password en Authentication > Settings
- Configura las URLs de redirect según tus dominios

#### 4. Configurar Storage (Opcional):
```sql
-- Para imágenes de artistas, covers de álbumes, etc.
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true);

INSERT INTO storage.buckets (id, name, public) 
VALUES ('covers', 'covers', true);

INSERT INTO storage.buckets (id, name, public) 
VALUES ('audio', 'audio', false);
```

### 🔐 Configuración de Seguridad (RLS)

Las políticas de Row Level Security están incluidas en el script para:
- **usuarios**: Solo pueden ver/editar sus propios datos
- **artistas**: Solo pueden gestionar su propia información
- **canciones**: Lectura pública, escritura solo para el artista
- **playlists**: Públicas para lectura, privadas para escritura

### 📊 Campos Importantes por Tabla

#### **usuarios**
- `type`: 'artist', 'fan', 'admin'
- `email`: Único, usado para autenticación
- `image_url`: URL del avatar

#### **artistas**
- `user_id`: Referencia al usuario
- `token_verificacion`: Para verificación de artistas

#### **canciones**
- `audio_data`: Base64 o URL del archivo de audio
- `lyrics`: Letra de la canción
- `duration`: Duración en segundos

#### **albumes**
- `release_date`: Timestamp de lanzamiento
- `cover_url`: URL de la portada

### 🔄 Relaciones Principales

```
usuarios (1) ←→ (1) artistas
artistas (1) ←→ (N) canciones
artistas (1) ←→ (N) albumes
artistas (1) ←→ (N) eventos
usuarios (1) ←→ (N) playlists
usuarios (N) ←→ (N) canciones (likes)
usuarios (N) ←→ (N) artistas (seguidores)
```

### 📝 Próximos Pasos

1. **Ejecutar el script SQL** en Supabase
2. **Configurar las variables de entorno** en tus proyectos:
   ```env
   VITE_SUPABASE_URL=tu_supabase_url
   VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
   ```
3. **Probar la conexión** desde ComunidadSegundoParcial y ArtistaSegundoParcial
4. **Implementar las funciones CRUD** para cada entidad

### 🛠️ Funciones Supabase Recomendadas

Después de crear las tablas, considera crear estas funciones:

```sql
-- Función para obtener estadísticas de artista
CREATE OR REPLACE FUNCTION get_artist_stats(artist_uuid UUID)
RETURNS TABLE(
  total_songs BIGINT,
  total_albums BIGINT,
  total_plays BIGINT,
  total_likes BIGINT,
  total_followers BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM canciones WHERE artista_id = artist_uuid),
    (SELECT COUNT(*) FROM albumes WHERE artista_id = artist_uuid),
    (SELECT COALESCE(SUM(reproducciones), 0) FROM perfil_artistas WHERE artista_id = artist_uuid),
    (SELECT COALESCE(SUM(likes), 0) FROM perfil_artistas WHERE artista_id = artist_uuid),
    (SELECT COALESCE(SUM(seguidores), 0) FROM perfil_artistas WHERE artista_id = artist_uuid);
END;
$$ LANGUAGE plpgsql;
```

¡La base de datos está lista para tu plataforma musical! 🎵
