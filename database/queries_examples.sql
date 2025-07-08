-- ===============================================
-- QUERIES ÚTILES PARA LA PLATAFORMA MUSICAL
-- ===============================================

-- 1. CREAR UN NUEVO USUARIO
INSERT INTO usuarios (name, email, password, type, age, description)
VALUES ('Juan Pérez', 'juan@email.com', 'hashed_password', 'fan', 25, 'Amante de la música rock');

-- 2. CREAR UN ARTISTA
WITH new_user AS (
  INSERT INTO usuarios (name, email, password, type)
  VALUES ('Rock Band', 'rockband@email.com', 'hashed_password', 'artist')
  RETURNING id
)
INSERT INTO artistas (user_id, nombre, genero, pais, descripcion, imagen)
SELECT id, 'Rock Band', 'Rock', 'México', 'Banda de rock alternativo', 'https://example.com/avatar.jpg'
FROM new_user;

-- 3. OBTENER TODOS LOS ARTISTAS CON SUS DATOS DE USUARIO
SELECT 
  a.id as artista_id,
  a.nombre,
  a.genero,
  a.pais,
  a.descripcion,
  u.email,
  u.created_at,
  pa.reproducciones,
  pa.likes,
  pa.seguidores
FROM artistas a
JOIN usuarios u ON a.user_id = u.id
LEFT JOIN perfil_artistas pa ON a.id = pa.artista_id
ORDER BY a.nombre;

-- 4. OBTENER CANCIONES DE UN ARTISTA ESPECÍFICO
SELECT 
  c.*,
  a.nombre as artista_nombre
FROM canciones c
JOIN artistas a ON c.artista_id = a.id
WHERE a.id = 'artist-uuid-here'
ORDER BY c.created_at DESC;

-- 5. CREAR UNA PLAYLIST CON CANCIONES
-- Primero crear la playlist
INSERT INTO playlists (name, description, user_id, is_public)
VALUES ('Mi Playlist Rock', 'Las mejores canciones de rock', 1, true)
RETURNING id;

-- Luego agregar canciones (usando el ID de la playlist creada)
INSERT INTO playlist_canciones (playlist_id, cancion_id, orden)
VALUES 
  (1, 1, 1),
  (1, 2, 2),
  (1, 3, 3);

-- 6. OBTENER PLAYLISTS DE UN USUARIO CON SUS CANCIONES
SELECT 
  p.id as playlist_id,
  p.name as playlist_name,
  p.description,
  c.id as cancion_id,
  c.title,
  c.artist,
  c.duration,
  pc.orden
FROM playlists p
LEFT JOIN playlist_canciones pc ON p.id = pc.playlist_id
LEFT JOIN canciones c ON pc.cancion_id = c.id
WHERE p.user_id = 1
ORDER BY p.id, pc.orden;

-- 7. BUSCAR CANCIONES POR TÍTULO O ARTISTA
SELECT 
  c.*,
  a.nombre as artista_nombre
FROM canciones c
JOIN artistas a ON c.artista_id = a.id
WHERE 
  c.title ILIKE '%rock%' 
  OR c.artist ILIKE '%rock%'
  OR a.nombre ILIKE '%rock%'
ORDER BY c.title;

-- 8. OBTENER TOP 10 CANCIONES MÁS REPRODUCIDAS
SELECT 
  c.title,
  c.artist,
  COUNT(r.id) as total_reproducciones
FROM canciones c
LEFT JOIN reproducciones r ON c.id = r.cancion_id
GROUP BY c.id, c.title, c.artist
ORDER BY total_reproducciones DESC
LIMIT 10;

-- 9. OBTENER ARTISTAS MÁS SEGUIDOS
SELECT 
  a.nombre,
  a.genero,
  COUNT(s.id) as total_seguidores
FROM artistas a
LEFT JOIN seguidores s ON a.id = s.artista_id
GROUP BY a.id, a.nombre, a.genero
ORDER BY total_seguidores DESC;

-- 10. CREAR UN ÁLBUM CON CANCIONES
-- Primero crear el álbum
INSERT INTO albumes (artista_id, titulo, cover_url, release_date)
VALUES ('artist-uuid-here', 'Mi Primer Álbum', 'https://example.com/cover.jpg', EXTRACT(EPOCH FROM NOW()))
RETURNING id;

-- Luego agregar las canciones del álbum
INSERT INTO album_canciones (album_id, cancion_name, orden, imagen_url)
VALUES 
  (1, 'Canción 1', 1, 'https://example.com/song1.jpg'),
  (1, 'Canción 2', 2, 'https://example.com/song2.jpg'),
  (1, 'Canción 3', 3, 'https://example.com/song3.jpg');

-- 11. OBTENER ÁLBUMES DE UN ARTISTA
SELECT 
  al.*,
  a.nombre as artista_nombre,
  COUNT(ac.id) as total_canciones
FROM albumes al
JOIN artistas a ON al.artista_id = a.id
LEFT JOIN album_canciones ac ON al.id = ac.album_id
WHERE al.artista_id = 'artist-uuid-here'
GROUP BY al.id, a.nombre
ORDER BY al.release_date DESC;

