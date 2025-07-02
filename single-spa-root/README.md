# Plataforma Musical - Root Config (Single SPA)

Esta es la aplicación contenedora que orquesta todos los microfrontends de la Plataforma Musical.

## Estructura del Proyecto

```
single-spa-root/
├── src/
│   └── main.js          # Configuración principal de Single SPA
├── index.html           # HTML principal con navbar
├── package.json         # Dependencias y scripts
├── vite.config.js       # Configuración de Vite
└── README.md           # Este archivo
```

## Microfrontends Registrados

- **@plataforma/home** (puerto 9000): Página de inicio
- **@plataforma/artista** (puerto 5173): Módulo de artistas
- **@plataforma/comunidad** (puerto 5174): Módulo de comunidad original
- **@plataforma/comunidad-segundo-parcial** (puerto 5175): Módulo de comunidad v2
- **@plataforma/monetizacion** (puerto 5176): Módulo de monetización

## Rutas

- `/` - Página de inicio
- `/artista` - Módulo de artistas
- `/comunidad` - Módulo de comunidad
- `/comunidad-v2` - Módulo de comunidad segundo parcial
- `/monetizacion` - Módulo de monetización

## Comandos

### Desarrollo
```bash
npm run dev
```
La aplicación estará disponible en http://localhost:9000

### Construcción
```bash
npm run build
```

### Vista previa
```bash
npm run preview
```

### Servir producción
```bash
npm run serve
```

## Cómo ejecutar todo el ecosistema

1. **Ejecutar la aplicación contenedora:**
   ```bash
   cd single-spa-root
   npm run dev
   ```

2. **Ejecutar cada microfrontend en puertos específicos:**
   
   **Artista (puerto 5173):**
   ```bash
   cd Artista
   npm run dev
   ```
   
   **Comunidad (puerto 5174):**
   ```bash
   cd Comunidad
   npm run dev -- --port 5174
   ```
   
   **ComunidadSegundoParcial (puerto 5175):**
   ```bash
   cd ComunidadSegundoParcial
   npm run dev -- --port 5175
   ```
   
   **Monetización (puerto 5176):**
   ```bash
   cd Monetizacion
   npm run dev -- --port 5176
   ```

3. **Acceder a la aplicación:**
   Abrir http://localhost:9000 en el navegador

## Notas importantes

- Cada microfrontend debe estar configurado para funcionar con Single SPA
- Los puertos especificados deben coincidir en todos los microfrontends
- La navegación se maneja a través de Single SPA para una experiencia fluida
- Los estilos globales están en el HTML principal para mantener consistencia
