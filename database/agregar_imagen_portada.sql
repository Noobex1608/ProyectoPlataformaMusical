-- AGREGAR CAMPO imagen_portada a la tabla contenido_exclusivo_artista
-- Este script agrega el campo que falta para almacenar la URL de la imagen de portada

-- 1. Verificar estructura actual de la tabla
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'contenido_exclusivo_artista' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Agregar el campo imagen_portada
ALTER TABLE contenido_exclusivo_artista 
ADD COLUMN imagen_portada TEXT;

-- 3. Agregar comentario al campo
COMMENT ON COLUMN contenido_exclusivo_artista.imagen_portada 
IS 'URL de la imagen de portada del contenido exclusivo';

-- 4. Verificar que el campo se agregó correctamente
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'contenido_exclusivo_artista' 
  AND table_schema = 'public'
  AND column_name = 'imagen_portada';

-- 5. Mostrar estructura final de la tabla
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'contenido_exclusivo_artista' 
  AND table_schema = 'public'
ORDER BY ordinal_position;
