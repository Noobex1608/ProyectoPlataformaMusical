-- Script para configurar el bucket de contenido exclusivo en Supabase Storage

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

-- 2. Configurar políticas de seguridad para el bucket
-- Política para permitir a los artistas subir archivos a sus propias carpetas
CREATE POLICY "Artistas pueden subir a su carpeta" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'contenido-exclusivo' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Política para permitir a los artistas ver y gestionar sus archivos
CREATE POLICY "Artistas pueden gestionar sus archivos" ON storage.objects
  FOR ALL USING (
    bucket_id = 'contenido-exclusivo' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Política para permitir acceso público de lectura (necesario para mostrar contenido)
CREATE POLICY "Acceso público de lectura" ON storage.objects
  FOR SELECT USING (bucket_id = 'contenido-exclusivo');

-- 3. Habilitar RLS (Row Level Security) en el bucket
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 4. Verificar que el bucket fue creado correctamente
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets 
WHERE id = 'contenido-exclusivo';

-- 5. Verificar las políticas creadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%contenido%';
