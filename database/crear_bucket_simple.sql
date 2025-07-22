-- Script simplificado para crear el bucket (ejecutar desde el SQL Editor de Supabase)

-- 1. Crear el bucket si no existe
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'contenido-exclusivo',
  'contenido-exclusivo',
  true,
  209715200, -- 200MB en bytes
  ARRAY[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'video/mp4', 'video/webm', 'video/quicktime', 'video/avi',
    'audio/mpeg', 'audio/wav', 'audio/flac', 'audio/mp4', 'audio/ogg',
    'application/pdf', 'text/plain', 'text/html',
    'application/zip', 'application/x-rar-compressed'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- 2. Verificar que el bucket fue creado correctamente
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets 
WHERE id = 'contenido-exclusivo';
