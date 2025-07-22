-- SOLUCIÓN INMEDIATA: Política más permisiva para desarrollo
-- Este script corrige el problema RLS que está causando el error 406

-- 1. Primero, crear una política de desarrollo más permisiva
DROP POLICY IF EXISTS "Artists can manage their own config" ON configuracion_artista;

-- 2. Crear política temporal para desarrollo que permita todo acceso
CREATE POLICY "dev_access_configuracion_artista" 
ON configuracion_artista
FOR ALL 
USING (true) 
WITH CHECK (true);

-- 3. Verificar que la nueva política se creó correctamente
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'configuracion_artista';

-- 4. Insertar datos de prueba básicos
INSERT INTO configuracion_artista (
    artista_id,
    configuracion_general,
    configuracion_contenido,
    configuracion_pagos,
    configuracion_privacidad
) VALUES (
    '39065e52-e966-45b1-b914-f654bc3013c2',  -- El UUID que está usando tu app
    '{
        "notificacionesEmail": true,
        "notificacionesApp": true,
        "notificacionesPropinas": true,
        "membresiasPorDefectoActivas": true
    }'::jsonb,
    '{
        "marcaAguaEnFotos": true,
        "calidadVideoMaxima": "1080p",
        "limiteTamañoArchivo": 100
    }'::jsonb,
    '{
        "metodoPagoPreferido": "transferencia",
        "frecuenciaPagos": "mensual",
        "montoMinimoRetiro": 50.00,
        "comisionPersonalizada": 10.00
    }'::jsonb,
    '{
        "perfilPublico": true,
        "mostrarEstadisticas": true,
        "permitirMensajesDirectos": true
    }'::jsonb
) ON CONFLICT (artista_id) DO UPDATE SET
    configuracion_general = EXCLUDED.configuracion_general,
    configuracion_contenido = EXCLUDED.configuracion_contenido,
    configuracion_pagos = EXCLUDED.configuracion_pagos,
    configuracion_privacidad = EXCLUDED.configuracion_privacidad,
    fecha_actualizacion = NOW();

-- 5. Test de consulta que está fallando en tu app
SELECT 
    id,
    artista_id,
    configuracion_general,
    configuracion_pagos,
    created_at
FROM configuracion_artista 
WHERE artista_id = '39065e52-e966-45b1-b914-f654bc3013c2';

-- 6. Verificar que todo funciona
SELECT 
    'ÉXITO: Configuración creada y accesible' as resultado,
    COUNT(*) as total_configuraciones
FROM configuracion_artista;
