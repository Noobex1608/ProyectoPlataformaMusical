-- Crear tabla de usuarios (artistas y fans)
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  tipo_usuario VARCHAR(20) CHECK (tipo_usuario IN ('artista', 'fan')) NOT NULL,
  avatar_url TEXT,
  biografia TEXT,
  fecha_registro TIMESTAMP DEFAULT NOW(),
  activo BOOLEAN DEFAULT true
);

-- Crear tabla de membresías
CREATE TABLE IF NOT EXISTS membresias (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  artista_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  fan_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo_membresia VARCHAR(20) CHECK (tipo_membresia IN ('basica', 'premium', 'vip')) NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  fecha_inicio TIMESTAMP DEFAULT NOW(),
  fecha_fin TIMESTAMP,
  activa BOOLEAN DEFAULT true,
  beneficios TEXT[]
);

-- Crear tabla de transacciones
CREATE TABLE IF NOT EXISTS transacciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo_transaccion VARCHAR(20) CHECK (tipo_transaccion IN ('pago', 'retiro', 'reembolso')) NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  moneda VARCHAR(3) DEFAULT 'USD',
  estado VARCHAR(20) CHECK (estado IN ('pendiente', 'completada', 'fallida', 'cancelada')) DEFAULT 'pendiente',
  metodo_pago VARCHAR(50),
  referencia_externa VARCHAR(255),
  descripcion TEXT,
  fecha_transaccion TIMESTAMP DEFAULT NOW()
);

-- Crear tabla de propinas
CREATE TABLE IF NOT EXISTS propinas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fan_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  artista_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  monto DECIMAL(10,2) NOT NULL,
  mensaje TEXT,
  publica BOOLEAN DEFAULT false,
  fecha_propina TIMESTAMP DEFAULT NOW(),
  transaccion_id UUID REFERENCES transacciones(id)
);

-- Crear tabla de recompensas
CREATE TABLE IF NOT EXISTS recompensas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo_recompensa VARCHAR(50) NOT NULL,
  descripcion TEXT NOT NULL,
  puntos_requeridos INTEGER,
  monto_requerido DECIMAL(10,2),
  fecha_obtenida TIMESTAMP DEFAULT NOW(),
  canjeada BOOLEAN DEFAULT false,
  fecha_canje TIMESTAMP
);

-- Crear tabla de contratos digitales
CREATE TABLE IF NOT EXISTS contratos_digitales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  artista_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  nombre_sello VARCHAR(255) NOT NULL,
  tipo_contrato VARCHAR(50) CHECK (tipo_contrato IN ('distribucion', 'sello', 'management', 'publishing')) NOT NULL,
  porcentaje_artista DECIMAL(5,2) NOT NULL,
  porcentaje_sello DECIMAL(5,2) NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE,
  terminos TEXT,
  estado VARCHAR(20) CHECK (estado IN ('activo', 'vencido', 'cancelado')) DEFAULT 'activo',
  fecha_creacion TIMESTAMP DEFAULT NOW()
);

-- Crear tabla de sistema de puntos
CREATE TABLE IF NOT EXISTS sistema_puntos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  puntos_totales INTEGER DEFAULT 0,
  puntos_disponibles INTEGER DEFAULT 0,
  nivel_fidelidad VARCHAR(20) CHECK (nivel_fidelidad IN ('bronce', 'plata', 'oro', 'platino')) DEFAULT 'bronce',
  fecha_actualizacion TIMESTAMP DEFAULT NOW()
);

-- Crear tabla de historial de puntos
CREATE TABLE IF NOT EXISTS historial_puntos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  puntos INTEGER NOT NULL,
  tipo_accion VARCHAR(50) NOT NULL,
  descripcion TEXT,
  fecha_accion TIMESTAMP DEFAULT NOW()
);
