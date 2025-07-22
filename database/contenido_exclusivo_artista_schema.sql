-- Script para agregar tabla de contenido exclusivo de artistas
-- Este script debe ejecutarse en Supabase

-- 0. Verificar y corregir estructura de tabla artistas si es necesario
-- Primero verificamos si existe la restricción única en artistas.user_id
DO $$
BEGIN
    -- Verificar si existe una restricción única en user_id
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'artistas' 
        AND kcu.column_name = 'user_id' 
        AND tc.constraint_type = 'UNIQUE'
    ) THEN
        -- Si no existe, agregar la restricción única
        ALTER TABLE artistas ADD CONSTRAINT artistas_user_id_unique UNIQUE (user_id);
        RAISE NOTICE 'Restricción única agregada a artistas.user_id';
    ELSE
        RAISE NOTICE 'Restricción única ya existe en artistas.user_id';
    END IF;
END $$;

-- 1. Crear tabla para contenido exclusivo de artistas
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

-- Agregar la clave foránea después de asegurar que existe la restricción única
ALTER TABLE contenido_exclusivo_artista 
ADD CONSTRAINT fk_contenido_exclusivo_artista_id 
FOREIGN KEY (artista_id) REFERENCES artistas(user_id) ON DELETE CASCADE;

-- 2. Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_contenido_exclusivo_artista_id ON contenido_exclusivo_artista(artista_id);
CREATE INDEX IF NOT EXISTS idx_contenido_exclusivo_contenido ON contenido_exclusivo_artista(contenido_id);
CREATE INDEX IF NOT EXISTS idx_contenido_exclusivo_tipo ON contenido_exclusivo_artista(tipo_contenido);
CREATE INDEX IF NOT EXISTS idx_contenido_exclusivo_nivel ON contenido_exclusivo_artista(nivel_acceso_requerido);
CREATE INDEX IF NOT EXISTS idx_contenido_exclusivo_activo ON contenido_exclusivo_artista(activo);

-- 3. Crear trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_contenido_exclusivo_artista_updated_at
    BEFORE UPDATE ON contenido_exclusivo_artista
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 4. Habilitar RLS (Row Level Security)
ALTER TABLE contenido_exclusivo_artista ENABLE ROW LEVEL SECURITY;

-- 5. Crear políticas RLS para contenido exclusivo de artistas
-- Política para que los artistas solo vean y gestionen su propio contenido
CREATE POLICY "Los artistas pueden gestionar su propio contenido exclusivo"
    ON contenido_exclusivo_artista
    FOR ALL
    USING (
        auth.uid() IN (
            SELECT user_id FROM artistas WHERE user_id = contenido_exclusivo_artista.artista_id
        )
    );

-- Política para que todos los usuarios autenticados puedan ver contenido activo
CREATE POLICY "Usuarios autenticados pueden ver contenido exclusivo activo"
    ON contenido_exclusivo_artista
    FOR SELECT
    USING (activo = true AND auth.role() = 'authenticated');

-- 6. Insertar datos de ejemplo para desarrollo (solo si existen artistas)
DO $$
DECLARE
    primer_artista_id UUID;
BEGIN
    -- Obtener el primer artista disponible
    SELECT user_id INTO primer_artista_id FROM artistas LIMIT 1;
    
    -- Solo insertar datos si existe al menos un artista
    IF primer_artista_id IS NOT NULL THEN
        INSERT INTO contenido_exclusivo_artista (artista_id, contenido_id, tipo_contenido, nivel_acceso_requerido, descripcion, precio_individual) VALUES
        (
            primer_artista_id,
            'cancion_001',
            'letra',
            2,
            'Letra exclusiva con acordes y notas del artista',
            5.99
        ),
        (
            primer_artista_id,
            'cancion_002',
            'video',
            3,
            'Video backstage de la grabación de la canción',
            12.99
        ),
        (
            primer_artista_id,
            'album_001',
            'foto',
            1,
            'Fotos exclusivas de la sesión de fotos del álbum',
            3.99
        );
        
        RAISE NOTICE 'Datos de ejemplo insertados para artista: %', primer_artista_id;
    ELSE
        RAISE NOTICE 'No se encontraron artistas. Los datos de ejemplo no se insertaron.';
    END IF;
END $$;

-- 7. Crear vista para estadísticas de contenido exclusivo por artista
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

-- 8. Crear función para verificar acceso a contenido
CREATE OR REPLACE FUNCTION verificar_acceso_contenido(
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
    
    -- Verificar si el usuario tiene una suscripción activa con el nivel adecuado
    SELECT EXISTS(
        SELECT 1 
        FROM suscripciones_usuario su
        JOIN membresias m ON su.membresia_id = m.id
        WHERE su.usuario_id = p_usuario_id
        AND su.artista_id = p_artista_id
        AND su.activa = true
        AND su.fecha_fin > NOW()
        AND m.id >= nivel_requerido -- Asumiendo que IDs más altos = niveles más altos
    ) INTO tiene_acceso;
    
    RETURN tiene_acceso;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Crear función para obtener contenido accesible por usuario
CREATE OR REPLACE FUNCTION obtener_contenido_accesible(
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
    AND verificar_acceso_contenido(p_usuario_id, p_artista_id, c.contenido_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Crear trigger para notificaciones cuando se agrega contenido exclusivo
CREATE OR REPLACE FUNCTION notificar_nuevo_contenido_exclusivo()
RETURNS TRIGGER AS $$
BEGIN
    -- Insertar notificación para suscriptores del artista
    INSERT INTO notificaciones_monetizacion (
        usuario_id,
        artista_id,
        tipo,
        titulo,
        mensaje,
        leida
    )
    SELECT 
        su.usuario_id,
        NEW.artista_id,
        'nuevo_contenido_exclusivo',
        'Nuevo contenido exclusivo disponible',
        CONCAT('El artista ha subido nuevo contenido exclusivo: ', NEW.descripcion),
        false
    FROM suscripciones_usuario su
    WHERE su.artista_id = NEW.artista_id
    AND su.activa = true
    AND su.fecha_fin > NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notificar_nuevo_contenido
    AFTER INSERT ON contenido_exclusivo_artista
    FOR EACH ROW
    EXECUTE FUNCTION notificar_nuevo_contenido_exclusivo();

-- 11. Comentarios para documentación
COMMENT ON TABLE contenido_exclusivo_artista IS 'Tabla para gestionar contenido exclusivo creado por artistas';
COMMENT ON COLUMN contenido_exclusivo_artista.artista_id IS 'ID del artista que creó el contenido';
COMMENT ON COLUMN contenido_exclusivo_artista.contenido_id IS 'ID del contenido (canción, álbum, etc.)';
COMMENT ON COLUMN contenido_exclusivo_artista.tipo_contenido IS 'Tipo de contenido: cancion, album, letra, video, foto';
COMMENT ON COLUMN contenido_exclusivo_artista.nivel_acceso_requerido IS 'Nivel de membresía requerido (1=básico, 2=premium, 3=vip)';
COMMENT ON COLUMN contenido_exclusivo_artista.precio_individual IS 'Precio opcional para compra individual sin membresía';

-- Mensaje de confirmación
SELECT 'Tabla contenido_exclusivo_artista y funciones relacionadas creadas exitosamente' as resultado;
