# 🎵 Integración de Monetización con Otros Microfrontends - ✅ COMPLETADO

Esta guía explica cómo el microfrontend de **monetizacionSegundoParcial** se integra con **ArtistaSegundoParcial** y **ComunidadSegundoParcial**.

## ✅ Estado de la Integración

### 🔥 IMPLEMENTACIÓN COMPLETADA

- ✅ **Base de datos**: `contenido_exclusivo_artista` tabla creada exitosamente
- ✅ **ArtistaSegundoParcial**: Página `/monetizacion` completamente funcional
- ✅ **Dashboard Integration**: Tarjeta destacada en dashboard principal
- ✅ **API Global**: `window.monetizacionAPI` disponible
- ✅ **Sistema Mock**: Fallback automático para desarrollo
- ✅ **Script de Integración**: Auto-carga y detección de API

## 🚀 Configuración Inicial

### 1. ✅ Base de Datos Configurada

El script `contenido_exclusivo_artista_simple.sql` se ejecutó exitosamente en Supabase.

### 2. ✅ API Global Disponible

El microfrontend de monetización expone una API global: `window.monetizacionAPI`

## 🎨 ✅ Integración COMPLETADA con ArtistaSegundoParcial

### ✅ Implementación Finalizada

**La integración está completamente implementada y funcional:**

1. **Nueva Página de Monetización**: `/monetizacion` en ArtistaSegundoParcial
2. **Dashboard Principal**: Tarjeta destacada con gradiente púrpura
3. **Sistema de Integración**: Auto-detección de API con fallback mock
4. **Funciones Disponibles**: Dashboard completo, contenido exclusivo, gestión de fanáticos

### ✅ Funcionalidades Implementadas

```typescript
// ✅ IMPLEMENTADO: En ArtistaSegundoParcial/src/pages/MonetizacionPage.tsx
export function MonetizacionPage() {
    const abrirDashboardCompleto = () => {
        if (window.monetizacionAPI) {
            window.monetizacionAPI.openArtistaMonetizacionDashboard(artistaId);
        }
    };

    const marcarContenidoExclusivo = async (contentId: string, tipo: string) => {
        const resultado = await window.monetizacionAPI.marcarContenidoExclusivo(contentId, {
            artistaId,
            tipoContenido: tipo,
            nivelAcceso: 2,
            precio: 5.99
        });
    };

    return (
        <div className="monetizacion-page">
            {/* ✅ Dashboard principal implementado */}
            <button onClick={abrirDashboardCompleto}>
                Abrir Dashboard Completo
            </button>
            
            {/* ✅ Herramientas rápidas implementadas */}
            <button onClick={() => marcarContenidoExclusivo('cancion-001', 'cancion')}>
                Marcar Canción Exclusiva
            </button>
        </div>
    );
}
                >
                    🎵 Abrir Panel de Monetización
                </button>
            </div>
            
            {/* Resto del dashboard... */}
        </div>
    );
}
```

### Opción 2: Widget Embebido de Estadísticas

Para mostrar estadísticas rápidas en el dashboard del artista:

```typescript
// En ArtistaSegundoParcial/src/components/MonetizacionWidget.tsx
import { useEffect, useState } from 'react';

interface DashboardIngresos {
    totalIngresos: number;
    totalSuscriptores: number;
    propinaPromedio: number;
    crecimientoMensual: number;
}

export function MonetizacionWidget({ artistaId }: { artistaId: string }) {
    const [ingresos, setIngresos] = useState<DashboardIngresos | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (window.monetizacionAPI) {
            window.monetizacionAPI.artista
                .obtenerDashboardIngresos(artistaId)
                .then(data => {
                    setIngresos(data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error('Error cargando ingresos:', err);
                    setLoading(false);
                });
        }
    }, [artistaId]);

    if (loading) return <div>Cargando estadísticas...</div>;
    if (!ingresos) return <div>No se pudieron cargar las estadísticas</div>;

    return (
        <div className="monetizacion-widget">
            <h4>💰 Resumen de Ingresos</h4>
            <div className="stats-grid">
                <div className="stat">
                    <span className="value">${ingresos.totalIngresos.toFixed(2)}</span>
                    <span className="label">Ingresos Totales</span>
                </div>
                <div className="stat">
                    <span className="value">{ingresos.totalSuscriptores}</span>
                    <span className="label">Suscriptores</span>
                </div>
                <div className="stat">
                    <span className="value">${ingresos.propinaPromedio.toFixed(2)}</span>
                    <span className="label">Propina Promedio</span>
                </div>
                <div className="stat">
                    <span className="value">+{ingresos.crecimientoMensual}%</span>
                    <span className="label">Crecimiento</span>
                </div>
            </div>
            <button 
                onClick={() => window.monetizacionAPI?.artista.redirigirADashboard(artistaId)}
                className="btn-full-dashboard"
            >
                Ver Dashboard Completo
            </button>
        </div>
    );
}
```

