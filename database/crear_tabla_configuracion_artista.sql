-- Crear tabla configuracion_artista si no existe
CREATE TABLE IF NOT EXISTS configuracion_artista (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    artista_id UUID NOT NULL,
    configuracion_general JSONB DEFAULT '{}',
    configuracion_contenido JSONB DEFAULT '{}',
    configuracion_pagos JSONB DEFAULT '{}',
    configuracion_privacidad JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    fecha_actualizacion TIMESTAMPTZ DEFAULT NOW(),
    
    -- Añadir constraint para referencia a artistas (opcional)
    -- CONSTRAINT fk_configuracion_artista_id FOREIGN KEY (artista_id) REFERENCES artistas(id)
);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_configuracion_artista_artista_id ON configuracion_artista(artista_id);
CREATE INDEX IF NOT EXISTS idx_configuracion_artista_created_at ON configuracion_artista(created_at);

-- Habilitar Row Level Security (RLS)
ALTER TABLE configuracion_artista ENABLE ROW LEVEL SECURITY;

-- Crear política básica para permitir acceso (ajustar según necesidades)
CREATE POLICY IF NOT EXISTS "Permitir todo acceso a configuracion_artista" ON configuracion_artista
FOR ALL USING (true) WITH CHECK (true);

-- Comentarios para documentación
COMMENT ON TABLE configuracion_artista IS 'Configuraciones personalizadas de artistas para monetización';
COMMENT ON COLUMN configuracion_artista.artista_id IS 'UUID del artista propietario de la configuración';
COMMENT ON COLUMN configuracion_artista.configuracion_general IS 'Configuraciones generales como notificaciones';
COMMENT ON COLUMN configuracion_artista.configuracion_contenido IS 'Configuraciones de contenido como calidad de video';
COMMENT ON COLUMN configuracion_artista.configuracion_pagos IS 'Configuraciones de pagos como comisiones y métodos';
COMMENT ON COLUMN configuracion_artista.configuracion_privacidad IS 'Configuraciones de privacidad del perfil';
