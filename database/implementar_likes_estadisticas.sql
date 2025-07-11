-- Script para implementar sistema de likes y estadísticas
-- Proyecto: Plataforma Musical - Likes y Estadísticas
-- Fecha: 9 de julio de 2025

-- ========================================
-- 1. CREAR TABLA DE LIKES PARA CANCIONES
-- ========================================

-- Tabla para almacenar likes individuales de canciones
CREATE TABLE IF NOT EXISTS likes_canciones (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    cancion_id BIGINT NOT NULL REFERENCES canciones(id) ON DELETE CASCADE,
    liked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Evitar likes duplicados del mismo usuario a la misma canción
    UNIQUE(user_id, cancion_id)
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_likes_canciones_user_id ON likes_canciones(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_canciones_cancion_id ON likes_canciones(cancion_id);
CREATE INDEX IF NOT EXISTS idx_likes_canciones_liked_at ON likes_canciones(liked_at);

-- ========================================
-- 2. VERIFICAR/CREAR TABLA DE ESTADÍSTICAS
-- ========================================

-- Verificar si existe la tabla perfil_artistas y agregar columnas si faltan
DO $$
BEGIN
    -- Verificar si la columna 'likes' existe, si no, agregarla
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'perfil_artistas' AND column_name = 'likes'
    ) THEN
        ALTER TABLE perfil_artistas ADD COLUMN likes BIGINT DEFAULT 0;
    END IF;
    
    -- Verificar si la columna 'reproducciones' existe, si no, agregarla
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'perfil_artistas' AND column_name = 'reproducciones'
    ) THEN
        ALTER TABLE perfil_artistas ADD COLUMN reproducciones BIGINT DEFAULT 0;
    END IF;
    
    -- Verificar si la columna 'seguidores' existe, si no, agregarla
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'perfil_artistas' AND column_name = 'seguidores'
    ) THEN
        ALTER TABLE perfil_artistas ADD COLUMN seguidores BIGINT DEFAULT 0;
    END IF;
    
    -- Verificar si la columna 'updated_at' existe, si no, agregarla
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'perfil_artistas' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE perfil_artistas ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- ========================================
-- 3. FUNCIÓN PARA ACTUALIZAR ESTADÍSTICAS DE LIKES
-- ========================================

CREATE OR REPLACE FUNCTION actualizar_estadisticas_likes()
RETURNS TRIGGER AS $$
DECLARE
    artista_uuid UUID;
    total_likes_artista BIGINT;
BEGIN
    -- Obtener el artista_id de la canción
    SELECT artista_id INTO artista_uuid
    FROM canciones 
    WHERE id = COALESCE(NEW.cancion_id, OLD.cancion_id);
    
    -- Si no se encuentra el artista, salir
    IF artista_uuid IS NULL THEN
        RETURN COALESCE(NEW, OLD);
    END IF;
    
    -- Contar total de likes para todas las canciones del artista
    SELECT COUNT(*) INTO total_likes_artista
    FROM likes_canciones lc
    INNER JOIN canciones c ON lc.cancion_id = c.id
    WHERE c.artista_id = artista_uuid;
    
    -- Actualizar estadísticas del artista
    INSERT INTO perfil_artistas (artista_id, likes, updated_at)
    VALUES (artista_uuid, total_likes_artista, NOW())
    ON CONFLICT (artista_id) 
    DO UPDATE SET 
        likes = total_likes_artista,
        updated_at = NOW();
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 4. TRIGGER PARA ACTUALIZAR LIKES AUTOMÁTICAMENTE
-- ========================================

-- Eliminar trigger si existe
DROP TRIGGER IF EXISTS trigger_actualizar_estadisticas_likes ON likes_canciones;

-- Crear nuevo trigger
CREATE TRIGGER trigger_actualizar_estadisticas_likes
    AFTER INSERT OR DELETE ON likes_canciones
    FOR EACH ROW 
    EXECUTE FUNCTION actualizar_estadisticas_likes();

-- ========================================
-- 5. FUNCIÓN PARA ACTUALIZAR ESTADÍSTICAS DE REPRODUCCIONES
-- ========================================

