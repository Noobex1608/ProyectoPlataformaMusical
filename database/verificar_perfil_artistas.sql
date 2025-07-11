-- Script para verificar y corregir la tabla perfil_artistas
-- Ejecutar en Supabase Query Editor

-- ===== VERIFICAR ESTRUCTURA ACTUAL =====
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'perfil_artistas'
ORDER BY ordinal_position;

-- ===== VERIFICAR RESTRICCIONES =====
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    condeferrable,
    condeferred
FROM pg_constraint
WHERE conrelid = 'perfil_artistas'::regclass;

-- ===== VERIFICAR ÍNDICES =====
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'perfil_artistas';

-- ===== VERIFICAR DATOS EXISTENTES =====
SELECT 
    id,
    artista_id,
    likes,
    reproducciones,
    seguidores,
    created_at,
    updated_at
FROM perfil_artistas
ORDER BY updated_at DESC
LIMIT 10;

-- ===== CORREGIR CONFLICTOS SI ES NECESARIO =====
-- Si hay duplicados, eliminar los registros duplicados manteniendo el más reciente
WITH duplicates AS (
    SELECT 
        artista_id,
        COUNT(*) as count_records,
        MIN(id) as min_id
    FROM perfil_artistas
    GROUP BY artista_id
    HAVING COUNT(*) > 1
)
DELETE FROM perfil_artistas 
WHERE id IN (
    SELECT p.id 
    FROM perfil_artistas p
    INNER JOIN duplicates d ON p.artista_id = d.artista_id
    WHERE p.id != d.min_id
);

-- ===== ASEGURAR ÍNDICE ÚNICO =====
-- Recrear el índice único si es necesario
DROP INDEX IF EXISTS idx_perfil_artistas_artista_id;
CREATE UNIQUE INDEX idx_perfil_artistas_artista_id 
ON perfil_artistas(artista_id);

-- ===== VERIFICAR RESULTADO FINAL =====
SELECT 
    COUNT(*) as total_registros,
    COUNT(DISTINCT artista_id) as artistas_unicos
FROM perfil_artistas;

-- Si total_registros = artistas_unicos, entonces no hay duplicados
SELECT 'Verificación completada' as mensaje;
