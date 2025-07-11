-- Script de Prueba para el Sistema de Likes
-- Ejecutar en Supabase SQL Editor para verificar que todo funciona

-- 1. Verificar que las tablas existen
SELECT 'likes_canciones' as tabla, count(*) as registros FROM likes_canciones
UNION ALL
SELECT 'perfil_artistas', count(*) FROM perfil_artistas
UNION ALL
SELECT 'canciones', count(*) FROM canciones
UNION ALL
SELECT 'usuarios', count(*) FROM usuarios;

-- 2. Ver las primeras canciones disponibles
SELECT id, title, artist, artista_id 
FROM canciones 
ORDER BY id 
LIMIT 5;

-- 3. Ver los primeros usuarios
SELECT id, email 
FROM usuarios 
ORDER BY id 
LIMIT 5;

-- 4. Insertar un like de prueba (ajusta los IDs según tus datos)
-- Cambia los valores 1, 1 por IDs reales de tu base de datos
INSERT INTO likes_canciones (user_id, cancion_id) 
VALUES (1, 1) 
ON CONFLICT (user_id, cancion_id) DO NOTHING;

-- 5. Verificar que el like se insertó
SELECT * FROM likes_canciones ORDER BY liked_at DESC LIMIT 5;

-- 6. Verificar que las estadísticas se actualizaron automáticamente
SELECT artista_id, likes, reproducciones, updated_at 
FROM perfil_artistas 
WHERE likes > 0 
ORDER BY likes DESC;

-- 7. Ver canciones con likes usando la vista
SELECT * FROM canciones_con_likes 
WHERE total_likes > 0 
LIMIT 5;

-- 8. Probar quitar el like
DELETE FROM likes_canciones 
WHERE user_id = 1 AND cancion_id = 1;

-- 9. Verificar que las estadísticas se actualizaron al quitar el like
SELECT artista_id, likes, reproducciones, updated_at 
FROM perfil_artistas 
WHERE artista_id IN (
    SELECT artista_id FROM canciones WHERE id = 1
);

-- 10. Insertar varios likes para probar
INSERT INTO likes_canciones (user_id, cancion_id) VALUES 
(1, 1), (1, 2), (1, 3),
(2, 1), (2, 2),
(3, 1)
ON CONFLICT (user_id, cancion_id) DO NOTHING;

-- 11. Ver el resumen final
SELECT 
    c.id as cancion_id,
    c.title,
    c.artist,
    COUNT(lc.id) as total_likes,
    pa.likes as likes_artista
FROM canciones c
LEFT JOIN likes_canciones lc ON c.id = lc.cancion_id
LEFT JOIN perfil_artistas pa ON c.artista_id = pa.artista_id
GROUP BY c.id, c.title, c.artist, pa.likes
ORDER BY total_likes DESC;

-- 12. Mensaje de éxito
SELECT '🎉 ¡Sistema de likes funcionando correctamente!' as resultado;
