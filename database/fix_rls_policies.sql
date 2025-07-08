-- ===============================================
-- SCRIPT PARA CORREGIR POLÍTICAS RLS
-- Permitir registro de nuevos usuarios
-- ===============================================

-- Deshabilitar RLS para permitir registros
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE artistas DISABLE ROW LEVEL SECURITY;
ALTER TABLE canciones DISABLE ROW LEVEL SECURITY;
ALTER TABLE playlists DISABLE ROW LEVEL SECURITY;

-- NOTA: RLS permanece deshabilitado para permitir operaciones de registro
-- Puedes volver a habilitarlo más tarde con políticas específicas

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Users can view their own data" ON usuarios;
DROP POLICY IF EXISTS "Users can update their own data" ON usuarios;
DROP POLICY IF EXISTS "Anyone can register new users" ON usuarios;
DROP POLICY IF EXISTS "Only admin can delete users" ON usuarios;

-- Eliminar políticas existentes de artistas
DROP POLICY IF EXISTS "Everyone can view public artist data" ON artistas;
DROP POLICY IF EXISTS "Authenticated users can create artist profiles" ON artistas;
DROP POLICY IF EXISTS "Artists can manage their own data" ON artistas;

-- Eliminar políticas existentes de canciones
DROP POLICY IF EXISTS "Everyone can view public songs" ON canciones;
DROP POLICY IF EXISTS "Artists can create songs" ON canciones;

-- Eliminar políticas existentes de playlists
DROP POLICY IF EXISTS "Everyone can view public playlists" ON playlists;
DROP POLICY IF EXISTS "Users can create playlists" ON playlists;

-- Crear nuevas políticas más permisivas para registro
-- Política 1: Permitir que cualquiera pueda insertar usuarios (para registro)
CREATE POLICY "Anyone can register new users" ON usuarios
    FOR INSERT 
    WITH CHECK (true);

-- Política 2: Los usuarios pueden ver sus propios datos
CREATE POLICY "Users can view their own data" ON usuarios
    FOR SELECT 
    USING (auth.uid()::text = auth_id::text);

-- Política 3: Los usuarios pueden actualizar sus propios datos
CREATE POLICY "Users can update their own data" ON usuarios
    FOR UPDATE 
    USING (auth.uid()::text = auth_id::text)
    WITH CHECK (auth.uid()::text = auth_id::text);

-- Política 4: Solo admin puede eliminar usuarios
CREATE POLICY "Only admin can delete users" ON usuarios
    FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE auth_id = auth.uid() 
            AND type = 'admin'
        )
    );

-- Políticas más permisivas para lectura pública de artistas
CREATE POLICY "Everyone can view public artist data" ON artistas
    FOR SELECT USING (true);

-- Permitir que usuarios autenticados puedan crear perfiles de artista
CREATE POLICY "Authenticated users can create artist profiles" ON artistas
    FOR INSERT 
    WITH CHECK (auth.uid() IS NOT NULL);

-- Los artistas pueden gestionar sus propios datos
CREATE POLICY "Artists can manage their own data" ON artistas
    FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE auth_id = auth.uid() 
            AND id = artistas.user_id
        )
    );

-- Políticas más permisivas para canciones (lectura pública)
DROP POLICY IF EXISTS "Everyone can view public songs" ON canciones;
CREATE POLICY "Everyone can view public songs" ON canciones
    FOR SELECT USING (true);

-- Permitir que artistas creen canciones
CREATE POLICY "Artists can create songs" ON canciones
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM usuarios u 
            JOIN artistas a ON u.id = a.user_id 
            WHERE u.auth_id = auth.uid() 
            AND a.id = canciones.artista_id
        )
    );

-- Políticas similares para playlists
DROP POLICY IF EXISTS "Everyone can view public playlists" ON playlists;
CREATE POLICY "Everyone can view public playlists" ON playlists
    FOR SELECT USING (is_public = true OR EXISTS (
        SELECT 1 FROM usuarios 
        WHERE auth_id = auth.uid() 
        AND id = playlists.user_id
    ));

CREATE POLICY "Users can create playlists" ON playlists
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE auth_id = auth.uid() 
            AND id = playlists.user_id
        )
    );

-- Verificar que las políticas se crearon correctamente
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename IN ('usuarios', 'artistas', 'canciones', 'playlists')
ORDER BY tablename, policyname;

-- ===============================================
-- ALTERNATIVA MÁS SIMPLE: DESHABILITAR RLS TEMPORALMENTE
-- ===============================================

-- Si las políticas anteriores no funcionan, puedes usar esto temporalmente:
-- ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE artistas DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE canciones DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE playlists DISABLE ROW LEVEL SECURITY;

-- ===============================================
-- VERIFICAR CONFIGURACIÓN ACTUAL
-- ===============================================

-- Ver todas las tablas con RLS habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true;

-- Ver todas las políticas actuales
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public';
