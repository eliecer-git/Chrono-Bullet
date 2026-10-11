@echo off
title CHRONO BULLET - Servidor Movil
echo Iniciando servidor web para celular...
powershell -ExecutionPolicy Bypass -File "%~dp0serve.ps1"
pause
