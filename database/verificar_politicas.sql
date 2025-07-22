-- SOLO VERIFICAR - No modifica nada
SELECT 
  policyname,
  cmd,
  qual,
  'Política actual' as tipo
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND qual LIKE '%contenido-exclusivo%'
ORDER BY policyname;
