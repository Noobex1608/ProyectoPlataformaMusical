@echo off
REM Script para Windows para ejecutar todos los microfrontends

echo 🎵 Iniciando Plataforma Musical - Todos los microfrontends

REM Iniciar microfrontends en puertos específicos
echo Iniciando Artista en puerto 5173...
start "Artista" cmd /c "cd Artista && npm run dev"

timeout /t 3 /nobreak

echo Iniciando Comunidad en puerto 5174...
start "Comunidad" cmd /c "cd Comunidad && npm run dev -- --port 5174"

timeout /t 3 /nobreak

echo Iniciando ComunidadSegundoParcial en puerto 5175...
start "ComunidadSegundoParcial" cmd /c "cd ComunidadSegundoParcial && npm run dev -- --port 5175"

timeout /t 3 /nobreak

echo Iniciando Monetizacion en puerto 5176...
start "Monetizacion" cmd /c "cd Monetizacion && npm run dev -- --port 5176"

timeout /t 3 /nobreak

echo Iniciando aplicacion contenedora en puerto 9000...
start "Root Config" cmd /c "cd single-spa-root && npm run dev"

echo 🚀 Todos los servicios iniciados!
echo 📱 Aplicacion principal: http://localhost:9000
echo 🎤 Artista: http://localhost:5173
echo 👥 Comunidad: http://localhost:5174
echo 👥 Comunidad v2: http://localhost:5175
echo 💰 Monetizacion: http://localhost:5176

pause
