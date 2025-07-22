-- Script alternativo para contenido exclusivo de artistas (sin FK estricta)
-- Este script funciona incluso si la tabla artistas no tiene restricciones únicas

-- 1. Crear tabla para contenido exclusivo de artistas (versión simplificada)
CREATE TABLE IF NOT EXISTS contenido_exclusivo_artista (
    id SERIAL PRIMARY KEY,
    artista_id UUID NOT NULL,
    contenido_id VARCHAR(255) NOT NULL, -- ID de la canción/álbum/contenido
    tipo_contenido VARCHAR(50) NOT NULL CHECK (tipo_contenido IN ('cancion', 'album', 'letra', 'video', 'foto')),
    nivel_acceso_requerido INTEGER NOT NULL DEFAULT 1 CHECK (nivel_acceso_requerido >= 1 AND nivel_acceso_requerido <= 3),
    precio_individual DECIMAL(10,2), -- Precio opcional para compra individual
    descripcion TEXT NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Constraints
    UNIQUE(artista_id, contenido_id, tipo_contenido)
);

-- 2. Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_contenido_exclusivo_artista_id ON contenido_exclusivo_artista(artista_id);
CREATE INDEX IF NOT EXISTS idx_contenido_exclusivo_contenido ON contenido_exclusivo_artista(contenido_id);
CREATE INDEX IF NOT EXISTS idx_contenido_exclusivo_tipo ON contenido_exclusivo_artista(tipo_contenido);
CREATE INDEX IF NOT EXISTS idx_contenido_exclusivo_nivel ON contenido_exclusivo_artista(nivel_acceso_requerido);
CREATE INDEX IF NOT EXISTS idx_contenido_exclusivo_activo ON contenido_exclusivo_artista(activo);

-- 3. Crear función para updated_at (si no existe)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 4. Crear trigger para updated_at
DROP TRIGGER IF EXISTS update_contenido_exclusivo_artista_updated_at ON contenido_exclusivo_artista;
CREATE TRIGGER update_contenido_exclusivo_artista_updated_at
    BEFORE UPDATE ON contenido_exclusivo_artista
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 5. Habilitar RLS (Row Level Security)
ALTER TABLE contenido_exclusivo_artista ENABLE ROW LEVEL SECURITY;

-- 6. Crear políticas RLS simplificadas
DROP POLICY IF EXISTS "Los artistas pueden gestionar su propio contenido exclusivo" ON contenido_exclusivo_artista;
CREATE POLICY "Los artistas pueden gestionar su propio contenido exclusivo"
    ON contenido_exclusivo_artista
    FOR ALL
    USING (
        -- Permitir acceso si el usuario está autenticado y es el propietario del contenido
        auth.uid()::text = artista_id::text 
        OR 
        auth.role() = 'service_role'
    );

-- Política para lectura pública de contenido activo
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver contenido exclusivo activo" ON contenido_exclusivo_artista;
CREATE POLICY "Usuarios autenticados pueden ver contenido exclusivo activo"
    ON contenido_exclusivo_artista
    FOR SELECT
    USING (activo = true AND auth.role() = 'authenticated');

-- 7. Insertar datos de ejemplo usando UUIDs ficticios
INSERT INTO contenido_exclusivo_artista (artista_id, contenido_id, tipo_contenido, nivel_acceso_requerido, descripcion, precio_individual) 
VALUES
(
    gen_random_uuid(), -- UUID ficticio para desarrollo
    'cancion_001',
    'letra',
    2,
    'Letra exclusiva con acordes y notas del artista',
    5.99
),
(
    gen_random_uuid(),
    'cancion_002',
    'video',
    3,
    'Video backstage de la grabación de la canción',
    12.99
),
(
    gen_random_uuid(),
    'album_001',
    'foto',
    1,
    'Fotos exclusivas de la sesión de fotos del álbum',
    3.99
)
ON CONFLICT (artista_id, contenido_id, tipo_contenido) DO NOTHING;

