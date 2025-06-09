-- Insertar usuarios de ejemplo
INSERT INTO usuarios (email, nombre, tipo_usuario, biografia) VALUES
('artista1@music.com', 'Luna Melodía', 'artista', 'Cantautora indie con 5 años de experiencia'),
('artista2@music.com', 'Ritmo Urbano', 'artista', 'Productor de música urbana y reggaeton'),
('fan1@music.com', 'María González', 'fan', 'Amante de la música indie y alternativa'),
('fan2@music.com', 'Carlos Rodríguez', 'fan', 'Fan del reggaeton y música urbana');

-- Insertar membresías de ejemplo
INSERT INTO membresias (artista_id, fan_id, tipo_membresia, precio, beneficios) 
SELECT 
  a.id, 
  f.id, 
  'premium', 
  9.99,
  ARRAY['Acceso exclusivo a contenido', 'Chat directo con artista', 'Descuentos en merchandise']
FROM usuarios a, usuarios f 
WHERE a.tipo_usuario = 'artista' AND f.tipo_usuario = 'fan' 
LIMIT 2;

-- Insertar transacciones de ejemplo
INSERT INTO transacciones (usuario_id, tipo_transaccion, monto, estado, descripcion)
SELECT 
  id, 
  'pago', 
  9.99, 
  'completada',
  'Pago de membresía premium'
FROM usuarios 
WHERE tipo_usuario = 'fan';

-- Insertar propinas de ejemplo
INSERT INTO propinas (fan_id, artista_id, monto, mensaje, publica)
SELECT 
  f.id,
  a.id,
  5.00,
  '¡Excelente música! Sigue así',
  true
FROM usuarios f, usuarios a
WHERE f.tipo_usuario = 'fan' AND a.tipo_usuario = 'artista'
LIMIT 2;

-- Insertar sistema de puntos para todos los usuarios
INSERT INTO sistema_puntos (usuario_id, puntos_totales, puntos_disponibles)
SELECT id, 100, 100 FROM usuarios;

-- Insertar recompensas de ejemplo
INSERT INTO recompensas (usuario_id, tipo_recompensa, descripcion, puntos_requeridos)
SELECT 
  id,
  'descuento_membresia',
  '20% de descuento en próxima membresía',
  50
FROM usuarios 
WHERE tipo_usuario = 'fan';