-- 12. DAR LIKE A UNA CANCIÓN
INSERT INTO likes_canciones (user_id, cancion_id)
VALUES (1, 1)
ON CONFLICT (user_id, cancion_id) DO NOTHING;

-- 13. SEGUIR A UN ARTISTA
INSERT INTO seguidores (follower_id, artista_id)
VALUES (1, 'artist-uuid-here')
ON CONFLICT (follower_id, artista_id) DO NOTHING;

-- 14. REGISTRAR UNA REPRODUCCIÓN
INSERT INTO reproducciones (user_id, cancion_id, duration_played)
VALUES (1, 1, 180); -- 3 minutos

-- 15. OBTENER EVENTOS PRÓXIMOS
SELECT 
  e.*,
  a.nombre as artista_nombre
FROM eventos e
JOIN artistas a ON e.artista_id = a.id
WHERE e.fecha >= CURRENT_DATE
ORDER BY e.fecha ASC;

-- 16. CREAR UN CLUB DE FANS
INSERT INTO club_fans (name, description, artista_id)
VALUES ('Fan Club Rock Band', 'Club oficial de Rock Band', 'artist-uuid-here')
RETURNING id;

-- Agregar miembros al club
INSERT INTO club_fans_miembros (club_id, user_id, role)
VALUES (1, 1, 'member');

-- 17. OBTENER ESTADÍSTICAS COMPLETAS DE UN ARTISTA
SELECT 
  a.nombre,
  a.genero,
  a.pais,
  (SELECT COUNT(*) FROM canciones WHERE artista_id = a.id) as total_canciones,
  (SELECT COUNT(*) FROM albumes WHERE artista_id = a.id) as total_albumes,
  (SELECT COUNT(*) FROM eventos WHERE artista_id = a.id) as total_eventos,
  (SELECT COUNT(*) FROM seguidores WHERE artista_id = a.id) as total_seguidores,
  (SELECT COUNT(*) FROM club_fans WHERE artista_id = a.id) as total_clubs
FROM artistas a
WHERE a.id = 'artist-uuid-here';

-- 18. BUSCAR USUARIOS POR EMAIL (para login)
SELECT 
  u.*,
  a.id as artista_id,
  a.nombre as artista_nombre
FROM usuarios u
LEFT JOIN artistas a ON u.id = a.user_id
WHERE u.email = 'user@email.com';

-- 19. OBTENER FEED DE ACTIVIDAD RECIENTE
(SELECT 
  'cancion' as tipo,
  c.title as titulo,
  a.nombre as artista,
  c.created_at as fecha
FROM canciones c
JOIN artistas a ON c.artista_id = a.id
ORDER BY c.created_at DESC
LIMIT 5)

UNION ALL

(SELECT 
  'album' as tipo,
  al.titulo,
  a.nombre as artista,
  al.created_at as fecha
FROM albumes al
JOIN artistas a ON al.artista_id = a.id
ORDER BY al.created_at DESC
LIMIT 5)

ORDER BY fecha DESC;

-- 20. LIMPIAR DATOS DE PRUEBA (CUIDADO - SOLO PARA DESARROLLO)
-- DELETE FROM reproducciones;
-- DELETE FROM likes_canciones;
-- DELETE FROM seguidores;
-- DELETE FROM club_fans_miembros;
-- DELETE FROM club_fans;
-- DELETE FROM playlist_canciones;
-- DELETE FROM playlists;
-- DELETE FROM radio_canciones;
-- DELETE FROM radios;
-- DELETE FROM album_canciones;
-- DELETE FROM eventos;
-- DELETE FROM canciones;
-- DELETE FROM albumes;
-- DELETE FROM perfil_artistas;
-- DELETE FROM artistas;
-- DELETE FROM usuarios WHERE email != 'admin@rawbeats.com';

-- ===============================================
-- VIEWS ÚTILES
-- ===============================================

-- View para canciones con información del artista
CREATE OR REPLACE VIEW v_canciones_completas AS
SELECT 
  c.*,
  a.nombre as artista_nombre,
  a.genero as artista_genero,
  a.pais as artista_pais,
  (SELECT COUNT(*) FROM likes_canciones WHERE cancion_id = c.id) as total_likes,
  (SELECT COUNT(*) FROM reproducciones WHERE cancion_id = c.id) as total_reproducciones
FROM canciones c
JOIN artistas a ON c.artista_id = a.id;

-- View para estadísticas de artistas
CREATE OR REPLACE VIEW v_estadisticas_artistas AS
SELECT 
  a.*,
  u.email,
  u.created_at as usuario_creado,
  (SELECT COUNT(*) FROM canciones WHERE artista_id = a.id) as total_canciones,
  (SELECT COUNT(*) FROM albumes WHERE artista_id = a.id) as total_albumes,
  (SELECT COUNT(*) FROM eventos WHERE artista_id = a.id) as total_eventos,
  (SELECT COUNT(*) FROM seguidores WHERE artista_id = a.id) as total_seguidores
FROM artistas a
JOIN usuarios u ON a.user_id = u.id;
