# 🎵 Sistema de Likes y Estadísticas - Implementación

## 📋 Resumen
Este sistema permite a los usuarios dar likes a canciones desde **ComunidadSegundoParcial** y que las estadísticas se reflejen automáticamente en **ArtistaSegundoParcial**.

## 🚀 Pasos de Implementación

### 1. **Ejecutar Script SQL en Supabase**

#### Opción A: Script Completo (Recomendado)
```bash
# Ejecutar en Supabase SQL Editor
database/implementar_likes_estadisticas.sql
```

#### Opción B: Script Simplificado (Básico)
```bash
# Para una implementación más simple
database/likes_simple.sql
```

### 2. **Verificar Tablas Creadas**

Después de ejecutar el script, verifica que estas tablas existan:

- ✅ `likes_canciones` - Nueva tabla para almacenar likes
- ✅ `perfil_artistas` - Actualizada con columnas de estadísticas
- ✅ Triggers automáticos funcionando

### 3. **Integrar Composable en ComunidadSegundoParcial**

El archivo `useLikes.ts` ya está creado en:
```
ComunidadSegundoParcial/src/composables/useLikes.ts
```

### 4. **Actualizar playlistDetail.vue**

Agregar las importaciones y funcionalidad:

```vue
<script setup lang="ts">
// ... imports existentes ...
import { useLikes } from '../composables/useLikes';

// ... código existente ...

// Agregar composable de likes
const { darLike, quitarLike, verificarLike, registrarReproduccion } = useLikes();

// Actualizar función toggleLike
const toggleLike = async (cancionId: number) => {
  const cancion = cancionesPlaylist.value.find(c => c.id === cancionId);
  if (!cancion) return;

  if (cancion.liked) {
    const success = await quitarLike(cancionId);
    if (success) {
      cancion.liked = false;
    }
  } else {
    const success = await darLike(cancionId);
    if (success) {
      cancion.liked = true;
    }
  }
};

// Actualizar función de reproducción para registrar estadísticas
const toggleReproduccion = async () => {
  if (!audioElement.value || !cancionActual.value?.audio_data) {
    console.warn('No hay audio disponible para reproducir');
    return;
  }

  try {
    if (reproduciendose.value) {
      audioElement.value.pause();
      reproduciendose.value = false;
      
      // Registrar reproducción si se reprodujo más de 30 segundos
      if (tiempoActual.value > 30 && cancionActual.value?.id) {
        await registrarReproduccion(cancionActual.value.id, tiempoActual.value);
      }
    } else {
      await audioElement.value.play();
      reproduciendose.value = true;
    }
  } catch (error) {
    console.error('Error reproduciendo audio:', error);
    reproduciendose.value = false;
  }
};

// Actualizar cargarDatosPlaylist para verificar likes
const cargarDatosPlaylist = async () => {
  loadingCanciones.value = true;
  try {
    await obtenerPlaylistPorId(playlistId.value);
    await obtenerCancionesPlaylist(playlistId.value);
    
    // Mapear las canciones y verificar likes
    const cancionesMapeadas = await Promise.all(
      playlistCanciones.value.map(async (playlistCancion: any) => {
        const cancionId = playlistCancion.canciones?.id || playlistCancion.cancion_id;
        const cancion = {
          id: cancionId,
          title: playlistCancion.canciones?.title || 'Sin título',
          artist: playlistCancion.canciones?.artist || 'Artista desconocido',
          album: playlistCancion.canciones?.album || 'Sin álbum',
          duration: playlistCancion.canciones?.duration || 0,
          genre: playlistCancion.canciones?.genre || '',
          imagen_url: playlistCancion.canciones?.imagen_url || null,
          audio_data: playlistCancion.canciones?.audio_data || null,
          artista_id: playlistCancion.canciones?.artista_id || null,
          orden: playlistCancion.orden || 0,
          liked: await verificarLike(cancionId)
        };
        return cancion;
      })
    );
    
    cancionesPlaylist.value = cancionesMapeadas;
    
    // Seleccionar la primera canción por defecto
    if (cancionesPlaylist.value.length > 0) {
      seleccionarCancion(cancionesPlaylist.value[0], 0);
    }
  } catch (error) {
    console.error('Error cargando playlist:', error);
  } finally {
    loadingCanciones.value = false;
  }
};
</script>
```