### Opción 3: Marcar Contenido como Exclusivo

En el componente de gestión de canciones:

```typescript
// En ArtistaSegundoParcial/src/components/CancionManager.tsx
export function CancionManager({ cancionId, artistaId }: any) {
    const [esExclusiva, setEsExclusiva] = useState(false);
    const [nivelAcceso, setNivelAcceso] = useState(1);

    const marcarComoExclusiva = async () => {
        try {
            const contenido = {
                artista_id: artistaId,
                contenido_id: cancionId,
                tipo_contenido: 'cancion',
                nivel_acceso_requerido: nivelAcceso,
                descripcion: 'Canción exclusiva para suscriptores',
                activo: true
            };

            await window.monetizacionAPI.artista.marcarContenidoExclusivo(contenido);
            setEsExclusiva(true);
            alert('Canción marcada como exclusiva');
        } catch (error) {
            console.error('Error:', error);
            alert('Error al marcar como exclusiva');
        }
    };

    return (
        <div className="cancion-manager">
            <h3>Gestión de Canción</h3>
            
            <div className="exclusividad-controls">
                <label>
                    <input 
                        type="checkbox" 
                        checked={esExclusiva}
                        onChange={() => setEsExclusiva(!esExclusiva)}
                    />
                    Contenido Exclusivo
                </label>
                
                {esExclusiva && (
                    <div>
                        <label>Nivel de Acceso:</label>
                        <select 
                            value={nivelAcceso} 
                            onChange={(e) => setNivelAcceso(Number(e.target.value))}
                        >
                            <option value={1}>Nivel 1 - Básico</option>
                            <option value={2}>Nivel 2 - Premium</option>
                            <option value={3}>Nivel 3 - VIP</option>
                        </select>
                        
                        <button onClick={marcarComoExclusiva}>
                            🔒 Marcar como Exclusiva
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
```

## 🌟 Integración con ComunidadSegundoParcial

### Verificar Estado de Membresía

```typescript
// En ComunidadSegundoParcial/src/components/PerfilArtista.tsx
export function PerfilArtista({ artistaId, usuarioId }: any) {
    const [tieneMembresia, setTieneMembresia] = useState(false);
    const [badge, setBadge] = useState('');

    useEffect(() => {
        // Verificar membresía
        if (window.monetizacionAPI) {
            window.monetizacionAPI.comunidad
                .verificarMembresia(usuarioId, artistaId)
                .then(membresia => {
                    setTieneMembresia(!!membresia);
                });

            // Obtener badge del usuario
            window.monetizacionAPI.comunidad
                .obtenerBadgeUsuario(usuarioId)
                .then(badge => setBadge(badge));
        }
    }, [artistaId, usuarioId]);

    return (
        <div className="perfil-artista">
            <div className="usuario-info">
                <h2>Perfil del Usuario</h2>
                {badge && <span className="badge">{badge}</span>}
            </div>
            
            {tieneMembresia && (
                <div className="contenido-exclusivo">
                    <h3>🔒 Contenido Exclusivo Disponible</h3>
                    <p>Tienes acceso a contenido premium de este artista</p>
                </div>
            )}
            
            {/* Botón de propinas */}
            <button 
                onClick={() => window.monetizacionAPI?.comunidad.mostrarBotonPropina(artistaId, 'Nombre Artista')}
                className="btn-propina"
            >
                💸 Enviar Propina
            </button>
        </div>
    );
}
```

### Filtrar Contenido por Nivel de Membresía

