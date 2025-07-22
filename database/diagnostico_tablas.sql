-- Script para diagnosticar y crear la tabla contenido_exclusivo_artista

-- 1. Verificar si la tabla existe
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_name LIKE '%contenido%exclusivo%' OR table_name LIKE '%exclusivo%';

-- 2. Si no existe, crear la tabla
CREATE TABLE IF NOT EXISTS public.contenido_exclusivo_artista (
    id SERIAL PRIMARY KEY,
    artista_id UUID NOT NULL,
    contenido_id TEXT NOT NULL,
    tipo_contenido TEXT CHECK (tipo_contenido IN ('cancion', 'album', 'letra', 'video', 'foto')),
    descripcion TEXT NOT NULL,
    nivel_acceso_requerido INTEGER DEFAULT 1 CHECK (nivel_acceso_requerido IN (1, 2, 3)),
    precio_individual DECIMAL(10,2),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_contenido_exclusivo_artista_id ON public.contenido_exclusivo_artista(artista_id);
CREATE INDEX IF NOT EXISTS idx_contenido_exclusivo_tipo ON public.contenido_exclusivo_artista(tipo_contenido);
CREATE INDEX IF NOT EXISTS idx_contenido_exclusivo_activo ON public.contenido_exclusivo_artista(activo);

-- 4. Habilitar RLS (Row Level Security)
ALTER TABLE public.contenido_exclusivo_artista ENABLE ROW LEVEL SECURITY;

-- 5. Crear políticas básicas
-- Permitir a todos leer contenido activo (para suscriptores)
CREATE POLICY "Permitir lectura de contenido activo" ON public.contenido_exclusivo_artista
    FOR SELECT USING (activo = true);

-- Permitir a artistas gestionar su propio contenido
CREATE POLICY "Artistas pueden gestionar su contenido" ON public.contenido_exclusivo_artista
    FOR ALL USING (auth.uid() = artista_id);

-- 6. Insertar algunos datos de prueba (opcional)
INSERT INTO public.contenido_exclusivo_artista (
    artista_id, 
    contenido_id, 
    tipo_contenido, 
    descripcion, 
    nivel_acceso_requerido,
    activo
) VALUES 
    ('artista-123', 'cancion_001', 'cancion', 'Mi nueva canción exclusiva', 1, true),
    ('artista-123', 'video_001', 'video', 'Video detrás de cámaras', 2, true),
    ('artista-123', 'foto_001', 'foto', 'Sesión de fotos exclusiva', 1, true)
ON CONFLICT DO NOTHING;

-- 7. Verificar que todo se creó correctamente
SELECT 
    id,
    artista_id,
    contenido_id,
    tipo_contenido,
    descripcion,
    nivel_acceso_requerido,
    activo,
    created_at
FROM public.contenido_exclusivo_artista
ORDER BY created_at DESC
LIMIT 5;
        WHEN table_name = 'recompensas' THEN '✅ Existe'
        WHEN table_name = 'configuraciones_artista' THEN '✅ Existe'
        WHEN table_name = 'notificaciones_monetizacion' THEN '✅ Existe'
        ELSE '❓ Otra tabla'
    END as estado
FROM information_schema.tables 
WHERE table_name IN (
    'membresias', 
    'propinas', 
    'transacciones', 
    'suscripciones_usuario', 
    'recompensas', 
    'configuraciones_artista', 
    'notificaciones_monetizacion'
)
ORDER BY table_name;

-- 6. Verificar si ya existe la tabla contenido_exclusivo_artista
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contenido_exclusivo_artista') 
        THEN '⚠️ Tabla contenido_exclusivo_artista YA existe'
        ELSE '✅ Tabla contenido_exclusivo_artista NO existe (listo para crear)'
    END as estado_contenido_exclusivo;

-- 7. Contar registros en tablas relacionadas (si existen)
DO $$
BEGIN
    BEGIN
        PERFORM 1 FROM artistas LIMIT 1;
        RAISE NOTICE 'Artistas registrados: %', (SELECT COUNT(*) FROM artistas);
    EXCEPTION WHEN undefined_table THEN
        RAISE NOTICE 'Tabla artistas no existe';
    END;
    
    BEGIN
        PERFORM 1 FROM usuarios LIMIT 1;
        RAISE NOTICE 'Usuarios registrados: %', (SELECT COUNT(*) FROM usuarios);
    EXCEPTION WHEN undefined_table THEN
        RAISE NOTICE 'Tabla usuarios no existe';
    END;
    
    BEGIN
        PERFORM 1 FROM membresias LIMIT 1;
        RAISE NOTICE 'Membresías registradas: %', (SELECT COUNT(*) FROM membresias);
    EXCEPTION WHEN undefined_table THEN
        RAISE NOTICE 'Tabla membresias no existe';
    END;
END $$;

-- 8. Verificar permisos y roles
SELECT 
    current_user as usuario_actual,
    session_user as usuario_sesion,
    current_setting('role') as rol_actual;

-- 9. Recomendaciones
SELECT '=== RECOMENDACIONES ===' as titulo;

SELECT 
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'artistas')
        THEN '🔧 ACCIÓN REQUERIDA: Crear tabla artistas antes de ejecutar el script principal'
        
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'artistas')
        AND NOT EXISTS (
            SELECT 1 
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
            WHERE tc.table_name = 'artistas' 
            AND kcu.column_name = 'user_id' 
            AND tc.constraint_type = 'UNIQUE'
        )
        THEN '🔧 ACCIÓN REQUERIDA: Agregar restricción única a artistas.user_id'
        
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contenido_exclusivo_artista')
        THEN '⚠️ NOTA: La tabla contenido_exclusivo_artista ya existe. El script principal la actualizará.'
        
        ELSE '✅ TODO LISTO: Puede ejecutar el script principal sin problemas'
    END as recomendacion;
