-- Script para verificar el estado de likes en Supabase
-- Ejecutar en el Query Editor de Supabase

-- 1. Verificar si la tabla likes_canciones existe
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'likes_canciones'
ORDER BY ordinal_position;

-- 2. Verificar restricciones UNIQUE
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    conkey as constrained_columns,
    confkey as foreign_key_columns
FROM pg_constraint
WHERE conrelid = 'likes_canciones'::regclass;

-- 3. Verificar índices
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'likes_canciones';

-- 4. Verificar triggers
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'likes_canciones';

-- 5. Verificar funciones relacionadas
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines
WHERE routine_name LIKE '%likes%' OR routine_name LIKE '%actualizar%';

-- 6. Verificar datos existentes
SELECT COUNT(*) as total_likes FROM likes_canciones;

-- 7. Verificar estructura de tabla canciones
SELECT 
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'canciones'
AND column_name IN ('id', 'title', 'artist', 'artista_id')
ORDER BY ordinal_position;

-- 8. Verificar estructura de tabla usuarios
SELECT 
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'usuarios'
AND column_name IN ('id', 'name', 'email')
ORDER BY ordinal_position;

-- 9. Verificar políticas RLS
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
WHERE tablename = 'likes_canciones';

-- 10. Verificar si RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    relforcerowsecurity
FROM pg_tables
WHERE tablename = 'likes_canciones';