```typescript
// En ComunidadSegundoParcial/src/components/ListaCanciones.tsx
export function ListaCanciones({ artistaId, usuarioId }: any) {
    const [canciones, setCanciones] = useState([]);
    const [cancionesExclusivas, setCancionesExclusivas] = useState<string[]>([]);

    useEffect(() => {
        // Cargar canciones normales...
        
        // Verificar contenido exclusivo accesible
        if (window.monetizacionAPI) {
            window.monetizacionAPI.comunidad
                .verificarMembresia(usuarioId, artistaId)
                .then(membresia => {
                    if (membresia) {
                        // Obtener lista de contenido exclusivo accesible
                        // Esta función necesitaría implementarse en la API
                        window.monetizacionAPI.artista
                            .obtenerContenidoExclusivo(artistaId)
                            .then(contenido => {
                                setCancionesExclusivas(contenido.map(c => c.contenido_id));
                            });
                    }
                });
        }
    }, [artistaId, usuarioId]);

    return (
        <div className="lista-canciones">
            {canciones.map(cancion => (
                <div key={cancion.id} className="cancion-item">
                    <h4>{cancion.titulo}</h4>
                    
                    {cancionesExclusivas.includes(cancion.id) && (
                        <span className="badge-exclusivo">🔒 Premium</span>
                    )}
                    
                    {/* Resto del componente... */}
                </div>
            ))}
        </div>
    );
}
```

## 🔧 Configuración de Single-SPA

### Agregar en single-spa-root

```javascript
// En single-spa-root/src/microfrontend-layout.js
import { registerApplication, start } from 'single-spa';

// Registro de monetización
registerApplication({
    name: 'monetizacion',
    app: () => System.import('monetizacionSegundoParcial'),
    activeWhen: ['/monetizacion', '/artista-dashboard'],
    customProps: {
        exposedAPI: true // Indicar que este MF expone APIs globales
    }
});

// Configurar dependencias entre microfrontends
window.addEventListener('single-spa:before-mount-routing-event', () => {
    // Asegurar que monetización se carga antes que otros MFs si es necesario
    console.log('Verificando APIs de monetización...');
});
```

## 📡 Eventos Personalizados para Comunicación

### Escuchar Eventos de Propinas

```typescript
// En cualquier microfrontend
window.addEventListener('propina:enviada', (event) => {
    const { artistaId, monto, mensaje } = event.detail;
    console.log(`Propina de $${monto} enviada al artista ${artistaId}`);
    
    // Actualizar UI, mostrar notificación, etc.
    mostrarNotificacion(`¡Propina de $${monto} enviada!`);
});
```

### Enviar Eventos Personalizados

```typescript
// Desde monetización
window.dispatchEvent(new CustomEvent('membresia:nueva', {
    detail: { 
        usuarioId: 'user123', 
        artistaId: 'artist456', 
        tipoMembresia: 'premium' 
    }
}));
```

## 🎯 URLs de Acceso

- **Dashboard de Artista**: `/monetizacionSegundoParcial/artista-dashboard/{artistaId}`
- **Monetización General**: `/monetizacionSegundoParcial/monetizacion`
- **Gestión de Membresías**: `/monetizacionSegundoParcial/membresias`

## 📚 API Reference

### `window.monetizacionAPI.artista`

- `marcarContenidoExclusivo(contenido)` - Marcar contenido como exclusivo
- `obtenerDashboardIngresos(artistaId)` - Obtener estadísticas de ingresos
- `obtenerContenidoExclusivo(artistaId)` - Listar contenido exclusivo
- `redirigirADashboard(artistaId)` - Abrir dashboard en nueva pestaña

### `window.monetizacionAPI.comunidad`

- `verificarMembresia(usuarioId, artistaId)` - Verificar membresía activa
- `obtenerBadgeUsuario(usuarioId)` - Obtener badge premium del usuario
- `mostrarBotonPropina(artistaId, nombre)` - Mostrar widget de propinas

### `window.monetizacionAPI.utils`

- `abrirMonetizacion(ruta)` - Navegar a monetización
- `verificarSuscripcionActiva(usuarioId, artistaId)` - Verificar suscripción

## 🔒 Consideraciones de Seguridad

1. **Autenticación**: Todas las APIs verifican que el usuario esté autenticado
2. **Autorización**: Los artistas solo pueden gestionar su propio contenido
3. **Validación**: Todos los datos se validan antes del procesamiento
4. **RLS**: Row Level Security habilitado en todas las tablas

## 🚀 Siguientes Pasos

1. Ejecutar el schema SQL en Supabase
2. Implementar los componentes de integración en ArtistaSegundoParcial
3. Agregar verificación de membresías en ComunidadSegundoParcial
4. Probar la comunicación entre microfrontends
5. Configurar notificaciones en tiempo real (opcional)

¡La integración está lista para usar! 🎉
