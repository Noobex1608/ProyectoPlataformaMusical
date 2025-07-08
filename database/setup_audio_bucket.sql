-- Script para configurar bucket de audio en Supabase
-- Ejecutar en el SQL Editor de Supabase

-- 1. Crear bucket 'audio' si no existe
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'audio',
  'audio',
  true,
  52428800, -- 50MB limit
  ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/aac', 'audio/flac']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Políticas de acceso para el bucket 'audio'

-- Permitir lectura pública (para reproducir audios)
CREATE POLICY "Permitir lectura pública de audios" ON storage.objects
FOR SELECT USING (bucket_id = 'audio');

-- Permitir subida de audios (por ahora público, después se puede restringir por usuario)
CREATE POLICY "Permitir subida de audios" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'audio');

-- Permitir actualización de audios
CREATE POLICY "Permitir actualización de audios" ON storage.objects
FOR UPDATE USING (bucket_id = 'audio');

-- Permitir eliminación de audios
CREATE POLICY "Permitir eliminación de audios" ON storage.objects
FOR DELETE USING (bucket_id = 'audio');

-- 3. Habilitar RLS en storage.objects si no está habilitado
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 4. Verificación de buckets existentes
SELECT * FROM storage.buckets WHERE name IN ('audio', 'images');

-- 5. Verificación de políticas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%audio%';
