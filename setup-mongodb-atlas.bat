@echo off
echo ========================================
echo    Configuración de MongoDB Atlas
echo ========================================
echo.

echo Paso 1: Creando archivo .env...
if not exist "backend\.env" (
    copy "backend\config.env.example" "backend\.env"
    echo ✅ Archivo .env creado
) else (
    echo ⚠️  El archivo .env ya existe
)

echo.
echo Paso 2: Configuración necesaria...
echo.
echo 🔧 Necesitas editar el archivo backend\.env con tu información de MongoDB Atlas:
echo.
echo 1. Ve a: https://cloud.mongodb.com/
echo 2. Inicia sesión en tu cuenta
echo 3. Haz clic en "Connect" en tu cluster
echo 4. Selecciona "Connect your application"
echo 5. Copia la cadena de conexión
echo 6. Edita el archivo backend\.env y reemplaza MONGODB_URI
echo.
echo 📝 Formato esperado:
echo MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
echo.

echo Paso 3: Abriendo el archivo .env para edición...
notepad "backend\.env"

echo.
echo Paso 4: Una vez configurado, ejecuta:
echo cd backend
echo npm run dev
echo.
echo Paso 5: Para inicializar la base de datos:
echo npm run init-db
echo.

echo ========================================
echo    Configuración completada
echo ========================================
pause
