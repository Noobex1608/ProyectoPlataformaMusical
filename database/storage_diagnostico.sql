-- SCRIPT ALTERNATIVO PARA SUPABASE STORAGE RLS
-- Este script usa funciones específicas de Supabase que deberían tener permisos

-- 1. Verificar políticas existentes
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
ORDER BY policyname;

-- 2. Si las políticas anteriores no funcionan, intentar con este enfoque:
-- Verificar si el bucket existe y sus configuraciones
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'contenido-exclusivo';

-- 3. SOLUCIÓN TEMPORAL: Hacer el bucket público para pruebas
-- (Solo para desarrollo - NO para producción)
UPDATE storage.buckets 
SET public = true 
WHERE id = 'contenido-exclusivo';

-- 4. Verificar el resultado
SELECT 
  id,
  name,
  public,
  'Bucket ahora es público - archivos accesibles sin autenticación' as status
FROM storage.buckets 
WHERE id = 'contenido-exclusivo';
