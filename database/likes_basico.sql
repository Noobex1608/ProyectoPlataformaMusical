-- Script Ultra Simple para Likes (Sin RLS por ahora)
-- Ejecutar paso a paso en Supabase

-- Paso 1: Crear tabla de likes
CREATE TABLE IF NOT EXISTS likes_canciones (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    cancion_id BIGINT NOT NULL REFERENCES canciones(id) ON DELETE CASCADE,
    liked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, cancion_id)
);

-- Paso 2: Crear índices
CREATE INDEX IF NOT EXISTS idx_likes_canciones_user_id ON likes_canciones(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_canciones_cancion_id ON likes_canciones(cancion_id);

-- Paso 3: Agregar columnas a perfil_artistas (ejecutar una por una)
ALTER TABLE perfil_artistas ADD COLUMN IF NOT EXISTS likes BIGINT DEFAULT 0;
ALTER TABLE perfil_artistas ADD COLUMN IF NOT EXISTS reproducciones BIGINT DEFAULT 0;
ALTER TABLE perfil_artistas ADD COLUMN IF NOT EXISTS seguidores BIGINT DEFAULT 0;
ALTER TABLE perfil_artistas ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Paso 4: Función simple para actualizar likes
CREATE OR REPLACE FUNCTION actualizar_likes_artista(cancion_id_param BIGINT)
RETURNS VOID AS $$
DECLARE
    artista_uuid UUID;
    total_likes BIGINT;
BEGIN
    SELECT artista_id INTO artista_uuid
    FROM canciones WHERE id = cancion_id_param;
    
    IF artista_uuid IS NOT NULL THEN
        SELECT COUNT(*) INTO total_likes
        FROM likes_canciones lc
        INNER JOIN canciones c ON lc.cancion_id = c.id
        WHERE c.artista_id = artista_uuid;
        
        INSERT INTO perfil_artistas (artista_id, likes, updated_at)
        VALUES (artista_uuid, total_likes, NOW())
        ON CONFLICT (artista_id) 
        DO UPDATE SET 
            likes = total_likes, 
            updated_at = NOW();
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Paso 5: Función para el trigger
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

-- Paso 6: Crear trigger
DROP TRIGGER IF EXISTS trigger_likes ON likes_canciones;
CREATE TRIGGER trigger_likes
    AFTER INSERT OR DELETE ON likes_canciones
    FOR EACH ROW EXECUTE FUNCTION trigger_likes_function();

-- Paso 7: Vista para consultas
CREATE OR REPLACE VIEW canciones_con_likes AS
SELECT 
    c.id,
    c.title,
    c.artist,
    c.album,
    c.artista_id,
    COUNT(lc.id) as total_likes
FROM canciones c
LEFT JOIN likes_canciones lc ON c.id = lc.cancion_id
GROUP BY c.id, c.title, c.artist, c.album, c.artista_id
ORDER BY total_likes DESC;

-- Paso 8: Probar que funciona (opcional)
-- Descomenta las siguientes líneas para probar
/*
INSERT INTO likes_canciones (user_id, cancion_id) VALUES (1, 1);
SELECT * FROM likes_canciones;
SELECT * FROM perfil_artistas WHERE likes > 0;
DELETE FROM likes_canciones WHERE user_id = 1 AND cancion_id = 1;
*/
