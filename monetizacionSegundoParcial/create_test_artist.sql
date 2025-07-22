-- Script para crear artista de prueba con UUID específico
-- Este script debe ejecutarse en Supabase para tener un artista real

INSERT INTO artistas (
  id,
  nombre,
  email,
  biografia,
  genero_musical,
  pais,
  ciudad,
  fecha_nacimiento,
  activo,
  verificado
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'Artista de Prueba Monetización',
  'artista.prueba.monetizacion@test.com',
  'Artista creado para pruebas del módulo de monetización',
  'Pop',
  'España',
  'Madrid',
  '1990-01-01',
  true,
  true
) ON CONFLICT (id) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  email = EXCLUDED.email,
  updated_at = NOW();

-- Verificar que se insertó correctamente
SELECT * FROM artistas WHERE id = '550e8400-e29b-41d4-a716-446655440000';