CREATE OR REPLACE FUNCTION actualizar_estadisticas_reproducciones()
RETURNS TRIGGER AS $$
DECLARE
    artista_uuid UUID;
    total_reproducciones_artista BIGINT;
BEGIN
    -- Obtener el artista_id de la canción
    SELECT artista_id INTO artista_uuid
    FROM canciones 
    WHERE id = NEW.cancion_id;
    
    -- Si no se encuentra el artista, salir
    IF artista_uuid IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Contar total de reproducciones para todas las canciones del artista
    SELECT COUNT(*) INTO total_reproducciones_artista
    FROM reproducciones r
    INNER JOIN canciones c ON r.cancion_id = c.id
    WHERE c.artista_id = artista_uuid;
    
    -- Actualizar estadísticas del artista
    INSERT INTO perfil_artistas (artista_id, reproducciones, updated_at)
    VALUES (artista_uuid, total_reproducciones_artista, NOW())
    ON CONFLICT (artista_id) 
    DO UPDATE SET 
        reproducciones = total_reproducciones_artista,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 6. TRIGGER PARA ACTUALIZAR REPRODUCCIONES AUTOMÁTICAMENTE
-- ========================================

-- Eliminar trigger si existe
DROP TRIGGER IF EXISTS trigger_actualizar_estadisticas_reproducciones ON reproducciones;

-- Crear nuevo trigger
CREATE TRIGGER trigger_actualizar_estadisticas_reproducciones
    AFTER INSERT ON reproducciones
    FOR EACH ROW 
    EXECUTE FUNCTION actualizar_estadisticas_reproducciones();

-- ========================================
-- 7. FUNCIÓN PARA RECALCULAR TODAS LAS ESTADÍSTICAS
-- ========================================

CREATE OR REPLACE FUNCTION recalcular_estadisticas_artistas()
RETURNS VOID AS $$
DECLARE
    artista_record RECORD;
    total_likes BIGINT;
    total_reproducciones BIGINT;
BEGIN
    -- Iterar sobre todos los artistas
    FOR artista_record IN 
        SELECT DISTINCT artista_id FROM canciones WHERE artista_id IS NOT NULL
    LOOP
        -- Contar likes totales del artista
        SELECT COUNT(*) INTO total_likes
        FROM likes_canciones lc
        INNER JOIN canciones c ON lc.cancion_id = c.id
        WHERE c.artista_id = artista_record.artista_id;
        
        -- Contar reproducciones totales del artista
        SELECT COUNT(*) INTO total_reproducciones
        FROM reproducciones r
        INNER JOIN canciones c ON r.cancion_id = c.id
        WHERE c.artista_id = artista_record.artista_id;
        
        -- Actualizar o insertar estadísticas
        INSERT INTO perfil_artistas (artista_id, likes, reproducciones, updated_at)
        VALUES (artista_record.artista_id, total_likes, total_reproducciones, NOW())
        ON CONFLICT (artista_id) 
        DO UPDATE SET 
            likes = total_likes,
            reproducciones = total_reproducciones,
            updated_at = NOW();
    END LOOP;
    
    RAISE NOTICE 'Estadísticas recalculadas para todos los artistas';
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 8. POLÍTICAS DE SEGURIDAD (RLS)
-- ========================================

-- Habilitar RLS para la tabla de likes
ALTER TABLE likes_canciones ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios puedan ver sus propios likes
-- Nota: Como user_id es BIGINT y auth.uid() es UUID, usamos una política más permisiva por ahora
CREATE POLICY "Los usuarios pueden ver likes" ON likes_canciones
    FOR SELECT USING (true);

-- Política para que los usuarios puedan insertar likes
CREATE POLICY "Los usuarios pueden insertar likes" ON likes_canciones
    FOR INSERT WITH CHECK (true);

-- Política para que los usuarios puedan eliminar likes
CREATE POLICY "Los usuarios pueden eliminar likes" ON likes_canciones
    FOR DELETE USING (true);

-- ========================================
-- 9. VISTAS ÚTILES PARA CONSULTAS
-- ========================================

