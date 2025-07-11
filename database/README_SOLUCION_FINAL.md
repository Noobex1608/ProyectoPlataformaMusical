# 🎵 SOLUCIÓN DEFINITIVA PARA LIKES

## 📋 RESUMEN DEL PROBLEMA
- Error HTTP 406/400 al dar likes desde el frontend
- Posible falta de restricción UNIQUE en la tabla likes_canciones
- Problemas con RLS o estructura de tabla

## 🔧 SOLUCIÓN PASO A PASO

### 1. 🗃️ EJECUTAR SCRIPT EN SUPABASE
1. Ve a tu proyecto Supabase
2. Abre el **Query Editor**
3. Copia y pega el contenido de `database/solucion_final_likes.sql`
4. Ejecuta **PASO A PASO** (no todo de una vez)

### 2. 🔍 VERIFICAR EN SUPABASE
Después de ejecutar el script, verifica que:
- La tabla `likes_canciones` existe
- Tiene la restricción UNIQUE
- Las operaciones básicas funcionan

### 3. 🖥️ CAMBIOS EN EL FRONTEND
Los cambios ya están aplicados:
- ✅ Usa `useLikesSimple.ts` (más robusto)
- ✅ Corregida importación en `playlistDetail.vue`
- ✅ Mejores logs para debugging
- ✅ Mejor manejo de errores

### 4. 🧪 PROBAR EN EL NAVEGADOR
1. Navega a una playlist con canciones
2. Abre **DevTools** (F12)
3. Ve a la pestaña **Console**
4. Intenta dar like a una canción
5. Revisa los logs en la consola

### 5. 📊 LOGS ESPERADOS
Deberías ver logs como:
```
Iniciando carga de playlist: 1
Procesando canción: 1
Intentando dar like a canción: 1 por usuario: 1
Resultado verificación: [] null
Resultado inserción: [Object] null
Like agregado exitosamente
```

## 🔍 ARCHIVOS MODIFICADOS/CREADOS

### Base de Datos
- `database/solucion_final_likes.sql` - Script completo de solución
- `database/verificar_likes.sql` - Para verificar estado actual
- `database/debug_frontend_likes.sql` - Para debugging específico

### Frontend
- `ComunidadSegundoParcial/src/composables/useLikesSimple.ts` - Composable mejorado
- `ComunidadSegundoParcial/src/views/playlistDetail.vue` - Mejor manejo de errores

### Documentación
- `database/SOLUCION_LIKES.md` - Guía completa de troubleshooting

## 🚨 SI SIGUE FALLANDO

### Opción A: Error de importación
```javascript
// Si ves: "does not provide an export named 'useLikes'"
// Verifica que en playlistDetail.vue tengas:
import { useLikesSimple } from '../composables/useLikesSimple';
const { darLike, quitarLike, verificarLike } = useLikesSimple();
```

### Opción B: Verificar conexión
```javascript
// En la consola del navegador
console.log('Supabase URL:', supabase.supabaseUrl);
console.log('Supabase Key:', supabase.supabaseKey);
```

### Opción C: Desactivar RLS temporalmente
```sql
-- En Supabase Query Editor
ALTER TABLE likes_canciones DISABLE ROW LEVEL SECURITY;
```

### Opción D: Verificar datos de prueba
```sql
-- Verificar que existen usuarios y canciones
SELECT id FROM usuarios WHERE id = 1;
SELECT id FROM canciones WHERE id = 1;
```

## 📞 PRÓXIMOS PASOS

1. **Ejecutar** `database/solucion_final_likes.sql`
2. **Probar** en el navegador
3. **Verificar** logs en consola
4. **Reportar** cualquier error específico

## 🎯 ESTADO ACTUAL
- ✅ Scripts SQL preparados
- ✅ Frontend actualizado
- ✅ Composable mejorado
- ✅ Documentación completa
- ⏳ Pendiente: Ejecutar script en Supabase

El sistema debería funcionar correctamente después de ejecutar el script final.
