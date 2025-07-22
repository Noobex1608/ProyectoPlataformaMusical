-- SOLUCIÓN DEFINITIVA: Bucket completamente público
-- Esto eliminará todas las restricciones RLS para el bucket 'contenido-exclusivo'

-- 1. Eliminar todas las políticas existentes para el bucket
DROP POLICY IF EXISTS "Allow public uploads to contenido-exclusivo" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to contenido-exclusivo" ON storage.objects;
DROP POLICY IF EXISTS "Public read access to contenido-exclusivo" ON storage.objects;
DROP POLICY IF EXISTS "Public write access to contenido-exclusivo" ON storage.objects;

-- 2. Crear políticas completamente públicas (sin restricciones)
-- Política para subir archivos (INSERT)
CREATE POLICY "Contenido exclusivo - Public insert"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'contenido-exclusivo');

-- Política para leer archivos (SELECT)
CREATE POLICY "Contenido exclusivo - Public select"
ON storage.objects FOR SELECT
USING (bucket_id = 'contenido-exclusivo');

-- Política para actualizar archivos (UPDATE)
CREATE POLICY "Contenido exclusivo - Public update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'contenido-exclusivo')
WITH CHECK (bucket_id = 'contenido-exclusivo');

-- Política para eliminar archivos (DELETE)
CREATE POLICY "Contenido exclusivo - Public delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'contenido-exclusivo');

-- 3. Verificar que el bucket esté configurado como público
UPDATE storage.buckets 
SET public = true 
WHERE id = 'contenido-exclusivo';

-- 4. Verificación final
SELECT 
  'Bucket configurado como público' as status,
  public 
FROM storage.buckets 
WHERE id = 'contenido-exclusivo';

SELECT 
  'Políticas creadas' as status,
  policyname,
  cmd as operacion
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%Contenido exclusivo%'
ORDER BY cmd;
