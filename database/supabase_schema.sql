-- ===============================================
-- SCRIPT SQL PARA CREAR TABLAS DE SUPABASE
-- Plataforma Musical - Base de Datos Completa
-- ===============================================

-- 1. TABLA USUARIOS (Principal)
CREATE TABLE IF NOT EXISTS usuarios (
    id BIGSERIAL PRIMARY KEY,
    auth_id UUID UNIQUE, -- ID del usuario en Supabase Auth
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    age INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    description TEXT,
    image_url TEXT,
    type VARCHAR(50) DEFAULT 'fan' CHECK (type IN ('artist', 'fan', 'admin')),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABLA ARTISTAS
CREATE TABLE IF NOT EXISTS artistas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id BIGINT REFERENCES usuarios(id) ON DELETE CASCADE,
    imagen TEXT,
    nombre VARCHAR(255) NOT NULL,
    genero VARCHAR(100),
    pais VARCHAR(100),
    descripcion TEXT,
    token_verificacion VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABLA PERFIL_ARTISTAS
CREATE TABLE IF NOT EXISTS perfil_artistas (
    id BIGSERIAL PRIMARY KEY,
    artista_id UUID REFERENCES artistas(id) ON DELETE CASCADE,
    reproducciones BIGINT DEFAULT 0,
    likes BIGINT DEFAULT 0,
    seguidores BIGINT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABLA ALBUMES
CREATE TABLE IF NOT EXISTS albumes (
    id BIGSERIAL PRIMARY KEY,
    artista_id UUID REFERENCES artistas(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    cover_url TEXT,
    release_date BIGINT, -- timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABLA CANCIONES
CREATE TABLE IF NOT EXISTS canciones (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    artist VARCHAR(255) NOT NULL,
    album VARCHAR(255),
    duration INTEGER NOT NULL, -- en segundos
    genre VARCHAR(100),
    release_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    album_id BIGINT REFERENCES albumes(id) ON DELETE SET NULL,
    artista_id UUID REFERENCES artistas(id) ON DELETE CASCADE,
    imagen_url TEXT,
    audio_data TEXT, -- base64 o URL del archivo
    lyrics TEXT
);

-- 6. TABLA EVENTOS
CREATE TABLE IF NOT EXISTS eventos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artista_id UUID REFERENCES artistas(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    fecha DATE NOT NULL,
    ubicacion VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2),
    capacidad INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. TABLA PLAYLISTS
CREATE TABLE IF NOT EXISTS playlists (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    user_id BIGINT REFERENCES usuarios(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_public BOOLEAN DEFAULT true
);

-- 8. TABLA PLAYLIST_CANCIONES (Relación muchos a muchos)
CREATE TABLE IF NOT EXISTS playlist_canciones (
    id BIGSERIAL PRIMARY KEY,
    playlist_id BIGINT REFERENCES playlists(id) ON DELETE CASCADE,
    cancion_id BIGINT REFERENCES canciones(id) ON DELETE CASCADE,
    orden INTEGER,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(playlist_id, cancion_id)
);

-- 9. TABLA RADIOS
CREATE TABLE IF NOT EXISTS radios (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    user_id BIGINT REFERENCES usuarios(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_public BOOLEAN DEFAULT true
);

-- 10. TABLA RADIO_CANCIONES (Relación muchos a muchos)
CREATE TABLE IF NOT EXISTS radio_canciones (
    id BIGSERIAL PRIMARY KEY,
    radio_id BIGINT REFERENCES radios(id) ON DELETE CASCADE,
    cancion_id BIGINT REFERENCES canciones(id) ON DELETE CASCADE,
    orden INTEGER,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(radio_id, cancion_id)
);

-- 11. TABLA CLUB_FANS
CREATE TABLE IF NOT EXISTS club_fans (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    artista_id UUID REFERENCES artistas(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. TABLA CLUB_FANS_MIEMBROS (Relación muchos a muchos)
CREATE TABLE IF NOT EXISTS club_fans_miembros (
    id BIGSERIAL PRIMARY KEY,
    club_id BIGINT REFERENCES club_fans(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES usuarios(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
    UNIQUE(club_id, user_id)
);

-- 13. TABLA ALBUM_CANCIONES (Para manejar las canciones de un álbum)
CREATE TABLE IF NOT EXISTS album_canciones (
    id BIGSERIAL PRIMARY KEY,
    album_id BIGINT REFERENCES albumes(id) ON DELETE CASCADE,
    cancion_name VARCHAR(255) NOT NULL,
    orden INTEGER,
    imagen_url TEXT,
    colaboradores TEXT, -- JSON array de colaboradores
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. TABLA SEGUIDORES (Relación muchos a muchos entre usuarios y artistas)
CREATE TABLE IF NOT EXISTS seguidores (
    id BIGSERIAL PRIMARY KEY,
    follower_id BIGINT REFERENCES usuarios(id) ON DELETE CASCADE,
    artista_id UUID REFERENCES artistas(id) ON DELETE CASCADE,
    followed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(follower_id, artista_id)
);

-- 15. TABLA LIKES_CANCIONES
CREATE TABLE IF NOT EXISTS likes_canciones (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES usuarios(id) ON DELETE CASCADE,
    cancion_id BIGINT REFERENCES canciones(id) ON DELETE CASCADE,
    liked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, cancion_id)
);

-- 16. TABLA REPRODUCCIONES
CREATE TABLE IF NOT EXISTS reproducciones (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES usuarios(id) ON DELETE SET NULL,
    cancion_id BIGINT REFERENCES canciones(id) ON DELETE CASCADE,
    played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    duration_played INTEGER -- segundos reproducidos
);

-- ===============================================
-- ÍNDICES PARA MEJORAR PERFORMANCE
-- ===============================================

-- Índices en usuarios
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_type ON usuarios(type);
CREATE INDEX IF NOT EXISTS idx_usuarios_auth_id ON usuarios(auth_id);

-- Índices en artistas
CREATE INDEX IF NOT EXISTS idx_artistas_user_id ON artistas(user_id);
CREATE INDEX IF NOT EXISTS idx_artistas_genero ON artistas(genero);

-- Índices en canciones
CREATE INDEX IF NOT EXISTS idx_canciones_artista_id ON canciones(artista_id);
CREATE INDEX IF NOT EXISTS idx_canciones_album_id ON canciones(album_id);
CREATE INDEX IF NOT EXISTS idx_canciones_genre ON canciones(genre);

-- Índices en playlists
CREATE INDEX IF NOT EXISTS idx_playlists_user_id ON playlists(user_id);
CREATE INDEX IF NOT EXISTS idx_playlist_canciones_playlist_id ON playlist_canciones(playlist_id);

-- Índices en eventos
CREATE INDEX IF NOT EXISTS idx_eventos_artista_id ON eventos(artista_id);
CREATE INDEX IF NOT EXISTS idx_eventos_fecha ON eventos(fecha);

-- ===============================================
-- TRIGGERS PARA ACTUALIZAR TIMESTAMPS
-- ===============================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at automáticamente
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_artistas_updated_at BEFORE UPDATE ON artistas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_perfil_artistas_updated_at BEFORE UPDATE ON perfil_artistas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_albumes_updated_at BEFORE UPDATE ON albumes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_canciones_updated_at BEFORE UPDATE ON canciones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_eventos_updated_at BEFORE UPDATE ON eventos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_playlists_updated_at BEFORE UPDATE ON playlists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_radios_updated_at BEFORE UPDATE ON radios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_club_fans_updated_at BEFORE UPDATE ON club_fans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===============================================
-- DATOS DE EJEMPLO (OPCIONAL)
-- ===============================================

-- Insertar usuario de ejemplo
INSERT INTO usuarios (name, email, password, type) 
VALUES ('Admin', 'admin@rawbeats.com', 'hashed_password', 'admin')
ON CONFLICT (email) DO NOTHING;

-- ===============================================
-- POLÍTICAS RLS (Row Level Security) - OPCIONAL
-- ===============================================

-- Habilitar RLS en las tablas principales
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE artistas ENABLE ROW LEVEL SECURITY;
ALTER TABLE canciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;

-- Política básica: los usuarios pueden ver sus propios datos
CREATE POLICY "Users can view their own data" ON usuarios
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own data" ON usuarios
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Política para artistas: pueden gestionar sus propios datos
CREATE POLICY "Artists can manage their own data" ON artistas
    FOR ALL USING (auth.uid()::text = user_id::text);

-- Políticas públicas para lectura de contenido
CREATE POLICY "Everyone can view public songs" ON canciones
    FOR SELECT USING (true);

CREATE POLICY "Everyone can view public playlists" ON playlists
    FOR SELECT USING (is_public = true);

-- ===============================================
-- FIN DEL SCRIPT
-- ===============================================
