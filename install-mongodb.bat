@echo off
echo ========================================
echo    Instalador de MongoDB para Windows
echo ========================================
echo.

echo Paso 1: Descargando MongoDB Community Server...
echo Por favor, ve a: https://www.mongodb.com/try/download/community
echo Selecciona: Windows x64
echo Descarga el archivo .msi
echo.
pause

echo Paso 2: Instalando MongoDB...
echo - Ejecuta el archivo .msi descargado
echo - Selecciona "Complete" installation
echo - Marca "Install MongoDB as a Service"
echo - Completa la instalación
echo.
pause

echo Paso 3: Verificando instalación...
echo Verificando si MongoDB está corriendo en el puerto 27017...
netstat -ano | findstr :27017

if %errorlevel% equ 0 (
    echo.
    echo ✅ MongoDB está funcionando correctamente!
    echo.
    echo Paso 4: Inicializando la base de datos...
    echo Ejecutando: cd backend && npm run init-db
    cd backend
    npm run init-db
    echo.
    echo Paso 5: Reiniciando el backend...
    echo Ejecutando: npm run dev
    npm run dev
) else (
    echo.
    echo ❌ MongoDB no está funcionando.
    echo Por favor, verifica la instalación.
    echo.
    echo Comandos útiles:
    echo - Verificar servicios: services.msc
    echo - Buscar "MongoDB" en la lista de servicios
    echo - Asegúrate de que esté en estado "Running"
)

echo.
echo ========================================
echo    Instalación completada
echo ========================================
pause
