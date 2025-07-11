-- Script Simple para Estadísticas en Tiempo Real
-- Ejecutar paso a paso en Supabase Query Editor

-- ===== PASO 1: VERIFICAR TABLA PERFIL_ARTISTAS =====
-- Agregar columnas si no existen
ALTER TABLE perfil_artistas 
ADD COLUMN IF NOT EXISTS likes BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS reproducciones BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS seguidores BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- ===== PASO 2: CREAR ÍNDICE EN PERFIL_ARTISTAS =====
CREATE UNIQUE INDEX IF NOT EXISTS idx_perfil_artistas_artista_id 
ON perfil_artistas(artista_id);

-- ===== PASO 3: FUNCIÓN SIMPLE PARA ACTUALIZAR ESTADÍSTICAS =====
CREATE OR REPLACE FUNCTION actualizar_likes_artista_simple(artista_uuid UUID)
RETURNS VOID AS $$
DECLARE
    total_likes BIGINT;
BEGIN
    -- Contar likes para todas las canciones del artista
    SELECT COUNT(*) INTO total_likes
    FROM likes_canciones lc
    INNER JOIN canciones c ON lc.cancion_id = c.id
    WHERE c.artista_id = artista_uuid;
    
    -- Actualizar o insertar en perfil_artistas
    INSERT INTO perfil_artistas (artista_id, likes, updated_at)
    VALUES (artista_uuid, total_likes, NOW())
    ON CONFLICT (artista_id) 
    DO UPDATE SET 
        likes = total_likes,
        updated_at = NOW();
        
    RAISE NOTICE 'Estadísticas actualizadas para artista %: % likes', artista_uuid, total_likes;
END;
$$ LANGUAGE plpgsql;

-- ===== PASO 4: TRIGGER SIMPLE PARA LIKES =====
CREATE OR REPLACE FUNCTION trigger_likes_simple()
RETURNS TRIGGER AS $$
DECLARE
    artista_uuid UUID;
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Obtener artista_id de la canción
        SELECT artista_id INTO artista_uuid
        FROM canciones WHERE id = NEW.cancion_id;
        
        -- Actualizar estadísticas
        IF artista_uuid IS NOT NULL THEN
            PERFORM actualizar_likes_artista_simple(artista_uuid);
        END IF;
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Obtener artista_id de la canción
        SELECT artista_id INTO artista_uuid
        FROM canciones WHERE id = OLD.cancion_id;
        
        -- Actualizar estadísticas
        IF artista_uuid IS NOT NULL THEN
            PERFORM actualizar_likes_artista_simple(artista_uuid);
        END IF;
        
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ===== PASO 5: CREAR TRIGGER =====
DROP TRIGGER IF EXISTS trigger_likes_estadisticas_simple ON likes_canciones;
CREATE TRIGGER trigger_likes_estadisticas_simple
    AFTER INSERT OR DELETE ON likes_canciones
    FOR EACH ROW EXECUTE FUNCTION trigger_likes_simple();

-- ===== PASO 6: ACTUALIZAR ESTADÍSTICAS EXISTENTES =====
-- Recalcular likes para todos los artistas
DO $$
DECLARE
    artista_record RECORD;
BEGIN
    FOR artista_record IN SELECT id FROM artistas LOOP
        PERFORM actualizar_likes_artista_simple(artista_record.id);
    END LOOP;
END $$;

-- ===== PASO 7: VERIFICAR RESULTADOS =====
-- Ver estadísticas actualizadas
SELECT 
    a.id as artista_id,
    a.nombre as nombre_artista,
    COALESCE(p.likes, 0) as likes,
    COALESCE(p.reproducciones, 0) as reproducciones,
    COALESCE(p.seguidores, 0) as seguidores,
    p.updated_at
FROM artistas a
LEFT JOIN perfil_artistas p ON a.id = p.artista_id
ORDER BY p.likes DESC NULLS LAST;

-- ===== PASO 8: PROBAR CON DATOS DE EJEMPLO =====
-- Solo si quieres probar manualmente
/*
-- Insertar un like de prueba
INSERT INTO likes_canciones (user_id, cancion_id) 
SELECT 1, id FROM canciones LIMIT 1;

-- Ver si se actualizaron las estadísticas
SELECT * FROM perfil_artistas WHERE likes > 0;

-- Eliminar el like de prueba
DELETE FROM likes_canciones WHERE user_id = 1;
*/

-- ===== MENSAJE FINAL =====
SELECT 'Sistema de estadísticas simple configurado exitosamente' as mensaje;
