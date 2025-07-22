-- SCRIPT PARA INSERTAR DATOS DE PRUEBA - CONFIGURACIÓN DE ARTISTA
-- Ejecutar este script para tener datos de configuración de muestra

-- 1. Insertar configuración básica para el artista de prueba
INSERT INTO configuracion_artista (
    artista_id,
    configuracion_general,
    configuracion_contenido,
    configuracion_pagos,
    configuracion_privacidad,
    fecha_actualizacion,
    created_at
) VALUES (
    '123e4567-e89b-12d3-a456-426614174000'::uuid,
    '{
        "notificacionesEmail": true,
        "notificacionesApp": true,
        "notificacionesPropinas": true,
        "notificacionesMembresias": true,
        "notificacionesComentarios": true,
        "notificacionesSeguidores": true,
        "frecuenciaResumen": "diario"
    }'::jsonb,
    '{
        "marcaAguaEnFotos": true,
        "calidadVideoMaxima": "1080p",
        "limiteTamañoArchivo": 100,
        "tiposArchivoPermitidos": ["jpg", "png", "mp4", "mp3"],
        "autoPublicacionContenido": true
    }'::jsonb,
    '{
        "comisionMembresias": 10,
        "comisionPropinas": 5,
        "comisionEventos": 15,
        "montoMinimoRetiro": 50,
        "comisionPersonalizada": 10,
        "metodoPagoPreferido": "transferencia",
        "frecuenciaPagos": "mensual"
    }'::jsonb,
    '{
        "perfilPublico": true,
        "mostrarEstadisticas": true,
        "permitirMensajesDirectos": true,
        "filtroContenidoAdulto": false
    }'::jsonb,
    now(),
    now()
)
ON CONFLICT (artista_id) DO UPDATE SET
    configuracion_general = EXCLUDED.configuracion_general,
    configuracion_contenido = EXCLUDED.configuracion_contenido,
    configuracion_pagos = EXCLUDED.configuracion_pagos,
    configuracion_privacidad = EXCLUDED.configuracion_privacidad,
    fecha_actualizacion = now();

-- 2. Verificar que se insertó correctamente
SELECT 
    'Configuración creada exitosamente' as mensaje,
    artista_id,
    configuracion_general->>'frecuenciaResumen' as frecuencia_resumen,
    configuracion_pagos->>'comisionMembresias' as comision_membresias,
    configuracion_privacidad->>'perfilPublico' as perfil_publico,
    created_at
FROM configuracion_artista 
WHERE artista_id = '123e4567-e89b-12d3-a456-426614174000'::uuid;

-- 3. Mostrar estructura JSONB para referencia
SELECT 
    'ESTRUCTURA JSONB - configuracion_general' as seccion,
    jsonb_pretty(configuracion_general) as contenido
FROM configuracion_artista 
WHERE artista_id = '123e4567-e89b-12d3-a456-426614174000'::uuid
UNION ALL
SELECT 
    'ESTRUCTURA JSONB - configuracion_contenido' as seccion,
    jsonb_pretty(configuracion_contenido) as contenido
FROM configuracion_artista 
WHERE artista_id = '123e4567-e89b-12d3-a456-426614174000'::uuid
UNION ALL
SELECT 
    'ESTRUCTURA JSONB - configuracion_pagos' as seccion,
    jsonb_pretty(configuracion_pagos) as contenido
FROM configuracion_artista 
WHERE artista_id = '123e4567-e89b-12d3-a456-426614174000'::uuid
UNION ALL
SELECT 
    'ESTRUCTURA JSONB - configuracion_privacidad' as seccion,
    jsonb_pretty(configuracion_privacidad) as contenido
FROM configuracion_artista 
WHERE artista_id = '123e4567-e89b-12d3-a456-426614174000'::uuid;
