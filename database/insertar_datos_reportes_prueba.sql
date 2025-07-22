-- SCRIPT PARA INSERTAR DATOS DE PRUEBA PARA REPORTES DE INGRESOS
-- Ejecutar este script para tener datos de muestra

-- 1. Insertar un artista de prueba (si no existe)
INSERT INTO artistas (id, nombre, genero, pais, descripcion, created_at)
VALUES 
  ('123e4567-e89b-12d3-a456-426614174000'::uuid, 'Artista Demo', 'Rock', 'México', 'Artista de prueba para reportes', now())
ON CONFLICT (id) DO UPDATE SET updated_at = now();

-- 2. Insertar membresías para el artista
INSERT INTO membresias (id, nombre, descripcion, precio, artista_id, duracion_dias, activa, created_at)
VALUES 
  (1, 'Membresía Básica', 'Acceso básico al contenido', 9.99, '123e4567-e89b-12d3-a456-426614174000'::uuid, 30, true, now()),
  (2, 'Membresía Premium', 'Acceso completo + beneficios extra', 19.99, '123e4567-e89b-12d3-a456-426614174000'::uuid, 30, true, now())
ON CONFLICT (id) DO UPDATE SET updated_at = now();

-- 3. Insertar suscripciones de usuario (últimos 30 días)
INSERT INTO suscripciones_usuario (usuario_id, artista_id, membresia_id, fecha_inicio, fecha_fin, activa, precio_pagado, created_at)
VALUES 
  -- Hace 25 días
  ('user1'::uuid, '123e4567-e89b-12d3-a456-426614174000'::uuid, 1, now() - interval '25 days', now() + interval '5 days', true, 9.99, now() - interval '25 days'),
  -- Hace 20 días
  ('user2'::uuid, '123e4567-e89b-12d3-a456-426614174000'::uuid, 2, now() - interval '20 days', now() + interval '10 days', true, 19.99, now() - interval '20 days'),
  -- Hace 15 días
  ('user3'::uuid, '123e4567-e89b-12d3-a456-426614174000'::uuid, 1, now() - interval '15 days', now() + interval '15 days', true, 9.99, now() - interval '15 days'),
  -- Hace 10 días
  ('user4'::uuid, '123e4567-e89b-12d3-a456-426614174000'::uuid, 2, now() - interval '10 days', now() + interval '20 days', true, 19.99, now() - interval '10 days'),
  -- Hace 5 días
  ('user5'::uuid, '123e4567-e89b-12d3-a456-426614174000'::uuid, 1, now() - interval '5 days', now() + interval '25 days', true, 9.99, now() - interval '5 days');

-- 4. Insertar propinas (últimos 30 días)
INSERT INTO propinas (fan_id, nombre_fan, artista_id, cantidad, monto, mensaje, fecha, monto_neto, comision, created_at)
VALUES 
  -- Hace 28 días
  ('fan1'::uuid, 'Fan Número 1', '123e4567-e89b-12d3-a456-426614174000'::uuid, 1, 5.00, '¡Gran música!', now() - interval '28 days', 4.50, 0.50, now() - interval '28 days'),
  -- Hace 24 días
  ('fan2'::uuid, 'Fan Número 2', '123e4567-e89b-12d3-a456-426614174000'::uuid, 1, 10.00, 'Sigue así', now() - interval '24 days', 9.00, 1.00, now() - interval '24 days'),
  -- Hace 18 días
  ('fan3'::uuid, 'Fan Número 3', '123e4567-e89b-12d3-a456-426614174000'::uuid, 1, 25.00, 'Eres increíble', now() - interval '18 days', 22.50, 2.50, now() - interval '18 days'),
  -- Hace 12 días
  ('fan4'::uuid, 'Fan Número 4', '123e4567-e89b-12d3-a456-426614174000'::uuid, 1, 15.00, 'Más canciones por favor', now() - interval '12 days', 13.50, 1.50, now() - interval '12 days'),
  -- Hace 6 días
  ('fan5'::uuid, 'Fan Número 5', '123e4567-e89b-12d3-a456-426614174000'::uuid, 1, 7.50, 'Genial como siempre', now() - interval '6 days', 6.75, 0.75, now() - interval '6 days'),
  -- Hace 3 días
  ('fan6'::uuid, 'Fan Número 6', '123e4567-e89b-12d3-a456-426614174000'::uuid, 1, 20.00, 'Para tu nuevo álbum', now() - interval '3 days', 18.00, 2.00, now() - interval '3 days'),
  -- Ayer
  ('fan7'::uuid, 'Fan Número 7', '123e4567-e89b-12d3-a456-426614174000'::uuid, 1, 12.00, 'Te apoyamos siempre', now() - interval '1 day', 10.80, 1.20, now() - interval '1 day');

