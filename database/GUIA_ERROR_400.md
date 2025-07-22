# 🔧 NUEVO: Solución al Error 400 - Guía de Resolución

## 🎯 **Error Actual:**
```
Failed to load resource: the server responded with a status of 400 ()
Error obteniendo registros de contenido_exclusivo_artista
```

## 📋 **Pasos de Resolución (En Orden):**

### **Paso 1: Verificar si la tabla existe**
1. Ve a tu Dashboard de Supabase
2. Abre el **SQL Editor**
3. Ejecuta este script:

```sql
-- Verificar si existe la tabla
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'contenido_exclusivo_artista' 
            AND table_schema = 'public'
        ) 
        THEN '✅ La tabla contenido_exclusivo_artista EXISTE'
        ELSE '❌ La tabla contenido_exclusivo_artista NO EXISTE'
    END as estado_tabla;
```

### **Paso 2: Si la tabla NO existe, crearla**
Si el paso anterior muestra que la tabla NO existe, ejecuta este script:

```sql
-- Crear la tabla
CREATE TABLE IF NOT EXISTS public.contenido_exclusivo_artista (
    id SERIAL PRIMARY KEY,
    artista_id UUID NOT NULL,
    contenido_id TEXT NOT NULL,
    tipo_contenido TEXT CHECK (tipo_contenido IN ('cancion', 'album', 'letra', 'video', 'foto')),
    descripcion TEXT NOT NULL,
    nivel_acceso_requerido INTEGER DEFAULT 1 CHECK (nivel_acceso_requerido IN (1, 2, 3)),
    precio_individual DECIMAL(10,2),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_contenido_exclusivo_artista_id ON public.contenido_exclusivo_artista(artista_id);
CREATE INDEX IF NOT EXISTS idx_contenido_exclusivo_tipo ON public.contenido_exclusivo_artista(tipo_contenido);
CREATE INDEX IF NOT EXISTS idx_contenido_exclusivo_activo ON public.contenido_exclusivo_artista(activo);

-- Habilitar RLS
ALTER TABLE public.contenido_exclusivo_artista ENABLE ROW LEVEL SECURITY;
```

### **Paso 3: Configurar Políticas RLS**
En el Dashboard de Supabase:

1. Ve a **Authentication** → **Policies**
2. Busca la tabla `contenido_exclusivo_artista`
3. Crea estas políticas:

**Política 1: Lectura pública**
- Policy name: `Enable read access for all users`
- Target roles: `public`
- Policy definition: `SELECT`
- Using expression: `true`

**Política 2: Gestión de artistas**
- Policy name: `Enable insert for authenticated users based on user_id`
- Target roles: `authenticated`
- Policy definition: `ALL`
- Using expression: `auth.uid() = artista_id`

### **Paso 4: Verificar el contexto del artista**
1. Abre la consola del navegador (F12)
2. Navega a la sección de Contenido Exclusivo
3. Verifica que veas estos logs:
   ```
   🔍 Inicializando contexto de monetización...
   ✅ ArtistaId encontrado: [algún-id]
   🔍 ContenidoExclusivoService: Intentando cargar contenidos...
   ```

### **Paso 5: Si el artistaId no aparece**
Asegúrate de que tu URL incluya los parámetros necesarios:
```
http://localhost:4200/?userType=artista&artistaId=artista-123&section=contenido-exclusivo
```

## 🔍 **Verificación Final:**
Después de seguir todos los pasos:

1. Refresca la página
2. Abre la consola del navegador
3. Deberías ver:
   ```
   ✅ Contenidos cargados exitosamente: []
   📦 Contenidos recibidos en componente: []
   ```

## ⚡ **Si todo falla:**
Como último recurso, ejecuta este script para crear datos de prueba:

```sql
-- Insertar datos de prueba
INSERT INTO public.contenido_exclusivo_artista (
    artista_id, 
    contenido_id, 
    tipo_contenido, 
    descripcion, 
    nivel_acceso_requerido,
    activo
) VALUES 
    ('artista-123', 'cancion_001', 'cancion', 'Mi nueva canción exclusiva', 1, true),
    ('artista-123', 'video_001', 'video', 'Video detrás de cámaras', 2, true),
    ('artista-123', 'foto_001', 'foto', 'Sesión de fotos exclusiva', 1, true);
```

## 📞 **Siguiente Paso:**
Una vez que completes estos pasos, ejecuta la aplicación y verifica en la consola qué logs aparecen. Esto nos ayudará a identificar exactamente dónde está el problema.
