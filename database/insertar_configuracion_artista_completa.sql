-- Insertar datos de prueba para configuracion_artista
-- Basado en el esquema existente de la base de datos

-- PASO 1: Crear o verificar que existe un artista de prueba
INSERT INTO artistas (id, nombre, genero, pais, descripcion) 
VALUES (
    '123e4567-e89b-12d3-a456-426614174000',
    'Artista Prueba Configuración',
    'Pop',
    'México',
    'Artista de prueba para configuraciones de monetización'
) ON CONFLICT (id) DO NOTHING;

-- PASO 2: Insertar configuración de prueba completa
-- Nota: La tabla usa 'id' como bigint auto-increment, no UUID
INSERT INTO configuracion_artista (
    artista_id,
    configuracion_general,
    configuracion_contenido,
    configuracion_pagos,
    configuracion_privacidad
) VALUES (
    '123e4567-e89b-12d3-a456-426614174000',
    '{
        "notificacionesEmail": true,
        "notificacionesApp": true,
        "notificacionesPropinas": true,
        "notificacionesMembresias": true,
        "notificacionesComentarios": false,
        "notificacionesSeguidores": true,
        "frecuenciaResumen": "diario",
        "membresiasPorDefectoActivas": true,
        "propinasMinimasHabilitadas": true,
        "montoMinimoPropoina": 1.00,
        "autoAprobacionRecompensas": false,
        "idiomaPreferido": "es",
        "zonaHoraria": "America/Mexico_City"
    }'::jsonb,
    '{
        "marcaAguaEnFotos": true,
        "calidadVideoMaxima": "1080p",
        "limiteTamañoArchivo": 100,
        "tiposArchivoPermitidos": ["jpg", "jpeg", "png", "mp4", "mp3", "wav"],
        "autoPublicacionContenido": true,
        "compresionAutomatica": true,
        "resolucionMinima": "720p",
        "formatosPermitidos": {
            "imagen": ["jpg", "jpeg", "png"],
            "video": ["mp4", "mov"],
            "audio": ["mp3", "wav", "flac"]
        },
        "moderacionContenido": true,
        "backupAutomatico": false
    }'::jsonb,
    '{
        "metodoPagoPreferido": "transferencia",
        "frecuenciaPagos": "mensual",
        "montoMinimoRetiro": 50.00,
        "comisionPersonalizada": 10.00,
        "comisionMembresias": 12.00,
        "comisionPropinas": 5.00,
        "comisionEventos": 15.00,
        "cuentaBancaria": "****1234",
        "monedaPreferida": "MXN",
        "factorConversionUSD": 18.50,
        "impuestosIncluidos": true,
        "retencionFiscal": 16.00,
        "limiteRetiroMensual": 10000.00,
        "notificacionesPago": true
    }'::jsonb,
    '{
        "perfilPublico": true,
        "mostrarEstadisticas": true,
        "permitirMensajesDirectos": true,
        "filtroContenidoAdulto": false,
        "mostrarSeguidores": true,
        "permitirComentarios": true,
        "mostrarIngresos": false,
        "perfilVerificado": false,
        "compartirDatosAnalytica": false,
        "mostrarUbicacion": false,
        "permitirColaboraciones": true,
        "visibilidadContenido": "publico",
        "moderacionComentarios": "automatica"
    }'::jsonb
) ON CONFLICT (artista_id) DO UPDATE SET
    configuracion_general = EXCLUDED.configuracion_general,
    configuracion_contenido = EXCLUDED.configuracion_contenido,
    configuracion_pagos = EXCLUDED.configuracion_pagos,
    configuracion_privacidad = EXCLUDED.configuracion_privacidad,
    fecha_actualizacion = NOW();

-- PASO 3: Verificar que se insertó correctamente
SELECT 
    id,
    artista_id,
    jsonb_pretty(configuracion_general) as config_general,
    jsonb_pretty(configuracion_pagos) as config_pagos,
    created_at,
    fecha_actualizacion
FROM configuracion_artista 
WHERE artista_id = '123e4567-e89b-12d3-a456-426614174000';

-- PASO 4: Crear configuraciones adicionales para testing
INSERT INTO configuracion_artista (
    artista_id,
    configuracion_general,
    configuracion_contenido,
    configuracion_pagos,
    configuracion_privacidad
) 
SELECT 
    '39065e52-e966-45b1-b914-f654bc3013c2',
    '{"notificacionesEmail": true, "notificacionesApp": false}'::jsonb,
    '{"marcaAguaEnFotos": false, "calidadVideoMaxima": "720p"}'::jsonb,
    '{"montoMinimoRetiro": 25.00, "frecuenciaPagos": "quincenal"}'::jsonb,
    '{"perfilPublico": false, "mostrarEstadisticas": false}'::jsonb
WHERE NOT EXISTS (
    SELECT 1 FROM configuracion_artista WHERE artista_id = '39065e52-e966-45b1-b914-f654bc3013c2'
);

-- PASO 5: Mostrar resumen final
SELECT 
    COUNT(*) as total_configuraciones,
    COUNT(DISTINCT artista_id) as artistas_configurados
FROM configuracion_artista;

SELECT 'Configuraciones creadas exitosamente' as resultado;
