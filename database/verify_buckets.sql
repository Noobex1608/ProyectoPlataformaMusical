-- Script para verificar configuración de buckets
-- Ejecutar en el SQL Editor de Supabase DESPUÉS de crear los buckets manualmente

-- 1. Verificar buckets existentes
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets 
WHERE name IN ('audio', 'images')
ORDER BY name;

-- 2. Verificar políticas de storage
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
ORDER BY policyname;

-- 3. Verificar RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'storage' 
  AND tablename = 'objects';

-- 4. Contar objetos por bucket (para testing)
SELECT 
  bucket_id,
  COUNT(*) as total_files
FROM storage.objects 
GROUP BY bucket_id
ORDER BY bucket_id;