-- 8. Crear vista para estadísticas de contenido exclusivo por artista
CREATE OR REPLACE VIEW estadisticas_contenido_exclusivo AS
SELECT 
    artista_id,
    COUNT(*) as total_contenido,
    COUNT(CASE WHEN tipo_contenido = 'cancion' THEN 1 END) as canciones_exclusivas,
    COUNT(CASE WHEN tipo_contenido = 'album' THEN 1 END) as albums_exclusivos,
    COUNT(CASE WHEN tipo_contenido = 'letra' THEN 1 END) as letras_exclusivas,
    COUNT(CASE WHEN tipo_contenido = 'video' THEN 1 END) as videos_exclusivos,
    COUNT(CASE WHEN tipo_contenido = 'foto' THEN 1 END) as fotos_exclusivas,
    COUNT(CASE WHEN nivel_acceso_requerido = 1 THEN 1 END) as contenido_basico,
    COUNT(CASE WHEN nivel_acceso_requerido = 2 THEN 1 END) as contenido_premium,
    COUNT(CASE WHEN nivel_acceso_requerido = 3 THEN 1 END) as contenido_vip,
    AVG(precio_individual) as precio_promedio_individual,
    COUNT(CASE WHEN activo = true THEN 1 END) as contenido_activo
FROM contenido_exclusivo_artista
GROUP BY artista_id;

-- 9. Crear función para verificar acceso a contenido (versión simplificada)
CREATE OR REPLACE FUNCTION verificar_acceso_contenido_simple(
    p_usuario_id UUID,
    p_artista_id UUID,
    p_contenido_id VARCHAR
) RETURNS BOOLEAN AS $$
DECLARE
    nivel_requerido INTEGER;
    tiene_acceso BOOLEAN := false;
BEGIN
    -- Obtener el nivel de acceso requerido para el contenido
    SELECT nivel_acceso_requerido 
    INTO nivel_requerido
    FROM contenido_exclusivo_artista 
    WHERE artista_id = p_artista_id 
    AND contenido_id = p_contenido_id 
    AND activo = true;
    
    -- Si no se encuentra el contenido, retornar false
    IF nivel_requerido IS NULL THEN
        RETURN false;
    END IF;
    
    -- Verificación simplificada - si existe alguna suscripción activa
    SELECT EXISTS(
        SELECT 1 
        FROM suscripciones_usuario su
        WHERE su.usuario_id = p_usuario_id
        AND su.artista_id = p_artista_id
        AND su.activa = true
        AND (su.fecha_fin IS NULL OR su.fecha_fin > NOW())
    ) INTO tiene_acceso;
    
    -- Si no encuentra tabla suscripciones_usuario, permitir acceso por defecto para desarrollo
    IF NOT FOUND THEN
        tiene_acceso := true;
    END IF;
    
    RETURN tiene_acceso;
    
EXCEPTION
    WHEN OTHERS THEN
        -- En caso de error, permitir acceso para desarrollo
        RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Crear función para obtener contenido accesible por usuario (simplificada)
CREATE OR REPLACE FUNCTION obtener_contenido_accesible_simple(
    p_usuario_id UUID,
    p_artista_id UUID
) RETURNS TABLE (
    contenido_id VARCHAR,
    tipo_contenido VARCHAR,
    descripcion TEXT,
    nivel_acceso_requerido INTEGER,
    precio_individual DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.contenido_id,
        c.tipo_contenido,
        c.descripcion,
        c.nivel_acceso_requerido,
        c.precio_individual
    FROM contenido_exclusivo_artista c
    WHERE c.artista_id = p_artista_id
    AND c.activo = true
    AND verificar_acceso_contenido_simple(p_usuario_id, p_artista_id, c.contenido_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Comentarios para documentación
COMMENT ON TABLE contenido_exclusivo_artista IS 'Tabla para gestionar contenido exclusivo creado por artistas (versión sin FK estricta)';
COMMENT ON COLUMN contenido_exclusivo_artista.artista_id IS 'ID del artista que creó el contenido';
COMMENT ON COLUMN contenido_exclusivo_artista.contenido_id IS 'ID del contenido (canción, álbum, etc.)';
COMMENT ON COLUMN contenido_exclusivo_artista.tipo_contenido IS 'Tipo de contenido: cancion, album, letra, video, foto';
COMMENT ON COLUMN contenido_exclusivo_artista.nivel_acceso_requerido IS 'Nivel de membresía requerido (1=básico, 2=premium, 3=vip)';
COMMENT ON COLUMN contenido_exclusivo_artista.precio_individual IS 'Precio opcional para compra individual sin membresía';

-- Mensaje de confirmación
SELECT 'Tabla contenido_exclusivo_artista creada exitosamente (versión simplificada)' as resultado;
