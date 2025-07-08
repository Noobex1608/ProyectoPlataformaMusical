-- ===============================================
-- SCRIPT PARA ACTUALIZAR LA TABLA USUARIOS
-- Agregar campo auth_id para UUID de Supabase Auth
-- ===============================================

-- Agregar el campo auth_id a la tabla usuarios
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS auth_id UUID UNIQUE;

-- Crear índice para el nuevo campo
CREATE INDEX IF NOT EXISTS idx_usuarios_auth_id ON usuarios(auth_id);

-- Opcional: Si ya tienes datos en la tabla y quieres limpiarlos
-- DELETE FROM usuarios;

-- Verificar la estructura de la tabla
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
ORDER BY ordinal_position;
