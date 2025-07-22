-- SCRIPT DE DIAGNÓSTICO - VERIFICAR TABLAS EXISTENTES
-- Ejecuta este script primero para ver qué tablas ya existen

-- Verificar todas las tablas en el esquema public
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verificar específicamente las tablas que necesitamos
SELECT 
  CASE 
    WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'propinas') 
    THEN '✅ propinas existe' 
    ELSE '❌ propinas NO existe' 
  END as tabla_propinas,
  
  CASE 
    WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'suscripciones_usuario') 
    THEN '✅ suscripciones_usuario existe' 
    ELSE '❌ suscripciones_usuario NO existe' 
  END as tabla_suscripciones,
  
  CASE 
    WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'acceso_contenido') 
    THEN '✅ acceso_contenido existe' 
    ELSE '❌ acceso_contenido NO existe' 
  END as tabla_acceso,
  
  CASE 
    WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'usuarios') 
    THEN '✅ usuarios existe' 
    ELSE '❌ usuarios NO existe' 
  END as tabla_usuarios,
  
  CASE 
    WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'notificaciones_monetizacion') 
    THEN '✅ notificaciones_monetizacion existe' 
    ELSE '❌ notificaciones_monetizacion NO existe' 
  END as tabla_notificaciones;

-- VERIFICAR ESTRUCTURA DE COLUMNAS DE CADA TABLA
-- =========================================================

-- 1. Estructura de la tabla PROPINAS
SELECT 
  'TABLA: propinas' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'propinas' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Estructura de la tabla SUSCRIPCIONES_USUARIO  
SELECT 
  'TABLA: suscripciones_usuario' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'suscripciones_usuario' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Estructura de la tabla ACCESO_CONTENIDO
SELECT 
  'TABLA: acceso_contenido' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'acceso_contenido' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Estructura de la tabla USUARIOS
SELECT 
  'TABLA: usuarios' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Estructura de la tabla NOTIFICACIONES_MONETIZACION
SELECT 
  'TABLA: notificaciones_monetizacion' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'notificaciones_monetizacion' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- VERIFICAR DATOS EXISTENTES (si hay)
-- ===================================
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'propinas') THEN
    RAISE NOTICE 'Tabla propinas tiene % filas', (SELECT COUNT(*) FROM propinas);
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'suscripciones_usuario') THEN
    RAISE NOTICE 'Tabla suscripciones_usuario tiene % filas', (SELECT COUNT(*) FROM suscripciones_usuario);
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'usuarios') THEN
    RAISE NOTICE 'Tabla usuarios tiene % filas', (SELECT COUNT(*) FROM usuarios);
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'acceso_contenido') THEN
    RAISE NOTICE 'Tabla acceso_contenido tiene % filas', (SELECT COUNT(*) FROM acceso_contenido);
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'notificaciones_monetizacion') THEN
    RAISE NOTICE 'Tabla notificaciones_monetizacion tiene % filas', (SELECT COUNT(*) FROM notificaciones_monetizacion);
  END IF;
END $$;
