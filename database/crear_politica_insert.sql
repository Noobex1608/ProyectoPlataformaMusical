-- AGREGAR LA POLÍTICA DE INSERT QUE FALTA
-- Este comando debería tener permisos ya que solo CREA, no modifica políticas existentes

-- 1. Crear política de INSERT para permitir subida de archivos
CREATE POLICY "Artistas pueden subir archivos 1pjt2z8_3" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'contenido-exclusivo'::text 
    AND auth.uid() IS NOT NULL
  );

-- 2. Verificar que se creó correctamente
SELECT 
  policyname,
  cmd,
  qual,
  'Nueva política INSERT' as tipo
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname = 'Artistas pueden subir archivos 1pjt2z8_3';

-- 3. Ver todas las políticas del bucket ahora
SELECT 
  policyname,
  cmd,
  qual,
  'Todas las políticas' as estado
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND qual LIKE '%contenido-exclusivo%'
ORDER BY cmd, policyname;
