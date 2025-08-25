# 🚀 Inicio Rápido - Innovadomprod

## ⚡ Configuración en 5 minutos

### 1. 📋 Prerrequisitos
- Node.js 18+ instalado
- MongoDB local o Atlas
- Git

### 2. 🚀 Instalación Express

```bash
# Clonar el proyecto (si no lo tienes)
git clone <url-del-repositorio>
cd innovadomprod

# Instalar todas las dependencias
npm run install:all
```

### 3. ⚙️ Configuración Rápida

#### Backend
```bash
cd backend

# Copiar archivo de variables de entorno
cp env.example .env

# Editar .env con tus configuraciones
# MONGODB_URI=mongodb://localhost:27017/innovadomprod
# JWT_SECRET=tu_secret_super_seguro
```

#### Frontend
```bash
# En la raíz del proyecto
cp env.example .env.local

# Editar .env.local
# VITE_API_URL=http://localhost:5000/api
```

### 4. 🗄️ Inicializar Base de Datos

```bash
cd backend

# Inicializar base de datos y crear usuario admin
npm run init-db
```

**Usuario por defecto creado:**
- Email: `admin@innovadomprod.com`
- Contraseña: `admin123`
- ⚠️ **Cambia la contraseña después del primer login**

### 5. 🎯 Ejecutar el Proyecto

#### Opción 1: Ambos simultáneamente
```bash
# En la raíz del proyecto
npm run dev:full
```

#### Opción 2: Por separado
```bash
# Terminal 1 - Backend
npm run backend

# Terminal 2 - Frontend
npm run dev
```

### 6. 🌐 Acceder a la Aplicación

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **Login:** admin@innovadomprod.com / admin123

## 📱 Funcionalidades Disponibles

### ✅ Implementado
- 🔐 Sistema de autenticación JWT
- 👤 Gestión de usuarios y roles
- 📦 CRUD completo de productos
- 👥 Gestión de clientes
- 🏢 Gestión de proveedores
- 📖 Sistema de recetas
- 💰 Gestión de ventas
- 📊 Control de inventario
- 🔒 Middleware de autorización

### 🚧 En Desarrollo
- 📋 Sistema de compras
- 📈 Reportes avanzados
- 🔔 Notificaciones en tiempo real
- 📱 App móvil

## 🛠️ Comandos Útiles

```bash
# Desarrollo
npm run dev              # Solo frontend
npm run backend          # Solo backend
npm run dev:full         # Ambos simultáneamente

# Producción
npm run build            # Build del frontend
npm run backend:start    # Backend en producción

# Base de datos
npm run init-db          # Inicializar BD
```

## 🔧 Solución de Problemas

### Error de conexión a MongoDB
```bash
# Verificar que MongoDB esté corriendo
mongod

# O usar MongoDB Atlas
# Cambiar MONGODB_URI en .env
```

### Puerto ocupado
```bash
# Cambiar puerto en backend/.env
PORT=5001

# Cambiar en frontend/.env.local
VITE_API_URL=http://localhost:5001/api
```

### Dependencias corruptas
```bash
# Limpiar e reinstalar
rm -rf node_modules package-lock.json
npm install
```

## 📚 Próximos Pasos

1. **Personalizar la aplicación**
   - Cambiar colores y branding
   - Agregar campos personalizados
   - Configurar notificaciones

2. **Desplegar en producción**
   - Configurar variables de entorno
   - Usar MongoDB Atlas
   - Deploy en Vercel/Netlify

3. **Extender funcionalidades**
   - Agregar nuevos módulos
   - Integrar con APIs externas
   - Crear reportes personalizados

## 🆘 Soporte

- **Documentación:** README.md
- **API Docs:** backend/API_DOCS.md
- **Issues:** GitHub Issues
- **Email:** soporte@innovadomprod.com

---

**¡Listo! Tu sistema de gestión empresarial está funcionando. 🎉**
