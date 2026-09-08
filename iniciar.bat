@echo off
setlocal
title Sirvelo - Proyecto
cd /d "%~dp0"

echo ============================================
echo   SIRVELO - Gestion de Pedidos
echo   Iniciando API y Frontend...
echo ============================================
echo.

start "Sirvelo API" cmd /k "node servidor_sirvelo/index.js"
start "Sirvelo Frontend" cmd /k "node servidor_statico.js"

timeout /t 2 /nobreak >nul
start "" "http://localhost:5500"

echo.
echo Sirvelo ya esta funcionando en su navegador.
echo Cierre las dos ventanas de consola para detener los servidores.
echo.