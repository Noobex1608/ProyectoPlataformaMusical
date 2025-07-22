-- VERIFICACIÓN Y CREACIÓN DE TABLAS PARA GESTIÓN DE FANÁTICOS
-- Este script asegura que todas las tablas necesarias existan para la funcionalidad de gestión de fanáticos

-- 1. Verificar estructura de propinas (ya debe existir)
DO $$
BEGIN
    -- Verificar si la tabla propinas existe
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'propinas') THEN
        RAISE NOTICE 'ERROR: La tabla propinas no existe. Ejecute primero monetizacion_schema.sql';
    ELSE
        RAISE NOTICE 'OK: Tabla propinas encontrada';
    END IF;

    -- Verificar si la tabla suscripciones_usuario existe  
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'suscripciones_usuario') THEN
        RAISE NOTICE 'ERROR: La tabla suscripciones_usuario no existe. Ejecute primero monetizacion_schema.sql';
    ELSE
        RAISE NOTICE 'OK: Tabla suscripciones_usuario encontrada';
    END IF;

    -- Verificar si la tabla acceso_contenido existe
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'acceso_contenido') THEN
        RAISE NOTICE 'ERROR: La tabla acceso_contenido no existe. Ejecute primero monetizacion_schema.sql';
    ELSE
        RAISE NOTICE 'OK: Tabla acceso_contenido encontrada';
    END IF;

    -- Verificar si la tabla notificaciones_monetizacion existe
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'notificaciones_monetizacion') THEN
        RAISE NOTICE 'ERROR: La tabla notificaciones_monetizacion no existe. Ejecute primero monetizacion_schema.sql';
    ELSE
        RAISE NOTICE 'OK: Tabla notificaciones_monetizacion encontrada';
    END IF;
END
$$;

-- 2. Crear usuarios de prueba en public.usuarios (tabla usuarios del sistema)
INSERT INTO public.usuarios (id, name, email, password, age, type, auth_id)
VALUES 
  (1000, 'Artista Test', 'artista.test@test.com', '$2a$10$dummy_hash', 25, 'artist', '550e8400-e29b-41d4-a716-446655440000'),
  (1001, 'María González', 'maria.gonzalez@test.com', '$2a$10$dummy_hash', 28, 'fan', '550e8400-e29b-41d4-a716-446655440001'),
  (1002, 'Carlos Rodríguez', 'carlos.rodriguez@test.com', '$2a$10$dummy_hash', 32, 'fan', '550e8400-e29b-41d4-a716-446655440002'),
  (1003, 'Ana López', 'ana.lopez@test.com', '$2a$10$dummy_hash', 24, 'fan', '550e8400-e29b-41d4-a716-446655440003')
ON CONFLICT (id) DO NOTHING;

-- 3. Crear usuarios de prueba en auth.users (para Supabase)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'artista.test@test.com', '$2a$10$dummy_hash', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"nombre":"Artista Test"}'),
  ('550e8400-e29b-41d4-a716-446655440001', 'maria.gonzalez@test.com', '$2a$10$dummy_hash', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"nombre":"María González"}'),
  ('550e8400-e29b-41d4-a716-446655440002', 'carlos.rodriguez@test.com', '$2a$10$dummy_hash', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"nombre":"Carlos Rodríguez"}'),
  ('550e8400-e29b-41d4-a716-446655440003', 'ana.lopez@test.com', '$2a$10$dummy_hash', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"nombre":"Ana López"}')
ON CONFLICT (id) DO NOTHING;

-- 4. Crear artista de prueba (usando la estructura correcta de la tabla artistas)
INSERT INTO public.artistas (id, user_id, nombre, genero, pais, descripcion)
VALUES ('550e8400-e29b-41d4-a716-446655440000', 1000, 'Artista Test', 'Pop', 'México', 'Artista de prueba para testing de gestión de fanáticos')
ON CONFLICT (id) DO NOTHING;

-- 5. Insertar datos de prueba para fanáticos (después de crear usuarios y artista)
INSERT INTO propinas (fan_id, nombre_fan, artista_id, cantidad, monto, mensaje, estado, comision, monto_neto, publico_en_feed)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'María González', '550e8400-e29b-41d4-a716-446655440000', 25.00, 25.00, '¡Me encanta tu música!', 'procesada', 2.50, 22.50, true),
  ('550e8400-e29b-41d4-a716-446655440002', 'Carlos Rodríguez', '550e8400-e29b-41d4-a716-446655440000', 15.00, 15.00, 'Sigue así!', 'procesada', 1.50, 13.50, true),
  ('550e8400-e29b-41d4-a716-446655440003', 'Ana López', '550e8400-e29b-41d4-a716-446655440000', 10.00, 10.00, 'Excelente trabajo', 'procesada', 1.00, 9.00, true),
  ('550e8400-e29b-41d4-a716-446655440001', 'María González', '550e8400-e29b-41d4-a716-446655440000', 30.00, 30.00, 'Para tu nuevo álbum', 'procesada', 3.00, 27.00, true),
  ('550e8400-e29b-41d4-a716-446655440002', 'Carlos Rodríguez', '550e8400-e29b-41d4-a716-446655440000', 20.00, 20.00, '¡Increíble concierto!', 'procesada', 2.00, 18.00, true)
