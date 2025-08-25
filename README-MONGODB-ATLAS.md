# 🚀 Innovadomprod - Configuración con MongoDB Atlas

## 📋 Requisitos Previos

- ✅ Node.js 18+ instalado
- ✅ MongoDB Atlas configurado
- ✅ Cuenta de MongoDB Atlas activa

## 🚀 Configuración Rápida

### 1. Configurar MongoDB Atlas

1. **Ejecuta el script de configuración:**
   ```bash
   setup-mongodb-atlas.bat
   ```

2. **O manualmente:**
   ```bash
   cd backend
   copy config.env.example .env
   notepad .env
   ```

3. **Edita el archivo .env con tu información de MongoDB Atlas**

### 2. Instalar dependencias

```bash
# Instalar dependencias del frontend
npm install

# Instalar dependencias del backend
cd backend
npm install
```

### 3. Inicializar la base de datos

```bash
cd backend
npm run init-db
```

### 4. Ejecutar la aplicación

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
npm run dev
```

## 🔧 Configuración Detallada

### Archivo .env del Backend

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
JWT_SECRET=tu_jwt_secret_super_seguro_aqui
JWT_EXPIRE=30d
FRONTEND_URL=http://localhost:5174
```

### Obtener la cadena de conexión de MongoDB Atlas

1. Ve a [MongoDB Atlas](https://cloud.mongodb.com/)
2. Inicia sesión en tu cuenta
3. Selecciona tu cluster
4. Haz clic en "Connect"
5. Elige "Connect your application"
6. Copia la cadena de conexión

## 📊 Estructura de la Base de Datos

### Colecciones principales:
- **users** - Usuarios del sistema
- **products** - Productos del inventario
- **clients** - Clientes
- **suppliers** - Proveedores
- **recipes** - Recetas de productos
- **inventory** - Movimientos de inventario
- **sales** - Ventas
- **purchases** - Compras

### Usuario por defecto:
- **Email:** admin@innovadomprod.com
- **Password:** admin123
- **Rol:** admin

## 🧪 Probar la API

### Verificar conexión:
```bash
curl http://localhost:5000/
```

### Probar login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@innovadomprod.com","password":"admin123"}'
```

### Ver productos:
```bash
curl http://localhost:5000/api/products
```

## 🔍 Solución de Problemas

### Error: "Authentication failed"
- Verifica usuario y contraseña en MongoDB Atlas
- Asegúrate de que el usuario tenga permisos de lectura/escritura

### Error: "Network is unreachable"
- Verifica que tu IP esté en la lista blanca de MongoDB Atlas
- Ve a "Network Access" y agrega tu IP actual

### Error: "Invalid connection string"
- Verifica que la cadena de conexión esté completa
- Asegúrate de que no haya espacios extra

### Frontend no se conecta al backend
- Verifica que el backend esté corriendo en el puerto 5000
- Verifica que FRONTEND_URL en .env sea correcto
- El frontend debe estar en http://localhost:5174

## 📱 URLs de la Aplicación

- **Frontend:** http://localhost:5174
- **Backend API:** http://localhost:5000
- **MongoDB Atlas:** https://cloud.mongodb.com/

## 🛠️ Comandos Útiles

```bash
# Ejecutar solo el backend
cd backend && npm run dev

# Ejecutar solo el frontend
npm run dev

# Ejecutar ambos (desde la raíz)
npm run dev:full

# Reinicializar base de datos
cd backend && npm run init-db

# Ver logs del backend
cd backend && npm run dev

# Ver logs del frontend
npm run dev
```

## 🔐 Seguridad

- **JWT_SECRET:** Cambia por un valor seguro en producción
- **MONGODB_URI:** No compartas tu cadena de conexión
- **Permisos:** Configura usuarios con permisos mínimos necesarios

## 📈 Próximos Pasos

1. ✅ Configurar MongoDB Atlas
2. ✅ Conectar frontend con backend
3. 🔄 Implementar funcionalidades CRUD completas
4. 🔄 Agregar validaciones y manejo de errores
5. 🔄 Implementar sistema de roles y permisos
6. 🔄 Agregar reportes y estadísticas
7. 🔄 Implementar backup y recuperación de datos

## 🆘 Soporte

Si tienes problemas:
1. Verifica los logs del backend
2. Verifica la consola del navegador
3. Verifica la conexión a MongoDB Atlas
4. Revisa el archivo .env
5. Ejecuta `npm run init-db` para reinicializar

---

**¡Tu aplicación está lista para usar MongoDB Atlas! 🎉**