-- 5. Insertar transacciones (últimos 30 días)
INSERT INTO transacciones (usuario_id, artista_id, tipo, referencia_id, descripcion, concepto, monto, monto_comision, monto_neto, fecha, estado, metodo_pago, created_at)
VALUES 
  -- Hace 22 días - Contenido exclusivo
  ('user6'::uuid, '123e4567-e89b-12d3-a456-426614174000'::uuid, 'contenido_exclusivo', 1, 'Acceso a canción exclusiva', 'Compra de contenido', 4.99, 0.50, 4.49, now() - interval '22 days', 'procesada', 'tarjeta', now() - interval '22 days'),
  -- Hace 16 días - Contenido exclusivo
  ('user7'::uuid, '123e4567-e89b-12d3-a456-426614174000'::uuid, 'contenido_exclusivo', 2, 'Acceso a álbum exclusivo', 'Compra de contenido', 12.99, 1.30, 11.69, now() - interval '16 days', 'procesada', 'tarjeta', now() - interval '16 days'),
  -- Hace 8 días - Contenido exclusivo
  ('user8'::uuid, '123e4567-e89b-12d3-a456-426614174000'::uuid, 'contenido_exclusivo', 3, 'Acceso a video exclusivo', 'Compra de contenido', 7.99, 0.80, 7.19, now() - interval '8 days', 'procesada', 'paypal', now() - interval '8 days'),
  -- Hace 4 días - Contenido exclusivo
  ('user9'::uuid, '123e4567-e89b-12d3-a456-426614174000'::uuid, 'contenido_exclusivo', 4, 'Paquete de contenido', 'Compra de contenido', 15.99, 1.60, 14.39, now() - interval '4 days', 'procesada', 'tarjeta', now() - interval '4 days');

-- 6. Verificar los datos insertados
SELECT 
  '✅ Membresías activas' as tabla,
  COUNT(*) as total
FROM suscripciones_usuario 
WHERE artista_id = '123e4567-e89b-12d3-a456-426614174000'::uuid 
  AND activa = true
  AND fecha_inicio >= now() - interval '30 days';

SELECT 
  '✅ Propinas últimos 30 días' as tabla,
  COUNT(*) as total,
  SUM(monto_neto) as total_neto
FROM propinas 
WHERE artista_id = '123e4567-e89b-12d3-a456-426614174000'::uuid 
  AND fecha >= now() - interval '30 days';

SELECT 
  '✅ Transacciones últimos 30 días' as tabla,
  COUNT(*) as total,
  SUM(monto_neto) as total_neto
FROM transacciones 
WHERE artista_id = '123e4567-e89b-12d3-a456-426614174000'::uuid 
  AND fecha >= now() - interval '30 days';

-- 7. Mostrar resumen de ingresos para verificación
SELECT 
  'RESUMEN INGRESOS ÚLTIMOS 30 DÍAS' as resumen,
  COALESCE((
    SELECT SUM(precio_pagado) 
    FROM suscripciones_usuario 
    WHERE artista_id = '123e4567-e89b-12d3-a456-426614174000'::uuid 
      AND fecha_inicio >= now() - interval '30 days'
  ), 0) as ingresos_membresias,
  COALESCE((
    SELECT SUM(monto_neto) 
    FROM propinas 
    WHERE artista_id = '123e4567-e89b-12d3-a456-426614174000'::uuid 
      AND fecha >= now() - interval '30 days'
  ), 0) as ingresos_propinas,
  COALESCE((
    SELECT SUM(monto_neto) 
    FROM transacciones 
    WHERE artista_id = '123e4567-e89b-12d3-a456-426614174000'::uuid 
      AND fecha >= now() - interval '30 days'
  ), 0) as ingresos_contenido;
