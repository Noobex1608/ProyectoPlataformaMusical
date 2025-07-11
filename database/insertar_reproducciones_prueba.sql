-- Script para insertar reproducciones de prueba
-- Asegúrate de tener datos en las tablas 'usuarios' y 'canciones' antes de ejecutar

-- Insertar reproducciones de prueba
-- Nota: Ajusta los user_id y cancion_id según los datos que tengas en tu base de datos

INSERT INTO reproducciones (user_id, cancion_id, played_at, duration_played)
VALUES 
  -- Reproduce varias veces las mismas canciones para simular popularidad
  (1, 1, NOW() - INTERVAL '1 day', 180),
  (1, 1, NOW() - INTERVAL '2 days', 200),
  (1, 2, NOW() - INTERVAL '3 days', 150),
  (2, 1, NOW() - INTERVAL '1 hour', 190),
  (2, 2, NOW() - INTERVAL '2 hours', 210),
  (2, 2, NOW() - INTERVAL '4 hours', 180),
  (3, 1, NOW() - INTERVAL '30 minutes', 200),
  (3, 3, NOW() - INTERVAL '1 hour', 160),
  (4, 2, NOW() - INTERVAL '2 hours', 220),
  (4, 3, NOW() - INTERVAL '3 hours', 170),
  (5, 1, NOW() - INTERVAL '6 hours', 185),
  (5, 3, NOW() - INTERVAL '12 hours', 165)
ON CONFLICT DO NOTHING;

-- Verificar que las reproducciones se insertaron correctamente
SELECT 
  r.cancion_id,
  c.title as cancion_titulo,
  c.artist as artista,
  COUNT(r.id) as total_reproducciones,
  AVG(r.duration_played) as promedio_duracion
FROM reproducciones r
JOIN canciones c ON r.cancion_id = c.id
GROUP BY r.cancion_id, c.title, c.artist
ORDER BY total_reproducciones DESC;

-- Verificar reproducciones por artista
SELECT 
  c.artista_id,
  c.artist as artista,
  COUNT(r.id) as total_reproducciones
FROM reproducciones r
JOIN canciones c ON r.cancion_id = c.id
GROUP BY c.artista_id, c.artist
ORDER BY total_reproducciones DESC;
