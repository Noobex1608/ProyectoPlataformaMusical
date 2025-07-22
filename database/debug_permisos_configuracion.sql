-- Script para verificar y corregir permisos RLS en configuracion_artista

-- 1. Verificar el estado actual de RLS
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    CASE WHEN rowsecurity THEN 'RLS HABILITADO' ELSE 'RLS DESHABILITADO' END as estado_rls
FROM pg_tables 
WHERE tablename = 'configuracion_artista';

-- 2. Ver políticas existentes
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'configuracion_artista';

-- 3. Si RLS está causando problemas, temporalmente deshabilitarlo para desarrollo
-- DESCOMENTA ESTAS LÍNEAS SI NECESITAS DESHABILITAR RLS TEMPORALMENTE:

-- ALTER TABLE configuracion_artista DISABLE ROW LEVEL SECURITY;

-- 4. O crear una política más permisiva para desarrollo
-- DESCOMENTA Y EJECUTA ESTAS LÍNEAS SI PREFIERES MANTENER RLS PERO CON POLÍTICA PERMISIVA:

-- DROP POLICY IF EXISTS "Permitir todo acceso a configuracion_artista" ON configuracion_artista;
-- 
-- CREATE POLICY "Permitir acceso completo configuracion_artista" 
-- ON configuracion_artista
-- FOR ALL 
-- USING (true) 
-- WITH CHECK (true);

-- 5. Verificar permisos de la tabla
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges 
WHERE table_name = 'configuracion_artista'
ORDER BY grantee, privilege_type;

-- 6. Test de inserción para verificar que todo funciona
DO $$
BEGIN
    -- Intentar insertar un registro de prueba
    INSERT INTO configuracion_artista (
        artista_id,
        configuracion_general,
        configuracion_contenido,
        configuracion_pagos,
        configuracion_privacidad
    ) VALUES (
        '550e8400-e29b-41d4-a716-446655440000',
        '{"test": true}'::jsonb,
        '{}'::jsonb,
        '{}'::jsonb,
        '{}'::jsonb
    ) ON CONFLICT (artista_id) DO NOTHING;
    
    RAISE NOTICE 'Test de inserción exitoso';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error en test de inserción: %', SQLERRM;
END $$;

-- 7. Verificar que los datos se pueden leer
SELECT 
    'Configuraciones encontradas: ' || COUNT(*) as resultado
FROM configuracion_artista;

-- 8. Test de consulta específica (la que está fallando en tu app)
SELECT 
    id,
    artista_id,
    configuracion_general,
    created_at
FROM configuracion_artista 
WHERE artista_id = '39065e52-e966-45b1-b914-f654bc3013c2'
LIMIT 1;
