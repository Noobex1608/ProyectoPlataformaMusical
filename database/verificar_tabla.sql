-- Script simple para verificar la tabla contenido_exclusivo_artista

-- 1. Verificar si existe la tabla
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'contenido_exclusivo_artista' 
            AND table_schema = 'public'
        ) 
        THEN '✅ La tabla contenido_exclusivo_artista EXISTE'
        ELSE '❌ La tabla contenido_exclusivo_artista NO EXISTE'
    END as estado_tabla;

-- 2. Si existe, mostrar su estructura
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'contenido_exclusivo_artista'
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar políticas RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'contenido_exclusivo_artista';

-- 4. Contar registros existentes (si la tabla existe)
SELECT COUNT(*) as total_registros 
FROM public.contenido_exclusivo_artista;
