-- Script Simple para Likes y Estadísticas
-- Versión sin errores de sintaxis

-- 1. Crear tabla de likes
CREATE TABLE IF NOT EXISTS likes_canciones (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    cancion_id BIGINT NOT NULL REFERENCES canciones(id) ON DELETE CASCADE,
    liked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, cancion_id)
);

-- 2. Crear índices
CREATE INDEX IF NOT EXISTS idx_likes_canciones_user_id ON likes_canciones(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_canciones_cancion_id ON likes_canciones(cancion_id);

-- 3. Agregar columnas a perfil_artistas
ALTER TABLE perfil_artistas 
ADD COLUMN IF NOT EXISTS likes BIGINT DEFAULT 0;

ALTER TABLE perfil_artistas 
ADD COLUMN IF NOT EXISTS reproducciones BIGINT DEFAULT 0;

ALTER TABLE perfil_artistas 
ADD COLUMN IF NOT EXISTS seguidores BIGINT DEFAULT 0;

ALTER TABLE perfil_artistas 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 4. Función para actualizar likes
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
        DO UPDATE SET likes = total_likes, updated_at = NOW();
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 5. Función para trigger de likes
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

-- 6. Crear trigger
DROP TRIGGER IF EXISTS trigger_likes ON likes_canciones;
CREATE TRIGGER trigger_likes
    AFTER INSERT OR DELETE ON likes_canciones
    FOR EACH ROW EXECUTE FUNCTION trigger_likes_function();

-- 7. Función para actualizar reproducciones
CREATE OR REPLACE FUNCTION actualizar_reproducciones_artista(cancion_id_param BIGINT)
RETURNS VOID AS $$
DECLARE
    artista_uuid UUID;
    total_reproducciones BIGINT;
BEGIN
    SELECT artista_id INTO artista_uuid
    FROM canciones WHERE id = cancion_id_param;
    
    IF artista_uuid IS NOT NULL THEN
        SELECT COUNT(*) INTO total_reproducciones
        FROM reproducciones r
        INNER JOIN canciones c ON r.cancion_id = c.id
        WHERE c.artista_id = artista_uuid;
        
        INSERT INTO perfil_artistas (artista_id, reproducciones, updated_at)
        VALUES (artista_uuid, total_reproducciones, NOW())
        ON CONFLICT (artista_id) 
        DO UPDATE SET reproducciones = total_reproducciones, updated_at = NOW();
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 8. Función para trigger de reproducciones
CREATE OR REPLACE FUNCTION trigger_reproducciones_function()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM actualizar_reproducciones_artista(NEW.cancion_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Crear trigger para reproducciones
DROP TRIGGER IF EXISTS trigger_reproducciones ON reproducciones;
CREATE TRIGGER trigger_reproducciones
    AFTER INSERT ON reproducciones
    FOR EACH ROW EXECUTE FUNCTION trigger_reproducciones_function();

-- 10. Habilitar RLS
ALTER TABLE likes_canciones ENABLE ROW LEVEL SECURITY;

-- 11. Crear políticas básicas (permisivas por ahora)
DROP POLICY IF EXISTS "usuarios_pueden_manejar_sus_likes" ON likes_canciones;
CREATE POLICY "usuarios_pueden_manejar_sus_likes" ON likes_canciones
    FOR ALL USING (true);

-- 12. Vista para canciones populares
CREATE OR REPLACE VIEW canciones_con_likes AS
SELECT 
    c.id,
    c.title,
    c.artist,
    c.album,
    COUNT(lc.id) as total_likes
FROM canciones c
LEFT JOIN likes_canciones lc ON c.id = lc.cancion_id
GROUP BY c.id, c.title, c.artist, c.album
ORDER BY total_likes DESC;
