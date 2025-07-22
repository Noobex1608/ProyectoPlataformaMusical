-- SOLUCIÓN: Políticas RLS para tabla contenido_exclusivo_artista
-- Este script arregla los permisos para que los artistas puedan insertar contenido

-- 1. Verificar si la tabla tiene RLS habilitado
SELECT 
  tablename,
  rowsecurity as rls_habilitado
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'contenido_exclusivo_artista';

-- 2. Eliminar políticas existentes conflictivas
DROP POLICY IF EXISTS "Users can insert their own content" ON contenido_exclusivo_artista;
DROP POLICY IF EXISTS "Artists can manage their content" ON contenido_exclusivo_artista;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON contenido_exclusivo_artista;

-- 3. Crear política SÚPER PERMISIVA para INSERT (desarrollo)
CREATE POLICY "Permitir insertar contenido exclusivo - desarrollo"
ON contenido_exclusivo_artista FOR INSERT
WITH CHECK (true);

-- 4. Crear política SÚPER PERMISIVA para SELECT (desarrollo)
CREATE POLICY "Permitir leer contenido exclusivo - desarrollo"
ON contenido_exclusivo_artista FOR SELECT
USING (true);

-- 5. Crear política para permitir UPDATE al propietario
CREATE POLICY "Permitir actualizar contenido propio"
ON contenido_exclusivo_artista FOR UPDATE
TO authenticated
USING (artista_id = auth.uid())
WITH CHECK (artista_id = auth.uid());

-- 6. Crear política para permitir DELETE al propietario
CREATE POLICY "Permitir eliminar contenido propio"
ON contenido_exclusivo_artista FOR DELETE
TO authenticated
USING (artista_id = auth.uid());

-- 7. Verificar las nuevas políticas
SELECT 
  'Políticas creadas para contenido_exclusivo_artista' as status,
  policyname,
  cmd as operacion,
  roles
FROM pg_policies 
WHERE tablename = 'contenido_exclusivo_artista' 
  AND schemaname = 'public'
ORDER BY cmd;

-- 8. Verificar estructura de la tabla para confirmar columnas
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'contenido_exclusivo_artista' 
  AND table_schema = 'public'
ORDER BY ordinal_position;
