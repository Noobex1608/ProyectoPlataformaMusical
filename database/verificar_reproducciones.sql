-- ===============================================
-- VERIFICAR TABLA REPRODUCCIONES
-- ===============================================

-- Verificar si la tabla reproducciones existe
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'reproducciones' 
ORDER BY ordinal_position;

-- Verificar datos en la tabla
SELECT 
    COUNT(*) as total_reproducciones,
    COUNT(DISTINCT cancion_id) as canciones_reproducidas,
    COUNT(DISTINCT user_id) as usuarios_unicos
FROM reproducciones;

-- Ver las últimas 10 reproducciones
SELECT 
    r.id,
    r.user_id,
    r.cancion_id,
    c.title as cancion_titulo,
    c.artist as cancion_artista,
    r.duration_played,
    r.played_at
FROM reproducciones r
LEFT JOIN canciones c ON r.cancion_id = c.id
ORDER BY r.played_at DESC
LIMIT 10;

-- Verificar reproducciones por canción
SELECT 
    c.id,
    c.title,
    c.artist,
    COUNT(r.id) as total_reproducciones,
    AVG(r.duration_played) as duracion_promedio
FROM canciones c
LEFT JOIN reproducciones r ON c.id = r.cancion_id
GROUP BY c.id, c.title, c.artist
ORDER BY total_reproducciones DESC;
