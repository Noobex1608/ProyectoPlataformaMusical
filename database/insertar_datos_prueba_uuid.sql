-- Script para crear datos de prueba con UUIDs reales
-- monetizacionSegundoParcial\database\insertar_datos_prueba_uuid.sql

-- 1. Crear usuario artista de prueba con UUID real
INSERT INTO usuarios (id, email, name, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'artista.prueba@test.com',
  'Artista de Prueba',
  NOW(),
  NOW()
) 
ON CONFLICT (email) DO UPDATE SET 
  name = EXCLUDED.name,
  updated_at = NOW();

-- 2. Obtener el UUID del usuario creado e insertar perfil de artista
DO $$
DECLARE
  artista_uuid UUID;
BEGIN
  -- Obtener el UUID del usuario
  SELECT id INTO artista_uuid 
  FROM usuarios 
  WHERE email = 'artista.prueba@test.com';
  
  -- Insertar perfil de artista
  INSERT INTO artistas (id, user_id, nombre_artistico, genero_musical, descripcion, created_at, updated_at)
  VALUES (
    artista_uuid,
    artista_uuid,
    'Artista Prueba',
    'Pop',
    'Artista de prueba para desarrollo',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    nombre_artistico = EXCLUDED.nombre_artistico,
    updated_at = NOW();
  
  -- Insertar algunos contenidos de prueba
  INSERT INTO contenido_exclusivo_artista (
    id,
    artista_id,
    contenido_id,
    tipo_contenido,
    descripcion,
    nivel_acceso_requerido,
    precio_individual,
    activo,
    created_at,
    updated_at
  ) VALUES 
  (
    gen_random_uuid(),
    artista_uuid,
    'contenido_' || extract(epoch from now())::text,
    'foto',
    'Foto exclusiva detrás de cámaras',
    1,
    5.00,
    true,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    artista_uuid,
    'contenido_' || (extract(epoch from now()) + 1)::text,
    'video',
    'Video del proceso de grabación',
    2,
    10.00,
    true,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    artista_uuid,
    'contenido_' || (extract(epoch from now()) + 2)::text,
    'cancion',
    'Versión acústica exclusiva',
    3,
    15.00,
    true,
    NOW(),
    NOW()
  )
  ON CONFLICT (contenido_id) DO NOTHING;
  
  -- Mostrar el UUID del artista creado
  RAISE NOTICE 'UUID del artista creado: %', artista_uuid;
  
END $$;

-- 3. Verificar los datos insertados
SELECT 
  u.id as usuario_id,
  u.email,
  u.name,
  a.nombre_artistico,
  COUNT(c.id) as contenidos_count
FROM usuarios u
JOIN artistas a ON u.id = a.user_id
LEFT JOIN contenido_exclusivo_artista c ON a.id = c.artista_id
WHERE u.email = 'artista.prueba@test.com'
GROUP BY u.id, u.email, u.name, a.nombre_artistico;

-- 4. Listar contenidos creados
SELECT 
  c.id,
  c.artista_id,
  c.contenido_id,
  c.tipo_contenido,
  c.descripcion,
  c.nivel_acceso_requerido,
  c.precio_individual,
  c.activo
FROM contenido_exclusivo_artista c
JOIN artistas a ON c.artista_id = a.id
JOIN usuarios u ON a.user_id = u.id
WHERE u.email = 'artista.prueba@test.com';
