-- Script para RECREAR la tabla likes_canciones con restricciones correctas
-- Ejecutar en Supabase Query Editor

-- PASO 1: Backup de datos existentes (si existen)
CREATE TABLE IF NOT EXISTS likes_canciones_backup AS
SELECT * FROM likes_canciones;

-- PASO 2: Eliminar tabla existente
DROP TABLE IF EXISTS likes_canciones CASCADE;

-- PASO 3: Crear tabla con restricciones correctas
CREATE TABLE likes_canciones (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    cancion_id BIGINT NOT NULL REFERENCES canciones(id) ON DELETE CASCADE,
    liked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_user_cancion_like UNIQUE(user_id, cancion_id)
);

-- PASO 4: Crear índices
CREATE INDEX idx_likes_canciones_user_id ON likes_canciones(user_id);
CREATE INDEX idx_likes_canciones_cancion_id ON likes_canciones(cancion_id);

-- PASO 5: Restaurar datos (si existían)
INSERT INTO likes_canciones (user_id, cancion_id, liked_at)
SELECT user_id, cancion_id, liked_at
FROM likes_canciones_backup
ON CONFLICT (user_id, cancion_id) DO NOTHING;

-- PASO 6: Limpiar backup
DROP TABLE IF EXISTS likes_canciones_backup;

-- PASO 7: Habilitar RLS
ALTER TABLE likes_canciones ENABLE ROW LEVEL SECURITY;

-- PASO 8: Crear política simple (permitir todo por ahora)
CREATE POLICY "allow_all_likes" ON likes_canciones
FOR ALL 
USING (true)
WITH CHECK (true);

-- PASO 9: Verificar que funciona
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'likes_canciones'
ORDER BY ordinal_position;

-- PASO 10: Verificar restricciones
SELECT 
    conname as constraint_name,
    contype as constraint_type
FROM pg_constraint
WHERE conrelid = 'likes_canciones'::regclass;

-- PASO 11: Probar inserción con ON CONFLICT
INSERT INTO likes_canciones (user_id, cancion_id) VALUES (1, 1)
ON CONFLICT (user_id, cancion_id) DO NOTHING;

-- PASO 12: Verificar que se insertó
SELECT * FROM likes_canciones;
