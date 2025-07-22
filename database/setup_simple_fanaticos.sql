-- SCRIPT SIMPLIFICADO PARA GESTIÓN DE FANÁTICOS
-- Este script crea las tablas mínimas necesarias y datos de prueba

-- 1. Crear tabla propinas (simplificada)
CREATE TABLE IF NOT EXISTS propinas (
  id SERIAL PRIMARY KEY,
  usuario_id UUID,
  artista_id UUID,
  monto DECIMAL(10,2) NOT NULL DEFAULT 0,
  fecha TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Crear tabla suscripciones_usuario (simplificada)
CREATE TABLE IF NOT EXISTS suscripciones_usuario (
  id SERIAL PRIMARY KEY,
  usuario_id UUID NOT NULL,
  artista_id UUID,
  tipo_suscripcion TEXT DEFAULT 'basica',
  activa BOOLEAN DEFAULT true,
  fecha_inicio TIMESTAMPTZ DEFAULT NOW(),
  fecha_fin TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days'
);

-- 3. Crear tabla acceso_contenido (simplificada)
CREATE TABLE IF NOT EXISTS acceso_contenido (
  id SERIAL PRIMARY KEY,
  usuario_id UUID NOT NULL,
  artista_id UUID,
  contenido_id INTEGER,
  fecha_acceso TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Crear tabla usuarios (simplificada)
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT,
  email TEXT,
  auth_id UUID
);

-- 5. Crear tabla notificaciones_monetizacion (simplificada)
CREATE TABLE IF NOT EXISTS notificaciones_monetizacion (
  id SERIAL PRIMARY KEY,
  artista_id UUID,
  usuario_id UUID,
  mensaje TEXT,
  tipo TEXT DEFAULT 'agradecimiento',
  fecha_envio TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Insertar usuarios de prueba
INSERT INTO usuarios (id, nombre, email, auth_id) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'María González', 'maria@email.com', '550e8400-e29b-41d4-a716-446655440001'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Carlos Rodríguez', 'carlos@email.com', '550e8400-e29b-41d4-a716-446655440002'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Ana López', 'ana@email.com', '550e8400-e29b-41d4-a716-446655440003')
ON CONFLICT (id) DO NOTHING;

-- 7. Insertar propinas de prueba
INSERT INTO propinas (usuario_id, artista_id, monto, fecha) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 120.50, NOW() - INTERVAL '1 day'),
  ('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 85.00, NOW() - INTERVAL '2 days'),
  ('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 45.00, NOW() - INTERVAL '3 days'),
  ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 75.00, NOW() - INTERVAL '10 days'),
  ('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 50.00, NOW() - INTERVAL '15 days')
ON CONFLICT DO NOTHING;

-- 8. Insertar suscripciones de prueba
INSERT INTO suscripciones_usuario (usuario_id, artista_id, tipo_suscripcion, activa, fecha_inicio) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'premium', true, NOW() - INTERVAL '15 days'),
  ('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'basica', true, NOW() - INTERVAL '10 days'),
  ('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'basica', true, NOW() - INTERVAL '5 days')
ON CONFLICT DO NOTHING;

-- 9. Insertar accesos de contenido
INSERT INTO acceso_contenido (usuario_id, artista_id, contenido_id, fecha_acceso) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 1, NOW() - INTERVAL '1 day'),
  ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 2, NOW() - INTERVAL '2 days'),
  ('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 1, NOW() - INTERVAL '3 days'),
  ('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 1, NOW() - INTERVAL '4 days'),
  ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 3, NOW() - INTERVAL '5 days')
ON CONFLICT DO NOTHING;

-- 10. Crear vista de estadísticas simplificada
CREATE OR REPLACE VIEW estadisticas_fanaticos AS
SELECT 
  COUNT(DISTINCT u.id) as total_fanaticos,
  COUNT(DISTINCT CASE WHEN s.activa = true THEN u.id END) as fanaticos_activos,
  COALESCE(SUM(p.monto), 0) as propinas_totales,
  COUNT(DISTINCT CASE WHEN p.fecha >= NOW() - INTERVAL '30 days' THEN u.id END) as nuevos_este_mes,
  AVG(CASE 
    WHEN COUNT(p.id) >= 5 THEN 4
    WHEN COUNT(p.id) >= 3 THEN 3  
    WHEN COUNT(p.id) >= 1 THEN 2
    ELSE 1
  END) as nivel_promedio
FROM usuarios u
LEFT JOIN propinas p ON u.id = p.usuario_id
LEFT JOIN suscripciones_usuario s ON u.id = s.usuario_id;

-- 11. Función para calcular nivel de fanático
CREATE OR REPLACE FUNCTION calcular_nivel_fanatico(
  total_propinas DECIMAL,
  meses_suscrito INTEGER,
  accesos_exclusivos INTEGER
) RETURNS TEXT AS $$
BEGIN
  DECLARE
    puntos INTEGER;
  BEGIN
    puntos := (total_propinas * 0.1)::INTEGER + (meses_suscrito * 2) + (accesos_exclusivos * 1.5)::INTEGER;
    
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

-- 12. Verificación final
SELECT 'Setup completado exitosamente' as status;
SELECT * FROM estadisticas_fanaticos;
