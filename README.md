# 🎵 Plataforma Musical - Microfrontends Architecture

Una plataforma integral para artistas independientes desarrollada con arquitectura de microfrontends usando Single-SPA, que permite la gestión de comunidades, monetización y perfiles de artistas de forma modular y escalable.

## 📋 Tabla de Contenidos

- [🏗️ Arquitectura](#-arquitectura)
- [🚀 Características](#-características)
- [📦 Módulos](#-módulos)
- [🛠️ Tecnologías](#-tecnologías)
- [⚡ Instalación y Configuración](#-instalación-y-configuración)
- [🔧 Scripts Disponibles](#-scripts-disponibles)
- [🧪 Testing](#-testing)
- [🔄 Desarrollo](#-desarrollo)
- [🚀 Despliegue](#-despliegue)
- [📊 Estado del Proyecto](#-estado-del-proyecto)
- [🤝 Contribuir](#-contribuir)

## 🏗️ Arquitectura

El proyecto está construido usando **Single-SPA** como orquestador de microfrontends, permitiendo que diferentes módulos funcionen de forma independiente mientras comparten un estado global común.

```
ProyectoPlataformaMusical/
├── single-spa-root/          # 🏛️ Aplicación raíz (Orquestador)
├── Artista/                  # 👤 Módulo de Perfiles de Artistas (React/Vite)
├── ArtistaSegundoParcial/    # 👤 Versión mejorada Artistas (React/Vite)
├── Comunidad/                # 👥 Módulo de Comunidades (Vue 3)
├── ComunidadSegundoParcial/  # 👥 Versión mejorada Comunidades (Vue 3)
├── Monetizacion/             # 💰 Módulo de Monetización (Next.js)
└── monetizacionSegundoParcial/ # 💰 Versión mejorada Monetización (Angular)
```

### Estado Global Centralizado

Todos los módulos comparten un **StateManager** centralizado que gestiona:
- 🔐 **Autenticación** (usuarios, tokens, sesiones)
- 🎨 **UI** (tema, idioma, notificaciones)
- 🧭 **Navegación** (rutas, breadcrumbs, historial)
- 💼 **Business Logic** (artistas, clubs, contenido)
- ⚙️ **Sistema** (estado online, sincronización, errores)

## 🚀 Características

### ✨ Funcionalidades Principales

- **🎭 Gestión de Artistas**: Perfiles completos, biografías, discografías
- **👥 Comunidades**: Clubs de fans, eventos, interacciones sociales  
- **💰 Monetización**: Suscripciones, contenido premium, pagos
- **🔄 Sincronización**: Estado compartido entre todos los módulos
- **🌍 Multiidioma**: Soporte para español e inglés
- **🌙 Temas**: Modo claro, oscuro y automático
- **📱 Responsive**: Diseño adaptativo para todos los dispositivos
- **🔔 Notificaciones**: Sistema de notificaciones en tiempo real

### 🔧 Características Técnicas

- **Microfrontends**: Arquitectura modular y escalable
- **Hot Reload**: Desarrollo ágil con recarga en caliente
- **TypeScript**: Tipado estático en todos los módulos
- **Testing**: Cobertura de pruebas unitarias e integración
- **State Management**: Estado global sincronizado
- **Module Federation**: Carga dinámica de módulos

## 📦 Módulos

### 🏛️ Single-SPA Root (Orquestador)
- **Puerto**: 9000
- **Tecnología**: Vanilla JS + Vite
- **Responsabilidad**: Coordinación de microfrontends y estado global

### 👤 Artista (React)
```bash
# Desarrollo
npm run dev:spa         
npm run build        
npm run preview      
```

### 👥 Comunidad (Vue 3)
```bash
# Desarrollo  
npm run dev:spa         
npm run build        
npm run serve        
```

### 💰 Monetización (Next.js/Angular)
```bash

# Angular  
npm run start:spa    
npm run build:spa    
```

## 🛠️ Tecnologías

| Módulo | Framework | Tecnologías Adicionales |
|--------|-----------|------------------------|
| **Root** | Vanilla JS | Single-SPA, Vite, Jest |
| **Artista** | React 18 | TypeScript, Vite, Supabase |
| **Comunidad** | Vue 3 | TypeScript, Vite, Pinia, Tailwind |
| **Monetización** | Next.js 15 / Angular 20 | TypeScript, Tailwind, RxJS |

### 🔧 Herramientas de Desarrollo
- **Bundlers**: Vite, Next.js, Angular CLI
- **Testing**: Jest, Vue Test Utils, Angular Testing Library
- **Type Checking**: TypeScript 5.8+
- **Linting**: ESLint, Prettier
- **CSS**: Tailwind CSS, CSS Modules

## ⚡ Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- npm o pnpm
- Git

### 🚀 Inicio Rápido

1. **Clonar el repositorio**
```bash
git clone https://github.com/Noobex1608/ProyectoPlataformaMusical.git
cd ProyectoPlataformaMusical
```

2. **Instalar dependencias en todos los módulos**
```bash
# Root
cd single-spa-root; npm install

# Artista
cd ../ArtistaSegundoParcial; npm install

# Comunidad  
cd ../ComunidadSegundoParcial; npm install

# Monetización
cd ../monetizacionSegundoParcial; npm install
```

3. **Configurar variables de entorno**
```bash
# Crear .env en cada módulo según sea necesario
cp .env.example .env
```

4. **Iniciar en modo desarrollo**
```bash
# Terminal 1 - Root 
cd single-spa-root; npm run dev

# Terminal 2 - Artista   
cd ArtistaSegundoParcial; npm run dev:spa

# Terminal 3 - Comunidad
cd ComunidadSegundoParcial; npm run dev:spa

# Terminal 4 - Monetización 
cd monetizacionSegundoParcial; npm run start:spa
```

5. **Abrir la aplicación**
```
http://localhost:9000
```

## 🔧 Scripts Disponibles

### 🏛️ Scripts Globales (Root)
```bash
npm run dev          # Desarrollo
npm run build        # Construcción
npm run test         # Pruebas unitarias
npm run test:coverage # Cobertura de pruebas
```

### 📦 Scripts por Módulo
Cada módulo tiene sus propios scripts específicos. Consultar el `package.json` de cada uno para detalles.

## 🧪 Testing

### Estado Actual de Pruebas

| Módulo | Framework de Testing | Estado | Cobertura |
|--------|---------------------|--------|-----------|
| **Comunidad (Vue)** | Jest + Vue Test Utils | ✅ 7/7 Pasando | Integración de estado |
| **Monetización (Angular)** | Jest + Angular Testing | ✅ 12/12 Pasando | Servicios y DI |
| **Artista (React)** | Jest + Testing Library | 🔄 En desarrollo | - |
| **Root** | Jest | 🔄 En desarrollo | - |

### Ejecutar Pruebas

```bash
# Todas las pruebas
npm run test

# Con cobertura
npm run test:coverage

# Modo watch
npm run test:watch

# Por módulo específico
cd ComunidadSegundoParcial && npm test
cd monetizacionSegundoParcial && npm test
```

## 🔄 Desarrollo

### 🏗️ Flujo de Desarrollo

1. **Desarrollo local**: Cada módulo se desarrolla independientemente
2. **Estado compartido**: Cambios se sincronizan automáticamente
3. **Hot reload**: Cambios se reflejan inmediatamente
4. **Testing**: Pruebas automáticas en cada cambio

### 🔧 Estructura del Estado Global

```typescript
interface GlobalState {
  auth: {
    user: User | null;
    isAuthenticated: boolean;
    token: string | null;
  };
  ui: {
    theme: 'light' | 'dark' | 'auto';
    language: 'es' | 'en';
    notifications: Notification[];
  };
  business: {
    selectedArtist: Artist | null;
    selectedClub: Club | null;
    monetizationContext: MonetizationContext | null;
  };
  navigation: {
    currentRoute: string;
    activeModule: string;
  };
  system: {
    onlineStatus: boolean;
    lastSyncTime: number | null;
  };
}
```

### 🔌 APIs de Integración

Cada módulo expone APIs específicas:

```javascript
// Artista API
window.artistaAPI = {
  navigateToProfile: (artistId) => {},
  updateProfile: (data) => {},
  // ...
};

// Comunidad API  
window.comunidadAPI = {
  joinClub: (clubId) => {},
  createEvent: (event) => {},
  // ...
};

// Monetización API
window.monetizacionAPI = {
  processPayment: (amount) => {},
  createSubscription: (plan) => {},
  // ...
};
```

## 🚀 Despliegue

### 🏗️ Construcción de Producción

```bash



cd single-spa-root; npm run build
cd ArtistaSegundoParcial; npm run build  
cd ComunidadSegundoParcial; npm run build
cd monetizacionSegundoParcial; npm run build:spa
```

### 🌐 Configuración de Servidor

```nginx
# Configuración Nginx ejemplo
server {
    listen 80;
    server_name plataforma-musical.com;

    location / {
        try_files $uri $uri/ /index.html;
        root /var/www/plataforma-musical;
    }

    location /artista {
        try_files $uri $uri/ @artista;
    }

    location /comunidad {
        try_files $uri $uri/ @comunidad;
    }

    location /monetizacion {
        try_files $uri $uri/ @monetizacion;
    }
}
```

## 📊 Estado del Proyecto

### ✅ Completado
- [x] Arquitectura Single-SPA configurada
- [x] Estado global implementado  
- [x] Módulo Comunidad (Vue 3) funcional
- [x] Módulo Monetización (Angular) funcional
- [x] Sistema de testing implementado
- [x] Integración entre módulos



## 🤝 Contribuir

### 📋 Guías de Contribución

1. **Fork** el repositorio
2. **Crear** una rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. **Commit** los cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. **Push** a la rama (`git push origin feature/nueva-funcionalidad`)
5. **Crear** un Pull Request

### 🎨 Estándares de Código

- **TypeScript**: Tipado estático obligatorio
- **ESLint**: Seguir las reglas configuradas
- **Prettier**: Formateo automático
- **Conventional Commits**: Formato de commits estandarizado

### 🧪 Requisitos para PR

- [ ] Pruebas unitarias pasando
- [ ] Cobertura de código mantenida
- [ ] Documentación actualizada
- [ ] Sin errores de TypeScript/ESLint

---

## 📞 Contacto y Soporte

- **Autores**: Steven Magallanes Loor , Wendy Moreira, Nibia Rodriguez
- **Repositorio**: [GitHub](https://github.com/Noobex1608/ProyectoPlataformaMusical)
- **Issues**: [Reportar problemas](https://github.com/Noobex1608/ProyectoPlataformaMusical/issues)

---

<div align="center">

### 

**Desarrollado con ❤️ usando microfrontends**

</div>