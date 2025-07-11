-- Script simplificado para likes y estadísticas
-- Ejecutar este script en Supabase SQL Editor

-- 1. Crear tabla de likes
CREATE TABLE IF NOT EXISTS likes_canciones (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    cancion_id BIGINT NOT NULL REFERENCES canciones(id) ON DELETE CASCADE,
    liked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, cancion_id)
);

-- 2. Índices básicos
CREATE INDEX IF NOT EXISTS idx_likes_canciones_user_id ON likes_canciones(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_canciones_cancion_id ON likes_canciones(cancion_id);

-- 3. Agregar columnas a perfil_artistas si no existen
ALTER TABLE perfil_artistas 
ADD COLUMN IF NOT EXISTS likes BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS reproducciones BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS seguidores BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 4. Función simple para actualizar likes
CREATE OR REPLACE FUNCTION actualizar_likes_artista(cancion_id_param BIGINT)
RETURNS VOID AS $$
DECLARE
    artista_uuid UUID;
    total_likes BIGINT;
BEGIN
    -- Obtener artista de la canción
    SELECT artista_id INTO artista_uuid
    FROM canciones WHERE id = cancion_id_param;
    
    IF artista_uuid IS NOT NULL THEN
        -- Contar likes del artista
        SELECT COUNT(*) INTO total_likes
        FROM likes_canciones lc
        INNER JOIN canciones c ON lc.cancion_id = c.id
        WHERE c.artista_id = artista_uuid;
        
        -- Actualizar perfil
        INSERT INTO perfil_artistas (artista_id, likes, updated_at)
        VALUES (artista_uuid, total_likes, NOW())
        ON CONFLICT (artista_id) 
        DO UPDATE SET likes = total_likes, updated_at = NOW();
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 5. Trigger para actualizar automáticamente
CREATE OR REPLACE FUNCTION trigger_likes_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM actualizar_likes_artista(NEW.cancion_id);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM actualizar_likes_artista(OLD.cancion_id);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_likes ON likes_canciones;
CREATE TRIGGER trigger_likes
    AFTER INSERT OR DELETE ON likes_canciones
    FOR EACH ROW EXECUTE FUNCTION trigger_likes_function();

-- 6. Políticas básicas de seguridad
ALTER TABLE likes_canciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "usuarios_pueden_ver_sus_likes" ON likes_canciones
    FOR ALL USING (user_id = auth.uid()::BIGINT);
