-- Script para crear vistas y triggers de estadísticas
-- Ejecutar en Supabase Query Editor

-- ===== PASO 1: CREAR VISTA PARA CANCIONES CON LIKES =====
CREATE OR REPLACE VIEW canciones_con_likes AS
SELECT 
    c.id,
    c.title,
    c.artist,
    c.album,
    c.artista_id,
    c.imagen_url,
    COUNT(lc.id) as total_likes
FROM canciones c
LEFT JOIN likes_canciones lc ON c.id = lc.cancion_id
GROUP BY c.id, c.title, c.artist, c.album, c.artista_id, c.imagen_url
ORDER BY total_likes DESC;

-- ===== PASO 2: CREAR VISTA PARA ESTADÍSTICAS DE ARTISTAS =====
CREATE OR REPLACE VIEW estadisticas_artistas AS
SELECT 
    a.id as artista_id,
    a.nombre as nombre_artistico,
    COALESCE(likes_stats.total_likes, 0) as likes,
    COALESCE(repro_stats.total_reproducciones, 0) as reproducciones,
    COALESCE(seguidores_stats.total_seguidores, 0) as seguidores,
    NOW() as updated_at
FROM artistas a
LEFT JOIN (
    SELECT 
        c.artista_id,
        COUNT(lc.id) as total_likes
    FROM canciones c
    LEFT JOIN likes_canciones lc ON c.id = lc.cancion_id
    GROUP BY c.artista_id
) likes_stats ON a.id = likes_stats.artista_id
LEFT JOIN (
    SELECT 
        c.artista_id,
        COUNT(r.id) as total_reproducciones
    FROM canciones c
    LEFT JOIN reproducciones r ON c.id = r.cancion_id
    GROUP BY c.artista_id
) repro_stats ON a.id = repro_stats.artista_id
LEFT JOIN (
    SELECT 
        artista_id,
        COUNT(*) as total_seguidores
    FROM seguidores
    GROUP BY artista_id
) seguidores_stats ON a.id = seguidores_stats.artista_id;

-- ===== PASO 3: FUNCIÓN PARA ACTUALIZAR ESTADÍSTICAS =====
CREATE OR REPLACE FUNCTION actualizar_estadisticas_artista(artista_uuid UUID)
RETURNS VOID AS $$
DECLARE
    total_likes BIGINT;
    total_reproducciones BIGINT;
    total_seguidores BIGINT;
BEGIN
    -- Contar likes
    SELECT COUNT(*) INTO total_likes
    FROM likes_canciones lc
    INNER JOIN canciones c ON lc.cancion_id = c.id
    WHERE c.artista_id = artista_uuid;
    
    -- Contar reproducciones
    SELECT COUNT(*) INTO total_reproducciones
    FROM reproducciones r
    INNER JOIN canciones c ON r.cancion_id = c.id
    WHERE c.artista_id = artista_uuid;
    
    -- Contar seguidores
    SELECT COUNT(*) INTO total_seguidores
    FROM seguidores s
    WHERE s.artista_id = artista_uuid;
    
    -- Actualizar o insertar en perfil_artistas
    INSERT INTO perfil_artistas (artista_id, likes, reproducciones, seguidores, updated_at)
    VALUES (artista_uuid, total_likes, total_reproducciones, total_seguidores, NOW())
    ON CONFLICT (artista_id) 
    DO UPDATE SET 
        likes = total_likes,
        reproducciones = total_reproducciones,
        seguidores = total_seguidores,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- ===== PASO 4: FUNCIÓN PARA TRIGGER DE LIKES =====
CREATE OR REPLACE FUNCTION trigger_actualizar_likes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Obtener artista_id de la canción y actualizar
        PERFORM actualizar_estadisticas_artista(
            (SELECT artista_id FROM canciones WHERE id = NEW.cancion_id)
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Obtener artista_id de la canción y actualizar
        PERFORM actualizar_estadisticas_artista(
            (SELECT artista_id FROM canciones WHERE id = OLD.cancion_id)
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ===== PASO 5: CREAR TRIGGER PARA LIKES =====
DROP TRIGGER IF EXISTS trigger_likes_estadisticas ON likes_canciones;
CREATE TRIGGER trigger_likes_estadisticas
    AFTER INSERT OR DELETE ON likes_canciones
    FOR EACH ROW EXECUTE FUNCTION trigger_actualizar_likes();

-- ===== PASO 6: FUNCIÓN PARA TRIGGER DE REPRODUCCIONES =====
CREATE OR REPLACE FUNCTION trigger_actualizar_reproducciones()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM actualizar_estadisticas_artista(
            (SELECT artista_id FROM canciones WHERE id = NEW.cancion_id)
        );
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ===== PASO 7: CREAR TRIGGER PARA REPRODUCCIONES =====
DROP TRIGGER IF EXISTS trigger_reproducciones_estadisticas ON reproducciones;
CREATE TRIGGER trigger_reproducciones_estadisticas
    AFTER INSERT ON reproducciones
    FOR EACH ROW EXECUTE FUNCTION trigger_actualizar_reproducciones();

-- ===== PASO 8: FUNCIÓN PARA TRIGGER DE SEGUIDORES =====
CREATE OR REPLACE FUNCTION trigger_actualizar_seguidores()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM actualizar_estadisticas_artista(NEW.artista_id);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM actualizar_estadisticas_artista(OLD.artista_id);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ===== PASO 9: CREAR TRIGGER PARA SEGUIDORES =====
DROP TRIGGER IF EXISTS trigger_seguidores_estadisticas ON seguidores;
CREATE TRIGGER trigger_seguidores_estadisticas
    AFTER INSERT OR DELETE ON seguidores
    FOR EACH ROW EXECUTE FUNCTION trigger_actualizar_seguidores();

-- ===== PASO 10: VERIFICAR VISTAS =====
SELECT 'Vista canciones_con_likes creada' as status;
SELECT * FROM canciones_con_likes LIMIT 3;

SELECT 'Vista estadisticas_artistas creada' as status;
SELECT * FROM estadisticas_artistas LIMIT 3;

-- ===== PASO 11: ACTUALIZAR ESTADÍSTICAS EXISTENTES =====
-- Actualizar estadísticas para todos los artistas existentes
SELECT actualizar_estadisticas_artista(id) FROM artistas;

-- Verificar que las estadísticas se actualizaron
SELECT * FROM perfil_artistas;

-- ===== MENSAJE FINAL =====
SELECT 'Vistas y triggers de estadísticas creados exitosamente' as mensaje;