### 5. **Crear Hook para ArtistaSegundoParcial**

Crear el archivo `useEstadisticas.ts`:

```typescript
// ArtistaSegundoParcial/src/hooks/useEstadisticas.ts
import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

interface EstadisticasArtista {
  likes: number;
  reproducciones: number;
  seguidores: number;
  updated_at: string;
}

export const useEstadisticas = () => {
  const [estadisticas, setEstadisticas] = useState<EstadisticasArtista | null>(null);
  const [loading, setLoading] = useState(true);

  const cargarEstadisticas = async (artistaId: string) => {
    try {
      const { data, error } = await supabase
        .from('perfil_artistas')
        .select('likes, reproducciones, seguidores, updated_at')
        .eq('artista_id', artistaId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setEstadisticas(data || {
        likes: 0,
        reproducciones: 0,
        seguidores: 0,
        updated_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    estadisticas,
    loading,
    cargarEstadisticas
  };
};
```

### 6. **Actualizar Componente de Perfil de Artista**

```tsx
// En tu componente de perfil de artista
import { useEstadisticas } from '../hooks/useEstadisticas';
import { useArtistaActual } from '../hooks/useArtistaActual';

const PerfilArtistaPage = () => {
  const { artista } = useArtistaActual();
  const { estadisticas, loading, cargarEstadisticas } = useEstadisticas();

  useEffect(() => {
    if (artista?.id) {
      cargarEstadisticas(artista.id);
    }
  }, [artista]);

  if (loading) return <div>Cargando estadísticas...</div>;

  return (
    <div className="perfil-artista">
      <div className="estadisticas-grid">
        <div className="stat-card">
          <h3>❤️ Likes</h3>
          <p className="stat-number">{estadisticas?.likes || 0}</p>
        </div>
        <div className="stat-card">
          <h3>🎵 Reproducciones</h3>
          <p className="stat-number">{estadisticas?.reproducciones || 0}</p>
        </div>
        <div className="stat-card">
          <h3>👥 Seguidores</h3>
          <p className="stat-number">{estadisticas?.seguidores || 0}</p>
        </div>
      </div>
    </div>
  );
};
```

## 🔄 Flujo de Funcionamiento

1. **Usuario da like** en ComunidadSegundoParcial
2. **Se inserta registro** en `likes_canciones`
3. **Trigger automático** actualiza `perfil_artistas`
4. **Estadísticas se reflejan** en ArtistaSegundoParcial

## 🧪 Pruebas

### Probar Likes:
1. Ir a una playlist en ComunidadSegundoParcial
2. Dar click en el botón de like (🤍 → ❤️)
3. Verificar en Supabase que el registro se guardó

### Probar Estadísticas:
1. Abrir ArtistaSegundoParcial
2. Ir al perfil del artista
3. Verificar que las estadísticas de likes se muestren

### Verificar Automación:
```sql
-- En Supabase SQL Editor
SELECT * FROM likes_canciones ORDER BY liked_at DESC LIMIT 10;
SELECT * FROM perfil_artistas WHERE likes > 0;
```

## 🛠️ Troubleshooting

### Si no funcionan los likes:
1. Verificar que las tablas existan
2. Revisar los triggers en Supabase
3. Verificar permisos RLS

### Si no se actualizan estadísticas:
1. Ejecutar manualmente: `SELECT recalcular_estadisticas_artistas();`
2. Verificar logs de Supabase
3. Revisar que el `artista_id` sea correcto

## 🎯 Estado del Sistema

- ✅ Base de datos configurada
- ✅ Composable de likes creado
- ✅ Hook de estadísticas creado
- ⏳ Integración en componentes (siguiente paso)
- ⏳ Pruebas de funcionamiento

¡El sistema está listo para implementar! Solo falta integrar el código en los componentes existentes.
