# Guía de Solución para Errores HTTP 406/400 en Likes

## Problema Identificado
- Error HTTP 406 (Not Acceptable) o 400 (Bad Request) al intentar dar likes desde el frontend
- Posible falta de restricción UNIQUE en la tabla likes_canciones
- Problemas con políticas RLS o estructura de tabla

## Solución Paso a Paso

### 1. Verificar Estado Actual
Ejecutar en Supabase Query Editor:
```sql
-- Verificar si existe la tabla
SELECT table_name FROM information_schema.tables WHERE table_name = 'likes_canciones';

-- Verificar estructura
\d likes_canciones;

-- Verificar restricciones
SELECT conname FROM pg_constraint WHERE conrelid = 'likes_canciones'::regclass;
```

### 2. Recrear Tabla (Si es necesario)
Usar el script `recrear_likes.sql`:
```bash
# Ejecutar en Supabase Query Editor
# Copiá el contenido de database/recrear_likes.sql
```

### 3. Probar Funcionamiento Básico
Usar el script `test_likes_simple.sql`:
```bash
# Ejecutar en Supabase Query Editor
# Copiá el contenido de database/test_likes_simple.sql
```

### 4. Usar Composable Simplificado
Reemplazar el import en `playlistDetail.vue`:
```vue
// Cambiar de:
import { useLikes } from '../composables/useLikes';

// A:
import { useLikes } from '../composables/useLikesSimple';
```

### 5. Probar en el Frontend
1. Abrir la consola del navegador
2. Ir a una playlist con canciones
3. Intentar dar like a una canción
4. Verificar los logs en la consola

### 6. Verificar Logs
Los logs deberían mostrar:
```
Intentando dar like a canción: X por usuario: 1
Resultado verificación: [...] null
Resultado inserción: [...] null
Like agregado exitosamente
```

### 7. Soluciones Alternativas

#### Si el problema persiste:
1. **Verificar conexión a Supabase:**
   ```javascript
   console.log('Supabase URL:', supabase.supabaseUrl);
   console.log('Supabase Key:', supabase.supabaseKey);
   ```

2. **Verificar políticas RLS:**
   ```sql
   -- Crear política más permisiva
   DROP POLICY IF EXISTS "allow_all" ON likes_canciones;
   CREATE POLICY "allow_all_operations" ON likes_canciones
   FOR ALL USING (true) WITH CHECK (true);
   ```

3. **Verificar referencias FK:**
   ```sql
   -- Verificar que existen los usuarios y canciones
   SELECT id FROM usuarios WHERE id = 1;
   SELECT id FROM canciones WHERE id = 1;
   ```

4. **Desactivar RLS temporalmente:**
   ```sql
   ALTER TABLE likes_canciones DISABLE ROW LEVEL SECURITY;
   ```

### 8. Archivos Creados
- `database/verificar_likes.sql` - Verificar estado actual
- `database/recrear_likes.sql` - Recrear tabla con restricciones
- `database/test_likes_simple.sql` - Probar funcionamiento básico
- `database/debug_frontend_likes.sql` - Debuggear problemas específicos
- `ComunidadSegundoParcial/src/composables/useLikesSimple.ts` - Composable simplificado

### 9. Próximos Pasos
1. Ejecutar scripts de verificación
2. Recrear tabla si es necesario
3. Probar con composable simplificado
4. Verificar logs en consola del navegador
5. Ajustar políticas RLS si es necesario

### 10. Troubleshooting

#### Error: "duplicate key value violates unique constraint"
- La restricción UNIQUE funciona correctamente
- El problema está en el frontend, no en la base de datos

#### Error: "relation does not exist"
- La tabla no existe
- Ejecutar `recrear_likes.sql`

#### Error: "permission denied"
- Problema con políticas RLS
- Usar política más permisiva o desactivar RLS temporalmente

#### Error: "violates foreign key constraint"
- Los IDs de usuario o canción no existen
- Verificar que existen datos en las tablas relacionadas
