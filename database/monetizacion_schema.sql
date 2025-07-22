-- ===============================================
-- SCRIPT SQL PARA TABLAS DE MONETIZACIÓN
-- Plataforma Musical - Módulo de Monetización
-- ===============================================

-- 1. TABLA MEMBRESIAS
CREATE TABLE IF NOT EXISTS membresias (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    artista_id UUID REFERENCES artistas(id) ON DELETE CASCADE,
    duracion_dias INTEGER DEFAULT 30, -- duración en días
    activa BOOLEAN DEFAULT true,
    beneficios JSONB, -- JSON con los beneficios incluidos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABLA PROPINAS
CREATE TABLE IF NOT EXISTS propinas (
    id BIGSERIAL PRIMARY KEY,
    fan_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- auth_id del usuario
    nombre_fan VARCHAR(255) NOT NULL,
    artista_id UUID REFERENCES artistas(id) ON DELETE CASCADE,
    cantidad DECIMAL(10,2) NOT NULL,
    monto DECIMAL(10,2) NOT NULL, -- para compatibilidad
    mensaje TEXT,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    cancion_dedicada BIGINT REFERENCES canciones(id) ON DELETE SET NULL,
    recompensa_desbloqueada BIGINT, -- FK a recompensas
    estado VARCHAR(50) DEFAULT 'procesada' CHECK (estado IN ('pendiente', 'procesada', 'rechazada')),
    metodo_pago VARCHAR(100) DEFAULT 'tarjeta',
    comision DECIMAL(10,2) NOT NULL DEFAULT 0,
    monto_neto DECIMAL(10,2) NOT NULL DEFAULT 0,
    publico_en_feed BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABLA RECOMPENSAS
CREATE TABLE IF NOT EXISTS recompensas (
    id BIGSERIAL PRIMARY KEY,
    artista_id UUID REFERENCES artistas(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    cantidad_disponible INTEGER,
    cantidad_vendida INTEGER DEFAULT 0,
    tipo VARCHAR(100) NOT NULL CHECK (tipo IN ('digital', 'fisica', 'experiencia', 'contenido_exclusivo')),
    imagen_url TEXT,
    activa BOOLEAN DEFAULT true,
    fecha_limite DATE,
    requisitos JSONB, -- requisitos para acceder (ej: nivel de membresía)
    contenido_digital JSONB, -- para recompensas digitales
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABLA TRANSACCIONES
CREATE TABLE IF NOT EXISTS transacciones (
    id BIGSERIAL PRIMARY KEY,
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- auth_id del usuario
    artista_id UUID REFERENCES artistas(id) ON DELETE CASCADE,
    tipo VARCHAR(100) NOT NULL CHECK (tipo IN ('membresia', 'propina', 'recompensa', 'contenido_exclusivo', 'evento')),
    subtipo VARCHAR(100),
    referencia_id BIGINT NOT NULL, -- ID del objeto relacionado
    descripcion TEXT NOT NULL,
    concepto VARCHAR(255) NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    monto_comision DECIMAL(10,2) NOT NULL DEFAULT 0,
    monto_neto DECIMAL(10,2) NOT NULL DEFAULT 0,
    moneda VARCHAR(10) DEFAULT 'USD',
    fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_procesamiento TIMESTAMP WITH TIME ZONE,
    estado VARCHAR(50) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'procesada', 'cancelada', 'reembolsada', 'fallida')),
    metodo_pago VARCHAR(100) NOT NULL,
    transaccion_externa_id VARCHAR(255),
    metadata JSONB, -- IP, dispositivo, ubicación, notas
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABLA SUSCRIPCIONES_USUARIO (relación usuarios-membresías)
CREATE TABLE IF NOT EXISTS suscripciones_usuario (
    id BIGSERIAL PRIMARY KEY,
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- auth_id del usuario
    artista_id UUID REFERENCES artistas(id) ON DELETE CASCADE,
    membresia_id BIGINT REFERENCES membresias(id) ON DELETE CASCADE,
    fecha_inicio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_fin TIMESTAMP WITH TIME ZONE NOT NULL,
    activa BOOLEAN DEFAULT true,
    auto_renovacion BOOLEAN DEFAULT false,
    precio_pagado DECIMAL(10,2) NOT NULL,
    transaccion_id BIGINT REFERENCES transacciones(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(usuario_id, artista_id, membresia_id)
);

-- 6. TABLA ACCESO_CONTENIDO (para gestionar accesos por membresías/propinas)
CREATE TABLE IF NOT EXISTS acceso_contenido (
    id BIGSERIAL PRIMARY KEY,
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- auth_id del usuario
    artista_id UUID REFERENCES artistas(id) ON DELETE CASCADE,
    contenido_id BIGINT NOT NULL, -- ID del contenido (puede ser canción, video, etc.)
    tipo_acceso VARCHAR(50) NOT NULL CHECK (tipo_acceso IN ('membresia', 'propina', 'regalo', 'promocional')),
    membresia_usada BIGINT REFERENCES membresias(id) ON DELETE SET NULL,
    propina_usada BIGINT REFERENCES propinas(id) ON DELETE SET NULL,
    fecha_acceso TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_expiracion TIMESTAMP WITH TIME ZONE,
    limites_uso JSONB, -- límites de visualizaciones, descargas, etc.
    metadata JSONB, -- IP, dispositivo, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. TABLA CONFIGURACION_ARTISTA (configuraciones de monetización)
CREATE TABLE IF NOT EXISTS configuracion_artista (
    id BIGSERIAL PRIMARY KEY,
    artista_id UUID REFERENCES artistas(id) ON DELETE CASCADE UNIQUE,
    configuracion_general JSONB NOT NULL DEFAULT '{}',
    configuracion_contenido JSONB NOT NULL DEFAULT '{}',
    configuracion_pagos JSONB NOT NULL DEFAULT '{}',
    configuracion_privacidad JSONB NOT NULL DEFAULT '{}',
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. TABLA NOTIFICACIONES_MONETIZACION
CREATE TABLE IF NOT EXISTS notificaciones_monetizacion (
    id BIGSERIAL PRIMARY KEY,
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- auth_id del usuario
    artista_id UUID REFERENCES artistas(id) ON DELETE SET NULL,
    tipo VARCHAR(100) NOT NULL CHECK (tipo IN ('nueva_membresia', 'propina_recibida', 'contenido_nuevo', 'suscripcion_vencida', 'recompensa_desbloqueada')),
    titulo VARCHAR(255) NOT NULL,
    mensaje TEXT NOT NULL,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_leida TIMESTAMP WITH TIME ZONE,
    leida BOOLEAN DEFAULT false,
    accion JSONB, -- tipo, url, contenidoId
    prioridad VARCHAR(20) DEFAULT 'media' CHECK (prioridad IN ('baja', 'media', 'alta')),
    metadata JSONB, -- iconoUrl, imagenUrl, datos adicionales
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===============================================
-- ÍNDICES PARA MEJORAR PERFORMANCE
-- ===============================================

-- Índices en membresias
CREATE INDEX IF NOT EXISTS idx_membresias_artista_id ON membresias(artista_id);
CREATE INDEX IF NOT EXISTS idx_membresias_activa ON membresias(activa);

-- Índices en propinas
CREATE INDEX IF NOT EXISTS idx_propinas_fan_id ON propinas(fan_id);
CREATE INDEX IF NOT EXISTS idx_propinas_artista_id ON propinas(artista_id);
CREATE INDEX IF NOT EXISTS idx_propinas_fecha ON propinas(fecha);
CREATE INDEX IF NOT EXISTS idx_propinas_estado ON propinas(estado);

-- Índices en recompensas
CREATE INDEX IF NOT EXISTS idx_recompensas_artista_id ON recompensas(artista_id);
CREATE INDEX IF NOT EXISTS idx_recompensas_tipo ON recompensas(tipo);
CREATE INDEX IF NOT EXISTS idx_recompensas_activa ON recompensas(activa);

-- Índices en transacciones
CREATE INDEX IF NOT EXISTS idx_transacciones_usuario_id ON transacciones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_transacciones_artista_id ON transacciones(artista_id);
CREATE INDEX IF NOT EXISTS idx_transacciones_tipo ON transacciones(tipo);
CREATE INDEX IF NOT EXISTS idx_transacciones_estado ON transacciones(estado);
CREATE INDEX IF NOT EXISTS idx_transacciones_fecha ON transacciones(fecha);

-- Índices en suscripciones
CREATE INDEX IF NOT EXISTS idx_suscripciones_usuario_id ON suscripciones_usuario(usuario_id);
CREATE INDEX IF NOT EXISTS idx_suscripciones_artista_id ON suscripciones_usuario(artista_id);
CREATE INDEX IF NOT EXISTS idx_suscripciones_activa ON suscripciones_usuario(activa);

-- Índices en acceso_contenido
CREATE INDEX IF NOT EXISTS idx_acceso_contenido_usuario_id ON acceso_contenido(usuario_id);
CREATE INDEX IF NOT EXISTS idx_acceso_contenido_artista_id ON acceso_contenido(artista_id);
CREATE INDEX IF NOT EXISTS idx_acceso_contenido_tipo ON acceso_contenido(tipo_acceso);

-- Índices en notificaciones
CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario_id ON notificaciones_monetizacion(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_artista_id ON notificaciones_monetizacion(artista_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_leida ON notificaciones_monetizacion(leida);

-- ===============================================
-- TRIGGERS PARA ACTUALIZAR TIMESTAMPS
-- ===============================================

-- Triggers para actualizar updated_at automáticamente
CREATE TRIGGER update_membresias_updated_at BEFORE UPDATE ON membresias FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recompensas_updated_at BEFORE UPDATE ON recompensas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_suscripciones_updated_at BEFORE UPDATE ON suscripciones_usuario FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_configuracion_artista_updated_at BEFORE UPDATE ON configuracion_artista FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===============================================
-- FUNCIONES AUXILIARES
-- ===============================================

-- Función para calcular comisión automáticamente
CREATE OR REPLACE FUNCTION calcular_comision(monto DECIMAL, porcentaje DECIMAL DEFAULT 0.10)
RETURNS DECIMAL AS $$
BEGIN
    RETURN ROUND(monto * porcentaje, 2);
END;
$$ LANGUAGE plpgsql;

-- Función para calcular monto neto
CREATE OR REPLACE FUNCTION calcular_monto_neto(monto DECIMAL, comision DECIMAL)
RETURNS DECIMAL AS $$
BEGIN
    RETURN monto - comision;
END;
$$ LANGUAGE plpgsql;

-- ===============================================
-- TRIGGERS PARA CÁLCULOS AUTOMÁTICOS
-- ===============================================

-- Trigger para calcular automáticamente comisión y monto neto en propinas
CREATE OR REPLACE FUNCTION auto_calcular_propina()
RETURNS TRIGGER AS $$
BEGIN
    NEW.comision = calcular_comision(NEW.monto);
    NEW.monto_neto = calcular_monto_neto(NEW.monto, NEW.comision);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_calcular_propina
    BEFORE INSERT OR UPDATE ON propinas
    FOR EACH ROW EXECUTE FUNCTION auto_calcular_propina();

-- Trigger para calcular automáticamente comisión y monto neto en transacciones
CREATE OR REPLACE FUNCTION auto_calcular_transaccion()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.monto_comision = 0 THEN
        NEW.monto_comision = calcular_comision(NEW.monto);
    END IF;
    
    IF NEW.monto_neto = 0 THEN
        NEW.monto_neto = calcular_monto_neto(NEW.monto, NEW.monto_comision);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_calcular_transaccion
    BEFORE INSERT OR UPDATE ON transacciones
    FOR EACH ROW EXECUTE FUNCTION auto_calcular_transaccion();

-- ===============================================
-- POLÍTICAS RLS (Row Level Security)
-- ===============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE membresias ENABLE ROW LEVEL SECURITY;
ALTER TABLE propinas ENABLE ROW LEVEL SECURITY;
ALTER TABLE recompensas ENABLE ROW LEVEL SECURITY;
ALTER TABLE transacciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE suscripciones_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE acceso_contenido ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion_artista ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones_monetizacion ENABLE ROW LEVEL SECURITY;

-- Políticas para membresias: lectura pública, escritura solo para el artista
CREATE POLICY "Everyone can view active memberships" ON membresias
    FOR SELECT USING (activa = true);

CREATE POLICY "Artists can manage their own memberships" ON membresias
    FOR ALL USING (artista_id IN (
        SELECT a.id FROM artistas a 
        JOIN usuarios u ON a.user_id = u.id 
        WHERE u.auth_id = auth.uid()
    ));

-- Políticas para propinas: los artistas ven las suyas, los fans ven las suyas
CREATE POLICY "Artists can view their tips" ON propinas
    FOR SELECT USING (artista_id IN (
        SELECT a.id FROM artistas a 
        JOIN usuarios u ON a.user_id = u.id 
        WHERE u.auth_id = auth.uid()
    ));

CREATE POLICY "Fans can view their own tips" ON propinas
    FOR SELECT USING (fan_id = auth.uid());

CREATE POLICY "Fans can send tips" ON propinas
    FOR INSERT WITH CHECK (fan_id = auth.uid());

-- Políticas para transacciones: usuarios ven sus propias transacciones
CREATE POLICY "Users can view their own transactions" ON transacciones
    FOR SELECT USING (
        usuario_id = auth.uid() OR 
        artista_id IN (
            SELECT a.id FROM artistas a 
            JOIN usuarios u ON a.user_id = u.id 
            WHERE u.auth_id = auth.uid()
        )
    );

-- Políticas para suscripciones: usuarios ven sus propias suscripciones
CREATE POLICY "Users can view their own subscriptions" ON suscripciones_usuario
    FOR SELECT USING (
        usuario_id = auth.uid() OR 
        artista_id IN (
            SELECT a.id FROM artistas a 
            JOIN usuarios u ON a.user_id = u.id 
            WHERE u.auth_id = auth.uid()
        )
    );

-- Políticas para configuración: solo el artista puede ver/editar su configuración
CREATE POLICY "Artists can manage their own config" ON configuracion_artista
    FOR ALL USING (artista_id IN (
        SELECT a.id FROM artistas a 
        JOIN usuarios u ON a.user_id = u.id 
        WHERE u.auth_id = auth.uid()
    ));

-- Políticas para notificaciones: usuarios ven sus propias notificaciones
CREATE POLICY "Users can view their own notifications" ON notificaciones_monetizacion
    FOR SELECT USING (usuario_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON notificaciones_monetizacion
    FOR UPDATE USING (usuario_id = auth.uid());

-- ===============================================
-- DATOS DE EJEMPLO (OPCIONAL)
-- ===============================================

-- Insertar configuración por defecto para artistas existentes
INSERT INTO configuracion_artista (artista_id, configuracion_general, configuracion_pagos, configuracion_privacidad, configuracion_contenido)
SELECT 
    id,
    '{"membresiasPorDefectoActivas": true, "propinasMinimasHabilitadas": true, "montoMinimoPropoina": 5.0, "autoAprobacionRecompensas": false, "notificacionesEmail": true, "notificacionesApp": true}'::jsonb,
    '{"metodoPagoPreferido": "tarjeta", "frecuenciaPagos": "mensual", "montoMinimoRetiro": 50.0, "comisionPersonalizada": 10}'::jsonb,
    '{"perfilPublico": true, "mostrarEstadisticas": true, "permitirMensajesDirectos": true, "filtroContenidoAdulto": false}'::jsonb,
    '{"marcaAguaEnFotos": false, "calidadVideoMaxima": "1080p", "limiteTamañoArchivo": 50, "tiposArchivoPermitidos": ["jpg", "png", "mp4", "mp3"], "autoPublicacionContenido": false}'::jsonb
FROM artistas
ON CONFLICT (artista_id) DO NOTHING;

-- ===============================================
-- FIN DEL SCRIPT
-- ===============================================