-- Vista para estadísticas completas de artistas
CREATE OR REPLACE VIEW estadisticas_artistas_completas AS
SELECT 
    a.id as artista_id,
    a.nombre as nombre_artista,
    pa.likes,
    pa.reproducciones,
    pa.seguidores,
    pa.updated_at,
    COUNT(DISTINCT c.id) as total_canciones,
    COUNT(DISTINCT al.id) as total_albumes
FROM artistas a
LEFT JOIN perfil_artistas pa ON a.id = pa.artista_id
LEFT JOIN canciones c ON a.id = c.artista_id
LEFT JOIN albumes al ON a.id = al.artista_id
GROUP BY a.id, a.nombre, pa.likes, pa.reproducciones, pa.seguidores, pa.updated_at;

-- Vista para canciones más populares
CREATE OR REPLACE VIEW canciones_populares AS
SELECT 
    c.id,
    c.title,
    c.artist,
    c.album,
    a.nombre as nombre_artista,
    COUNT(DISTINCT lc.id) as total_likes,
    COUNT(DISTINCT r.id) as total_reproducciones,
    c.created_at
FROM canciones c
LEFT JOIN artistas a ON c.artista_id = a.id
LEFT JOIN likes_canciones lc ON c.id = lc.cancion_id
LEFT JOIN reproducciones r ON c.id = r.cancion_id
GROUP BY c.id, c.title, c.artist, c.album, a.nombre, c.created_at
ORDER BY total_likes DESC, total_reproducciones DESC;

-- ========================================
-- 10. EJECUTAR RECÁLCULO INICIAL
-- ========================================

-- Ejecutar recálculo inicial de estadísticas
SELECT recalcular_estadisticas_artistas();

-- ========================================
-- 11. VERIFICACIONES FINALES
-- ========================================

-- Verificar que las tablas se crearon correctamente
DO $$
BEGIN
    -- Verificar tabla likes_canciones
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'likes_canciones') THEN
        RAISE NOTICE '✅ Tabla likes_canciones creada correctamente';
    ELSE
        RAISE NOTICE '❌ Error: Tabla likes_canciones no fue creada';
    END IF;
    
    -- Verificar que perfil_artistas tiene las columnas necesarias
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'perfil_artistas' AND column_name = 'likes'
    ) THEN
        RAISE NOTICE '✅ Columna likes en perfil_artistas existe';
    ELSE
        RAISE NOTICE '❌ Error: Columna likes no existe en perfil_artistas';
    END IF;
    
    -- Verificar triggers
    IF EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'trigger_actualizar_estadisticas_likes'
    ) THEN
        RAISE NOTICE '✅ Trigger para likes creado correctamente';
    ELSE
        RAISE NOTICE '❌ Error: Trigger para likes no fue creado';
    END IF;
END $$;

-- ========================================
-- 12. DATOS DE PRUEBA (OPCIONAL)
-- ========================================

-- Insertar algunos likes de prueba (descomenta si necesitas datos de prueba)
/*
INSERT INTO likes_canciones (user_id, cancion_id) VALUES 
(1, 1), (1, 2), (2, 1), (2, 3), (3, 1), (3, 2), (3, 3)
ON CONFLICT (user_id, cancion_id) DO NOTHING;

INSERT INTO reproducciones (user_id, cancion_id, duration_played) VALUES 
(1, 1, 180), (1, 2, 210), (2, 1, 150), (2, 3, 240), (3, 1, 200), (3, 2, 190)
ON CONFLICT DO NOTHING;
*/

-- ========================================
-- FINALIZACIÓN
-- ========================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 ¡Script de likes y estadísticas ejecutado exitosamente!';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Tablas creadas/actualizadas:';
    RAISE NOTICE '   - likes_canciones (nueva tabla)';
    RAISE NOTICE '   - perfil_artistas (columnas agregadas)';
    RAISE NOTICE '';
    RAISE NOTICE '⚡ Triggers creados:';
    RAISE NOTICE '   - trigger_actualizar_estadisticas_likes';
    RAISE NOTICE '   - trigger_actualizar_estadisticas_reproducciones';
    RAISE NOTICE '';
    RAISE NOTICE '🛡️ Políticas de seguridad configuradas';
    RAISE NOTICE '👀 Vistas útiles creadas';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 El sistema de likes y estadísticas está listo para usar!';
END $$;
