-- Script para corregir las políticas RLS del bucket contenido-exclusivo
-- Problema: Las políticas actuales requieren que auth.uid() = artistaId
-- Solución: Permitir que artistas suban archivos usando su ID real de la tabla artistas

-- 1. Eliminar políticas existentes que pueden estar causando problemas
DROP POLICY IF EXISTS "Artistas pueden subir a su carpeta" ON storage.objects;
DROP POLICY IF EXISTS "Artistas pueden gestionar sus archivos" ON storage.objects;
DROP POLICY IF EXISTS "Acceso público de lectura" ON storage.objects;

-- 2. Crear políticas más flexibles que permitan a artistas autenticados 
--    subir archivos usando su artistaId real

-- Política para permitir a artistas autenticados subir archivos
CREATE POLICY "Artistas autenticados pueden subir" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'contenido-exclusivo' 
    AND auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM artistas 
      WHERE (artistas.user_id = auth.uid() OR artistas.id::text = auth.uid()::text)
      AND artistas.id::text = (storage.foldername(name))[1]
    )
  );

-- Política alternativa más permisiva para desarrollo (usar solo una de las dos)
CREATE POLICY "Artistas pueden subir a cualquier carpeta (desarrollo)" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'contenido-exclusivo' 
    AND auth.uid() IS NOT NULL
  );

-- Política para permitir a artistas gestionar sus archivos
CREATE POLICY "Artistas pueden gestionar sus archivos relacionados" ON storage.objects
  FOR ALL USING (
    bucket_id = 'contenido-exclusivo' 
    AND auth.uid() IS NOT NULL
    AND (
      -- Permitir si auth.uid coincide con la carpeta
      auth.uid()::text = (storage.foldername(name))[1]
      OR
      -- Permitir si existe relación en tabla artistas
      EXISTS (
        SELECT 1 FROM artistas 
        WHERE (artistas.user_id = auth.uid() OR artistas.id::text = auth.uid()::text)
        AND artistas.id::text = (storage.foldername(name))[1]
      )
    )
  );

-- Política para acceso público de lectura (necesario para mostrar contenido)
CREATE POLICY "Acceso público de lectura" ON storage.objects
  FOR SELECT USING (bucket_id = 'contenido-exclusivo');

-- 3. Verificar que RLS está habilitado
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 4. Verificar las políticas creadas
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
  AND policyname LIKE '%contenido%'
ORDER BY policyname;

-- 5. Diagnóstico: Verificar estructura de artistas
SELECT 
  'Estructura tabla artistas:' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'artistas' 
  AND column_name IN ('id', 'user_id')
ORDER BY ordinal_position;

-- 6. Diagnóstico: Ver algunos registros de artistas para entender la estructura
SELECT 
  'Muestra de datos artistas:' as info,
  id,
  user_id,
  nombre
FROM artistas 
LIMIT 3;

-- 7. ALTERNATIVA TEMPORAL: Si las políticas complejas fallan, usar política simple
-- Descomenta las siguientes líneas para usar una política más permisiva durante desarrollo

/*
-- Eliminar todas las políticas restrictivas
DROP POLICY IF EXISTS "Artistas autenticados pueden subir" ON storage.objects;
DROP POLICY IF EXISTS "Artistas pueden gestionar sus archivos relacionados" ON storage.objects;

-- Crear política simple para desarrollo
CREATE POLICY "Desarrollo - Cualquier usuario autenticado" ON storage.objects
  FOR ALL USING (
    bucket_id = 'contenido-exclusivo' 
    AND auth.uid() IS NOT NULL
  );
*/

-- 8. Verificar buckets existentes
SELECT 
  'Buckets disponibles:' as info,
  id,
  name,
  public,
  file_size_limit
FROM storage.buckets 
WHERE id = 'contenido-exclusivo';
