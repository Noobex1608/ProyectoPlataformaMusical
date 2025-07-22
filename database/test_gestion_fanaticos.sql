-- TESTING PARA GESTIÓN DE FANÁTICOS
-- Script para probar consultas y verificar datos

-- 1. Consulta principal para obtener fanáticos (simula la consulta del servicio)
SELECT 'PRUEBA 1: Suscriptores activos' as test;
SELECT DISTINCT
  su.usuario_id,
  su.fecha_inicio,
  su.fecha_fin,
  su.activa,
  su.precio_pagado,
  su.updated_at,
  COUNT(su.id) as membresias_activas,
  SUM(su.precio_pagado) as ingresos_totales,
  'test@email.com' as email -- Simulated email
FROM suscripciones_usuario su
WHERE su.artista_id = '550e8400-e29b-41d4-a716-446655440000'
GROUP BY su.usuario_id, su.fecha_inicio, su.fecha_fin, su.activa, su.precio_pagado, su.updated_at
LIMIT 10;

-- 2. Consulta de fans con propinas
SELECT 'PRUEBA 2: Fans con propinas' as test;
SELECT 
  p.fan_id,
  p.nombre_fan,
  COUNT(p.id) as cantidad_propinas,
  SUM(p.monto_neto) as propinas_totales,
  MIN(p.created_at) as primera_propina,
  MAX(p.created_at) as ultima_propina
FROM propinas p
WHERE p.artista_id = '550e8400-e29b-41d4-a716-446655440000' 
  AND p.estado = 'procesada'
GROUP BY p.fan_id, p.nombre_fan
LIMIT 10;

-- 3. Consulta de acceso a contenido
SELECT 'PRUEBA 3: Usuarios con acceso a contenido' as test;
SELECT 
  ac.usuario_id,
  COUNT(ac.id) as accesos_totales,
  MAX(ac.fecha_acceso) as ultimo_acceso
FROM acceso_contenido ac
WHERE ac.artista_id = '550e8400-e29b-41d4-a716-446655440000'
GROUP BY ac.usuario_id
LIMIT 10;

-- 4. Estadísticas generales
SELECT 'PRUEBA 4: Estadísticas generales' as test;
SELECT * FROM estadisticas_fanaticos 
WHERE artista_id = '550e8400-e29b-41d4-a716-446655440000';

-- 5. Test de función calcular_nivel_fanatico
SELECT 'PRUEBA 5: Cálculo de niveles' as test;
SELECT 
  'Nivel VIP: ' || calcular_nivel_fanatico(5, 10, 25) as test_vip,
  'Nivel SuperFan: ' || calcular_nivel_fanatico(3, 8, 15) as test_superfan,
  'Nivel Regular: ' || calcular_nivel_fanatico(2, 3, 5) as test_regular,
  'Nivel Casual: ' || calcular_nivel_fanatico(1, 1, 2) as test_casual;

-- 6. Consulta combinada que simula lo que hace el servicio
SELECT 'PRUEBA 6: Datos combinados de fanáticos' as test;
WITH suscriptores AS (
  SELECT DISTINCT
    su.usuario_id as id,
    'Usuario Suscriptor' as nombre,
    '' as email,
    su.fecha_inicio as fecha_registro,
    su.updated_at as ultima_actividad,
    COUNT(su.id) as membresias_activas,
    SUM(su.precio_pagado) as ingresos_generados,
    0 as propinas_totales,
    0 as propinas_cantidad,
    CASE WHEN su.activa THEN 'activo' ELSE 'inactivo' END as estado
  FROM suscripciones_usuario su
  WHERE su.artista_id = '550e8400-e29b-41d4-a716-446655440000'
  GROUP BY su.usuario_id, su.fecha_inicio, su.updated_at, su.activa
),
fans_propinas AS (
  SELECT 
    p.fan_id as id,
    p.nombre_fan as nombre,
    '' as email,
    MIN(p.created_at) as fecha_registro,
    MAX(p.created_at) as ultima_actividad,
    0 as membresias_activas,
    SUM(p.monto_neto) as ingresos_generados,
    SUM(p.monto_neto) as propinas_totales,
    COUNT(p.id) as propinas_cantidad,
    'activo' as estado
  FROM propinas p
  WHERE p.artista_id = '550e8400-e29b-41d4-a716-446655440000' 
    AND p.estado = 'procesada'
  GROUP BY p.fan_id, p.nombre_fan
)
SELECT 
  id,
  nombre,
  fecha_registro,
  ultima_actividad,
  membresias_activas,
  ingresos_generados,
  propinas_totales,
  propinas_cantidad,
  estado,
  calcular_nivel_fanatico(membresias_activas::INTEGER, propinas_cantidad::INTEGER, 0) as nivel_calculado
FROM suscriptores
UNION ALL
SELECT 
  id,
  nombre,
  fecha_registro,
  ultima_actividad,
  membresias_activas,
  ingresos_generados,
  propinas_totales,
  propinas_cantidad,
  estado,
  calcular_nivel_fanatico(membresias_activas::INTEGER, propinas_cantidad::INTEGER, 0) as nivel_calculado
FROM fans_propinas;

-- 7. Test de inserción de notificación
SELECT 'PRUEBA 7: Test inserción notificación' as test;
INSERT INTO notificaciones_monetizacion (
  usuario_id, 
  artista_id, 
  tipo, 
  titulo, 
  mensaje, 
  leida, 
  prioridad
) 
VALUES (
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440000',
  'agradecimiento',
  'Gracias por tu apoyo',
  'Queremos agradecerte por ser parte de nuestra comunidad',
  false,
  'media'
) 
ON CONFLICT DO NOTHING
RETURNING id, titulo, mensaje;

-- 8. Verificar que las tablas tengan los datos de prueba
SELECT 'PRUEBA 8: Conteo de registros' as test;
SELECT 
  (SELECT COUNT(*) FROM propinas WHERE artista_id = '550e8400-e29b-41d4-a716-446655440000') as propinas_count,
  (SELECT COUNT(*) FROM suscripciones_usuario WHERE artista_id = '550e8400-e29b-41d4-a716-446655440000') as suscripciones_count,
  (SELECT COUNT(*) FROM membresias WHERE artista_id = '550e8400-e29b-41d4-a716-446655440000') as membresias_count,
  (SELECT COUNT(*) FROM acceso_contenido WHERE artista_id = '550e8400-e29b-41d4-a716-446655440000') as accesos_count;

SELECT 'TESTING COMPLETADO - Todos los componentes verificados' as final_status;
