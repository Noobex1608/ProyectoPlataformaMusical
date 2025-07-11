-- Script ULTRA SIMPLE para probar likes
-- Ejecutar en Supabase Query Editor paso a paso

-- 1. Verificar que tenemos datos para probar
SELECT 'Usuarios disponibles:', COUNT(*) FROM usuarios;
SELECT 'Canciones disponibles:', COUNT(*) FROM canciones;

-- 2. Mostrar algunos usuarios y canciones
SELECT id, email FROM usuarios LIMIT 3;
SELECT id, title, artist FROM canciones LIMIT 3;

-- 3. Eliminar tabla likes_canciones si existe
DROP TABLE IF EXISTS likes_canciones CASCADE;

-- 4. Crear tabla simple
CREATE TABLE likes_canciones (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    cancion_id BIGINT NOT NULL,
    liked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, cancion_id)
);

-- 5. Habilitar RLS y crear política permisiva
ALTER TABLE likes_canciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all" ON likes_canciones FOR ALL USING (true) WITH CHECK (true);

-- 6. Probar inserción directa
INSERT INTO likes_canciones (user_id, cancion_id) VALUES (1, 1);

-- 7. Probar inserción con ON CONFLICT
INSERT INTO likes_canciones (user_id, cancion_id) VALUES (1, 1) ON CONFLICT (user_id, cancion_id) DO NOTHING;

-- 8. Verificar datos
SELECT * FROM likes_canciones;

-- 9. Probar eliminación
DELETE FROM likes_canciones WHERE user_id = 1 AND cancion_id = 1;

-- 10. Verificar que se eliminó
SELECT * FROM likes_canciones;

-- 11. Probar inserción de nuevo
INSERT INTO likes_canciones (user_id, cancion_id) VALUES (1, 1);

-- 12. Verificar final
SELECT * FROM likes_canciones;
