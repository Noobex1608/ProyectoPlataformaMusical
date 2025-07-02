#!/bin/bash

# Script para ejecutar todos los microfrontends en paralelo
# Requiere tener npm instalado y todos los proyectos configurados

echo "🎵 Iniciando Plataforma Musical - Todos los microfrontends"

# Función para ejecutar comandos en paralelo
run_parallel() {
    echo "Iniciando $1 en puerto $2..."
    cd "$1" && npm run dev -- --port "$2" &
}

# Ejecutar microfrontends en puertos específicos
run_parallel "Artista" 5173
run_parallel "Comunidad" 5174
run_parallel "ComunidadSegundoParcial" 5175
run_parallel "Monetizacion" 5176

# Ejecutar la aplicación contenedora
echo "Iniciando aplicación contenedora en puerto 9000..."
cd "single-spa-root" && npm run dev &

echo "🚀 Todos los servicios iniciados!"
echo "📱 Aplicación principal: http://localhost:9000"
echo "🎤 Artista: http://localhost:5173"
echo "👥 Comunidad: http://localhost:5174"
echo "👥 Comunidad v2: http://localhost:5175"
echo "💰 Monetización: http://localhost:5176"

# Mantener el script corriendo
wait
