-- Verificar si la imagen_portada se está guardando correctamente
-- Este script nos ayuda a diagnosticar el problema

-- 1. Ver todos los registros de contenido exclusivo con sus imágenes
SELECT 
  id,
  contenido_id,
  descripcion,
  tipo_contenido,
  imagen_portada,
  created_at
FROM contenido_exclusivo_artista 
ORDER BY created_at DESC 
LIMIT 10;

-- 2. Verificar específicamente el registro "Wow"
SELECT 
  id,
  contenido_id,
  descripcion,
  tipo_contenido,
  imagen_portada,
  LENGTH(imagen_portada) as longitud_url,
  created_at
FROM contenido_exclusivo_artista 
WHERE descripcion = 'Wow'
ORDER BY created_at DESC;
