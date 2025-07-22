# 🔄 Sistema de Selector de Monetización

## 🎯 Concepto

El sistema de selector reemplaza las páginas estáticas con **selectores inteligentes** que detectan el origen del usuario y redirigen al microfrontend de monetización con contexto específico.

## 🏗️ Arquitectura

### ArtistaSegundoParcial → Monetización
```
[Dashboard Artista] → [💰 Monetización] → [MonetizacionSelector] → [Microfrontend Monetización]
                                                ↓
                                        userType: 'artista'
                                        context: artista_data
                                        section: 'dashboard|contenido|reportes|etc'
```

### ComunidadSegundoParcial → Monetización
```
[UserTypeSelection] → [💰 Monetización] → [MonetizacionSelector] → [Microfrontend Monetización]
                                                ↓
                                        userType: 'comunidad'
                                        context: user_data
                                        section: 'suscripciones|descubrimiento|etc'
```

## ✅ Implementación Actual

### 1. MonetizacionSelector en ArtistaSegundoParcial

**Archivo**: `ArtistaSegundoParcial/src/pages/MonetizacionPage.tsx`

**Funcionalidad**:
- ✅ Detecta origen: `userOrigin = 'artista'`
- ✅ Contextualiza: Datos del artista activo
- ✅ Redirecciona: `window.location.href` con parámetros
- ✅ Persiste: `localStorage` para contexto

**Opciones Disponibles**:
- 📊 Dashboard Completo
- 🔒 Contenido Exclusivo
- 👥 Gestión de Fanáticos
- 📈 Reportes de Ingresos
- ⚙️ Configuración

### 2. Parámetros de Redirección

```javascript
// URL generada
http://localhost:5179?userType=artista&artistaId=artista-123&section=dashboard

// LocalStorage
{
  "userType": "artista",
  "artistaId": "artista-123",
  "userName": "Mi Proyecto Musical",
  "originApp": "ArtistaSegundoParcial"
}
```

## 🚀 Cómo Usar

### Desde ArtistaSegundoParcial

1. **Acceder al selector**:
   ```
   Dashboard → Tarjeta "💰 Monetización" → /monetizacion
   ```

2. **Seleccionar herramienta**:
   - Cada botón redirecciona con contexto específico
   - Se abre en la misma ventana para experiencia fluida

3. **Contexto automático**:
   - El microfrontend recibe datos del artista
   - Solo muestra herramientas relevantes para artistas

### Para Implementar en ComunidadSegundoParcial

```vue
<!-- ComunidadSegundoParcial/src/views/MonetizacionSelector.vue -->
<template>
  <div class="monetizacion-selector">
    <div class="welcome-section">
      <h1>💰 Monetización</h1>
      <p>Como <strong>fanático</strong>, accede a suscripciones y contenido premium</p>
    </div>

    <div class="options-grid">
      <button @click="redirectToMonetizacion('suscripciones')">
        <div class="option-icon">⭐</div>
        <div class="option-content">
          <h3>Mis Suscripciones</h3>
          <p>Gestiona tus membresías activas</p>
        </div>
      </button>

      <button @click="redirectToMonetizacion('descubrimiento')">
        <div class="option-icon">🔍</div>
        <div class="option-content">
          <h3>Descubrir Premium</h3>
          <p>Encuentra contenido exclusivo</p>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup>
const redirectToMonetizacion = (section) => {
  const params = new URLSearchParams({
    userType: 'comunidad',
    userId: userData.id,
    section: section
  });
  
  localStorage.setItem('monetizacion_context', JSON.stringify({
    userType: 'comunidad',
    userId: userData.id,
    originApp: 'ComunidadSegundoParcial'
  }));

  window.location.href = `http://localhost:5179?${params.toString()}`;
};
</script>
```

## 🎨 Flujo de Usuario

### Escenario Artista
1. **ArtistaSegundoParcial**: Dashboard principal
2. **Click**: Tarjeta "💰 Monetización"
3. **Selector**: Herramientas específicas de artista
4. **Redirección**: Microfrontend con contexto artista
5. **Experiencia**: Solo ve herramientas de monetización para artistas

### Escenario Comunidad
1. **ComunidadSegundoParcial**: UserTypeSelection o Dashboard
2. **Click**: Opción "💰 Explorar Premium" 
3. **Selector**: Herramientas específicas de fanático
4. **Redirección**: Microfrontend con contexto comunidad
5. **Experiencia**: Solo ve suscripciones y contenido premium

## 🔧 Configuración en Microfrontend

El microfrontend de monetización debe leer los parámetros y contexto:

```typescript
// monetizacionSegundoParcial/src/services/context.service.ts
export class ContextService {
  static getMonetizacionContext() {
    const urlParams = new URLSearchParams(window.location.search);
    const storageContext = localStorage.getItem('monetizacion_context');
    
    return {
      userType: urlParams.get('userType'),
      section: urlParams.get('section'),
      context: storageContext ? JSON.parse(storageContext) : null
    };
  }
  
  static showRelevantFeatures(userType: string) {
    if (userType === 'artista') {
      // Mostrar: Dashboard ingresos, gestión contenido, reportes
      return ['dashboard', 'contenido-exclusivo', 'reportes', 'configuracion'];
    } else if (userType === 'comunidad') {
      // Mostrar: Suscripciones, descubrimiento, perfil
      return ['suscripciones', 'descubrimiento', 'perfil'];
    }
  }
}
```

## 💡 Beneficios

1. **🎯 Contextual**: Cada usuario ve solo lo relevante
2. **🔗 Seamless**: Transición fluida entre microfrontends
3. **📱 Responsive**: Funciona en cualquier dispositivo
4. **⚡ Performance**: No APIs complejas, redirección directa
5. **🛠️ Maintainable**: Cada microfrontend mantiene su responsabilidad

## 🚀 Estado del Proyecto

- ✅ **ArtistaSegundoParcial**: MonetizacionSelector implementado
- ⏳ **ComunidadSegundoParcial**: Pendiente implementación
- ⏳ **MonetizacionSegundoParcial**: Pendiente lectura de contexto

## 🔌 Configuración de Puertos

- **ArtistaSegundoParcial**: `http://localhost:4173` (Vite dev)
- **ComunidadSegundoParcial**: `http://localhost:4174` (Vite dev)
- **MonetizacionSegundoParcial**: `http://localhost:5179` (Angular standalone)

**Importante**: El selector redirecciona al puerto `5179` donde corre monetización en modo standalone.

## 🧪 Testing

```bash
# Terminal 1: Artista
cd ArtistaSegundoParcial
npm run dev
# Disponible en: http://localhost:4173

# Terminal 2: Monetización (modo standalone)
cd monetizacionSegundoParcial
npm run dev
# Disponible en: http://localhost:5179
```

**Flujo de prueba**:
1. Abrir `http://localhost:4173`
2. Click en "💰 Monetización"
3. Seleccionar cualquier opción
4. Redirección automática a `http://localhost:5179` con contexto

---

**Resultado**: Sistema de navegación inteligente que conecta todos los microfrontends con contexto específico del usuario, eliminando la necesidad de APIs complejas y proporcionando una experiencia personalizada.
