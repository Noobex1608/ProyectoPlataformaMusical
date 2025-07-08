-- ===============================================
-- SCRIPT SIMPLE: DESHABILITAR RLS TEMPORALMENTE
-- Para solucionar el problema de registro rápidamente
-- ===============================================

-- Deshabilitar RLS en todas las tablas principales
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE artistas DISABLE ROW LEVEL SECURITY;
ALTER TABLE canciones DISABLE ROW LEVEL SECURITY;
ALTER TABLE albumes DISABLE ROW LEVEL SECURITY;
ALTER TABLE eventos DISABLE ROW LEVEL SECURITY;
ALTER TABLE playlists DISABLE ROW LEVEL SECURITY;
ALTER TABLE radios DISABLE ROW LEVEL SECURITY;
ALTER TABLE club_fans DISABLE ROW LEVEL SECURITY;

-- Verificar que RLS está deshabilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('usuarios', 'artistas', 'canciones', 'albumes', 'eventos', 'playlists', 'radios', 'club_fans');

-- Este script deshabilitará temporalmente RLS para permitir el registro
-- Una vez que todo funcione, puedes volver a habilitar RLS con políticas específicas

-- Para re-habilitar RLS más tarde (NO EJECUTAR AHORA):
-- ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE artistas ENABLE ROW LEVEL SECURITY;
-- etc.
