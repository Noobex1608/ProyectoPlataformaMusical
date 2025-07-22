-- SCRIPT SIMPLE PARA CORREGIR RLS CONTENIDO-EXCLUSIVO
-- Ejecutar en Supabase SQL Editor

-- 1. Eliminar políticas problemáticas existentes
DROP POLICY IF EXISTS "Artistas pueden subir a su carpeta" ON storage.objects;
DROP POLICY IF EXISTS "Artistas pueden gestionar sus archivos" ON storage.objects;
DROP POLICY IF EXISTS "Acceso público de lectura" ON storage.objects;

-- 2. Crear política SIMPLE para desarrollo - CUALQUIER usuario autenticado puede subir
CREATE POLICY "Desarrollo - Usuarios autenticados pueden subir" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'contenido-exclusivo' 
    AND auth.uid() IS NOT NULL
  );

-- 3. Crear política SIMPLE para gestión - CUALQUIER usuario autenticado puede gestionar sus archivos
CREATE POLICY "Desarrollo - Usuarios autenticados pueden gestionar" ON storage.objects
  FOR ALL USING (
    bucket_id = 'contenido-exclusivo' 
    AND auth.uid() IS NOT NULL
  );

-- 4. Política para acceso público de lectura (necesario para mostrar contenido)
CREATE POLICY "Acceso público de lectura" ON storage.objects
  FOR SELECT USING (bucket_id = 'contenido-exclusivo');

-- 5. Verificar que RLS está habilitado
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 6. Verificar las políticas creadas
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%desarrollo%' OR policyname LIKE '%contenido%'
ORDER BY policyname;
