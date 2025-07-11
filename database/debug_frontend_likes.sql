-- Script para debuggear problemas del frontend con likes
-- Ejecutar en Supabase Query Editor

-- 1. Verificar estructura actual de likes_canciones
\d likes_canciones;

-- 2. Verificar políticas RLS
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

-- 3. Verificar que RLS esté habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename = 'likes_canciones';

-- 4. Probar queries que usa el frontend

-- Verificar like (SELECT)
SELECT id FROM likes_canciones WHERE user_id = 1 AND cancion_id = 1 LIMIT 1;

-- Insertar like (INSERT)
INSERT INTO likes_canciones (user_id, cancion_id) VALUES (1, 1);

-- Verificar inserción
SELECT * FROM likes_canciones WHERE user_id = 1 AND cancion_id = 1;

-- Eliminar like (DELETE)
DELETE FROM likes_canciones WHERE user_id = 1 AND cancion_id = 1;

-- Verificar eliminación
SELECT * FROM likes_canciones WHERE user_id = 1 AND cancion_id = 1;

-- 5. Probar upsert
INSERT INTO likes_canciones (user_id, cancion_id) VALUES (1, 1)
ON CONFLICT (user_id, cancion_id) DO NOTHING;

-- 6. Verificar upsert
SELECT * FROM likes_canciones WHERE user_id = 1 AND cancion_id = 1;

-- 7. Contar likes de una canción
SELECT COUNT(*) FROM likes_canciones WHERE cancion_id = 1;

-- 8. Verificar que las FK funcionan
SELECT 
    c.id as cancion_id,
    c.title,
    u.id as user_id,
    u.email
FROM canciones c
CROSS JOIN usuarios u
WHERE c.id = 1 AND u.id = 1;

-- 9. Limpiar datos de prueba
DELETE FROM likes_canciones WHERE user_id = 1 AND cancion_id = 1;
