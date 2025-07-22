-- SOLUCIÓN ALTERNATIVA: Hacer el bucket público (SOLO PARA DESARROLLO)
-- Si no puedes crear políticas, esta es la solución más rápida

-- 1. Hacer el bucket público temporalmente
UPDATE storage.buckets 
SET public = true 
WHERE id = 'contenido-exclusivo';

-- 2. Verificar el cambio
SELECT 
  id,
  name,
  public,
  'Bucket ahora público - uploads sin RLS' as status
FROM storage.buckets 
WHERE id = 'contenido-exclusivo';
