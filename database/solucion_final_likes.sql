-- SCRIPT FINAL: Solución completa para likes
-- Ejecutar PASO A PASO en Supabase Query Editor

-- ===== PASO 1: LIMPIEZA INICIAL =====
-- Eliminar tabla existente si hay problemas
DROP TABLE IF EXISTS likes_canciones CASCADE;

-- ===== PASO 2: CREAR TABLA CORRECTA =====
CREATE TABLE likes_canciones (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    cancion_id BIGINT NOT NULL,
    liked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_user_cancion_like UNIQUE(user_id, cancion_id),
    CONSTRAINT fk_likes_user FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT fk_likes_cancion FOREIGN KEY (cancion_id) REFERENCES canciones(id) ON DELETE CASCADE
);

-- ===== PASO 3: CREAR ÍNDICES =====
CREATE INDEX idx_likes_canciones_user_id ON likes_canciones(user_id);
CREATE INDEX idx_likes_canciones_cancion_id ON likes_canciones(cancion_id);

-- ===== PASO 4: CONFIGURAR RLS =====
ALTER TABLE likes_canciones ENABLE ROW LEVEL SECURITY;

-- Crear política permisiva para desarrollo
CREATE POLICY "allow_all_likes_operations" ON likes_canciones
FOR ALL 
USING (true)
WITH CHECK (true);

-- ===== PASO 5: VERIFICAR TABLAS RELACIONADAS =====
-- Verificar que tenemos datos de prueba
SELECT 'Usuarios:', COUNT(*) FROM usuarios;
SELECT 'Canciones:', COUNT(*) FROM canciones;

-- Mostrar algunos datos para pruebas
SELECT id, email FROM usuarios LIMIT 3;
SELECT id, title, artist FROM canciones LIMIT 3;

-- ===== PASO 6: PROBAR OPERACIONES BÁSICAS =====
-- Insertar like de prueba
INSERT INTO likes_canciones (user_id, cancion_id) VALUES (1, 1);

-- Verificar inserción
SELECT * FROM likes_canciones WHERE user_id = 1 AND cancion_id = 1;

-- Probar ON CONFLICT
INSERT INTO likes_canciones (user_id, cancion_id) VALUES (1, 1) 
ON CONFLICT (user_id, cancion_id) DO NOTHING;

-- Verificar que no se duplicó
SELECT COUNT(*) FROM likes_canciones WHERE user_id = 1 AND cancion_id = 1;

-- Probar eliminación
DELETE FROM likes_canciones WHERE user_id = 1 AND cancion_id = 1;

-- Verificar eliminación
SELECT COUNT(*) FROM likes_canciones WHERE user_id = 1 AND cancion_id = 1;

-- ===== PASO 7: PROBAR OPERACIONES QUE USA EL FRONTEND =====
-- Simular operaciones del frontend

-- 1. Verificar like (no debería existir)
SELECT id FROM likes_canciones WHERE user_id = 1 AND cancion_id = 1 LIMIT 1;

-- 2. Insertar like
INSERT INTO likes_canciones (user_id, cancion_id) VALUES (1, 1);

-- 3. Verificar like (ahora debería existir)
SELECT id FROM likes_canciones WHERE user_id = 1 AND cancion_id = 1 LIMIT 1;

-- 4. Contar likes de la canción
SELECT COUNT(*) FROM likes_canciones WHERE cancion_id = 1;

-- 5. Eliminar like
DELETE FROM likes_canciones WHERE user_id = 1 AND cancion_id = 1;

-- 6. Verificar eliminación
SELECT COUNT(*) FROM likes_canciones WHERE user_id = 1 AND cancion_id = 1;

-- ===== PASO 8: LIMPIAR DATOS DE PRUEBA =====
DELETE FROM likes_canciones;

-- ===== PASO 9: VERIFICACIÓN FINAL =====
-- Verificar estructura final
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'likes_canciones'
ORDER BY ordinal_position;

-- Verificar restricciones
SELECT 
    conname as constraint_name,
    contype as constraint_type
FROM pg_constraint
WHERE conrelid = 'likes_canciones'::regclass;

-- Verificar políticas
SELECT 
    policyname,
    cmd,
    permissive
FROM pg_policies
WHERE tablename = 'likes_canciones';

-- ===== MENSAJE FINAL =====
SELECT 'Tabla likes_canciones creada exitosamente. Listo para usar en el frontend.' as mensaje;
