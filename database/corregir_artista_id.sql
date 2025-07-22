-- Script para corregir el tipo de campo artista_id

-- 1. Verificar el tipo actual
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'contenido_exclusivo_artista' 
  AND column_name = 'artista_id';

-- 2. Cambiar el tipo de UUID a TEXT (más flexible para IDs de artista)
ALTER TABLE public.contenido_exclusivo_artista 
ALTER COLUMN artista_id TYPE TEXT;

-- 3. Verificar que el cambio se aplicó
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'contenido_exclusivo_artista' 
  AND column_name = 'artista_id';

-- 4. Insertar datos de prueba con el nuevo formato
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

-- 5. Verificar los datos insertados
SELECT * FROM public.contenido_exclusivo_artista WHERE artista_id = 'artista-123';