ON CONFLICT DO NOTHING;

-- 6. Insertar membresías de prueba (si no existen)
INSERT INTO membresias (nombre, descripcion, precio, artista_id, duracion_dias, activa)
VALUES 
  ('Fan Básico', 'Acceso a contenido exclusivo básico', 9.99, '550e8400-e29b-41d4-a716-446655440000', 30, true),
  ('Super Fan', 'Acceso premium con beneficios especiales', 19.99, '550e8400-e29b-41d4-a716-446655440000', 30, true),
  ('VIP Fan', 'Acceso total VIP con encuentros virtuales', 49.99, '550e8400-e29b-41d4-a716-446655440000', 30, true)
ON CONFLICT DO NOTHING;

-- 7. Insertar suscripciones de prueba
INSERT INTO suscripciones_usuario (usuario_id, artista_id, membresia_id, fecha_inicio, fecha_fin, activa, precio_pagado)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 3, NOW() - INTERVAL '15 days', NOW() + INTERVAL '15 days', true, 49.99),
  ('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 2, NOW() - INTERVAL '10 days', NOW() + INTERVAL '20 days', true, 19.99),
  ('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 1, NOW() - INTERVAL '5 days', NOW() + INTERVAL '25 days', true, 9.99),
  ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 2, NOW() - INTERVAL '60 days', NOW() - INTERVAL '30 days', false, 19.99)
ON CONFLICT DO NOTHING;

-- 8. Insertar accesos de contenido de prueba
INSERT INTO acceso_contenido (usuario_id, artista_id, contenido_id, tipo_acceso, membresia_usada, fecha_acceso)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 1, 'membresia', 3, NOW() - INTERVAL '1 day'),
  ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 2, 'membresia', 3, NOW() - INTERVAL '2 days'),
  ('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 1, 'membresia', 2, NOW() - INTERVAL '3 days'),
  ('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 1, 'membresia', 1, NOW() - INTERVAL '4 days')
ON CONFLICT DO NOTHING;

-- 9. Crear vista para estadísticas rápidas de fanáticos
CREATE OR REPLACE VIEW estadisticas_fanaticos AS
SELECT 
  artista_id,
  
  -- Conteo total de fanáticos únicos
  (SELECT COUNT(DISTINCT fan_id) FROM propinas WHERE artista_id = p.artista_id) +
  (SELECT COUNT(DISTINCT usuario_id) FROM suscripciones_usuario WHERE artista_id = p.artista_id) as total_fanaticos,
  
  -- Fanáticos activos (con actividad en último mes)
  (SELECT COUNT(DISTINCT fan_id) FROM propinas 
   WHERE artista_id = p.artista_id AND created_at >= NOW() - INTERVAL '30 days') +
  (SELECT COUNT(DISTINCT usuario_id) FROM suscripciones_usuario 
   WHERE artista_id = p.artista_id AND activa = true) as fanaticos_activos,
  
  -- Ingresos totales
  (SELECT COALESCE(SUM(monto_neto), 0) FROM propinas WHERE artista_id = p.artista_id AND estado = 'procesada') +
  (SELECT COALESCE(SUM(precio_pagado), 0) FROM suscripciones_usuario WHERE artista_id = p.artista_id) as ingresos_totales,
  
  -- Conteo de propinas
  (SELECT COUNT(*) FROM propinas WHERE artista_id = p.artista_id AND estado = 'procesada') as total_propinas,
  
  -- Conteo de suscripciones
  (SELECT COUNT(*) FROM suscripciones_usuario WHERE artista_id = p.artista_id) as total_suscripciones
  
FROM (SELECT DISTINCT artista_id FROM propinas 
      UNION SELECT DISTINCT artista_id FROM suscripciones_usuario) as p
GROUP BY artista_id;

-- 10. Función para calcular nivel de fanático
CREATE OR REPLACE FUNCTION calcular_nivel_fanatico(
  p_membresias_activas INTEGER,
  p_propinas_cantidad INTEGER,
  p_contenido_accedido INTEGER
) RETURNS TEXT AS $$
BEGIN
  DECLARE
    puntos INTEGER;
  BEGIN
    puntos := (p_membresias_activas * 10) + (p_propinas_cantidad * 2) + (p_contenido_accedido * 1);
    
    IF puntos >= 50 THEN
      RETURN 'vip';
    ELSIF puntos >= 25 THEN
      RETURN 'superfan';
    ELSIF puntos >= 10 THEN
      RETURN 'regular';
    ELSE
      RETURN 'casual';
    END IF;
  END;
END;
$$ LANGUAGE plpgsql;

-- 11. Verificación final
SELECT 'OK: Setup de gestión de fanáticos completado' as status;

-- Ver estadísticas de ejemplo
SELECT * FROM estadisticas_fanaticos LIMIT 5;
