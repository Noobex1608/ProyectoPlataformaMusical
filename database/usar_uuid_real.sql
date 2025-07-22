-- Script alternativo para usar UUIDs reales

-- 1. Insertar datos de prueba con UUIDs válidos
INSERT INTO public.contenido_exclusivo_artista (
    artista_id, 
    contenido_id, 
    tipo_contenido, 
    descripcion, 
    nivel_acceso_requerido,
    activo
) VALUES 
    ('550e8400-e29b-41d4-a716-446655440000', 'cancion_001', 'cancion', 'Mi nueva canción exclusiva', 1, true),
    ('550e8400-e29b-41d4-a716-446655440000', 'video_001', 'video', 'Video detrás de cámaras', 2, true),
    ('550e8400-e29b-41d4-a716-446655440000', 'foto_001', 'foto', 'Sesión de fotos exclusiva', 1, true)
ON CONFLICT DO NOTHING;

-- Y luego usar este UUID en tu URL:
-- http://localhost:4200/?userType=artista&artistaId=550e8400-e29b-41d4-a716-446655440000&section=contenido-exclusivo
