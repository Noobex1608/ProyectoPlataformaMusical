-- Políticas adicionales para la carpeta albums/ dentro del bucket images
-- Ejecutar en el SQL Editor de Supabase si es necesario

-- Permitir lectura pública específica para álbumes
CREATE POLICY "Permitir lectura pública de álbumes" ON storage.objects
FOR SELECT USING (bucket_id = 'images' AND (storage.foldername(name))[1] = 'albums');

-- Permitir subida de imágenes de álbumes
CREATE POLICY "Permitir subida de imágenes de álbumes" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'images' AND (storage.foldername(name))[1] = 'albums');

-- Permitir actualización de imágenes de álbumes
CREATE POLICY "Permitir actualización de imágenes de álbumes" ON storage.objects
FOR UPDATE USING (bucket_id = 'images' AND (storage.foldername(name))[1] = 'albums');

-- Permitir eliminación de imágenes de álbumes
CREATE POLICY "Permitir eliminación de imágenes de álbumes" ON storage.objects
FOR DELETE USING (bucket_id = 'images' AND (storage.foldername(name))[1] = 'albums');

-- Verificar políticas existentes
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%images%'
ORDER BY policyname;
