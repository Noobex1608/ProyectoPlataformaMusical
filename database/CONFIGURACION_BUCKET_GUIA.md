# Configuración del Bucket de Contenido Exclusivo en Supabase

## Método 1: Desde el Dashboard de Supabase (Recomendado)

### Paso 1: Crear el Bucket
1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **Storage** en el menú lateral
3. Haz clic en **"New bucket"**
4. Configura el bucket con estos valores:
   - **Name**: `contenido-exclusivo`
   - **Public bucket**: ✅ Activado (para permitir acceso público a los archivos)
   - **File size limit**: `200 MB`
   - **Allowed MIME types**: 
     ```
     image/jpeg, image/png, image/webp, image/gif,
     video/mp4, video/webm, video/quicktime, video/avi,
     audio/mpeg, audio/wav, audio/flac, audio/mp4, audio/ogg,
     application/pdf, text/plain, text/html,
     application/zip, application/x-rar-compressed
     ```

### Paso 2: Configurar Políticas de Seguridad
1. En la página de Storage, selecciona el bucket `contenido-exclusivo`
2. Ve a la pestaña **"Policies"**
3. Crea las siguientes políticas:

#### Política 1: Permitir a artistas subir archivos
- **Policy name**: `Artistas pueden subir archivos`
- **Target roles**: `authenticated`
- **Policy definition**: `INSERT`
- **Policy expression**:
  ```sql
  bucket_id = 'contenido-exclusivo' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  ```

#### Política 2: Permitir a artistas gestionar sus archivos
- **Policy name**: `Artistas pueden gestionar sus archivos`
- **Target roles**: `authenticated`
- **Policy definition**: `ALL`
- **Policy expression**:
  ```sql
  bucket_id = 'contenido-exclusivo' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  ```

#### Política 3: Acceso público de lectura
- **Policy name**: `Acceso público de lectura`
- **Target roles**: `public`
- **Policy definition**: `SELECT`
- **Policy expression**:
  ```sql
  bucket_id = 'contenido-exclusivo'
  ```

## Método 2: Usando SQL (Alternativo)

Si tienes permisos de administrador, puedes ejecutar el script `crear_bucket_simple.sql` y luego configurar las políticas manualmente desde el dashboard.

## Verificación

Para verificar que todo está configurado correctamente:

1. **Verifica el bucket**:
   ```sql
   SELECT * FROM storage.buckets WHERE id = 'contenido-exclusivo';
   ```

2. **Verifica las políticas**:
   ```sql
   SELECT policyname, cmd, qual 
   FROM pg_policies 
   WHERE tablename = 'objects' 
     AND schemaname = 'storage'
     AND policyname LIKE '%contenido%';
   ```

## Estructura de Carpetas

Los archivos se organizarán de la siguiente manera:
```
contenido-exclusivo/
├── {artista_id}/
│   ├── canciones/
│   ├── videos/
│   ├── fotos/
│   ├── albums/
│   └── letras/
```

## Notas Importantes

- ✅ El bucket debe ser **público** para permitir que los usuarios puedan acceder al contenido
- ✅ Las políticas aseguran que solo los artistas puedan subir/gestionar sus propios archivos
- ✅ La estructura de carpetas por `artista_id` mantiene la organización y seguridad
- ✅ Los tipos MIME están configurados para soportar todos los formatos de contenido musical
