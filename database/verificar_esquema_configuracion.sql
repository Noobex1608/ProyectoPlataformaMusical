-- Script para verificar el estado de la tabla configuracion_artista
-- y preparar datos de prueba compatibles con el esquema existente

-- 1. Verificar que la tabla existe
SELECT table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'configuracion_artista' 
ORDER BY ordinal_position;

-- 2. Verificar si hay artistas existentes para usar como referencia
SELECT id, nombre, created_at 
FROM artistas 
LIMIT 3;

-- 3. Verificar si hay configuraciones existentes
SELECT id, artista_id, created_at
FROM configuracion_artista;

-- 4. Verificar permisos RLS
SELECT schemaname, tablename, rowsecurity
FROM pg_tables 
WHERE tablename = 'configuracion_artista';

-- 5. Ver políticas RLS existentes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'configuracion_artista';
