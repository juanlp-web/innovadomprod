# 🏢 Integración de Proveedores - Backend + Frontend

## 📋 **Resumen de la Integración**

Se ha completado la integración completa de la página de Proveedores con el backend, incluyendo:

- ✅ **Modelo de datos** completo en MongoDB
- ✅ **APIs RESTful** con autenticación y autorización
- ✅ **Frontend reactivo** con estado real-time
- ✅ **Búsqueda y filtros** avanzados
- ✅ **Paginación** y estadísticas
- ✅ **Manejo de errores** robusto

## 🗄️ **Backend - Modelo de Datos**

### **Estructura del Proveedor:**
```javascript
{
  name: String,                    // Nombre del proveedor
  category: String,                // Ingredientes, Embalajes, Equipos, Servicios, Otros
  contact: {
    name: String,                  // Nombre del contacto
    phone: String,                 // Teléfono
    email: String,                 // Email
    position: String               // Cargo
  },
  address: {
    street: String,                // Calle
    city: String,                  // Ciudad
    state: String,                 // Estado/Provincia
    country: String,               // País
    zipCode: String                // Código postal
  },
  status: String,                  // Activo, Inactivo, Pendiente, Bloqueado
  rating: Number,                  // Calificación 0-5
  paymentTerms: String,            // Términos de pago
  creditLimit: Number,             // Límite de crédito
  taxId: String,                   // ID fiscal
  notes: String,                   // Notas adicionales
  totalOrders: Number,             // Total de pedidos
  totalSpent: Number,              // Total gastado
  documents: Array,                // Documentos adjuntos
  tags: Array,                     // Etiquetas
  isActive: Boolean,               // Estado activo/inactivo
  timestamps: true                 // createdAt, updatedAt
}
```

## 🔌 **APIs Disponibles**

### **1. Obtener Proveedores**
```http
GET /api/suppliers
GET /api/suppliers?page=1&limit=10&search=beauty&category=Ingredientes&status=Activo
```

**Parámetros:**
- `page`: Número de página (default: 1)
- `limit`: Items por página (default: 10)
- `search`: Búsqueda por nombre, contacto o email
- `category`: Filtro por categoría
- `status`: Filtro por estado
- `sortBy`: Campo para ordenar (default: name)
- `sortOrder`: Orden asc/desc (default: asc)

### **2. Obtener Proveedor por ID**
```http
GET /api/suppliers/:id
```

### **3. Crear Proveedor**
```http
POST /api/suppliers
Authorization: Bearer <token>
```

**Permisos:** Admin, Manager

### **4. Actualizar Proveedor**
```http
PUT /api/suppliers/:id
Authorization: Bearer <token>
```

**Permisos:** Admin, Manager

### **5. Eliminar Proveedor (Soft Delete)**
```http
DELETE /api/suppliers/:id
Authorization: Bearer <token>
```

**Permisos:** Solo Admin

### **6. Cambiar Estado**
```http
PATCH /api/suppliers/:id/status
Authorization: Bearer <token>
Body: { "status": "Activo" }
```

**Permisos:** Admin, Manager

### **7. Estadísticas**
```http
GET /api/suppliers/stats/overview
```

### **8. Búsqueda por Categoría**
```http
GET /api/suppliers/category/:category
```

### **9. Búsqueda por Estado**
```http
GET /api/suppliers/status/:status
```

## 🎯 **Frontend - Hook useSuppliers**

### **Estado Disponible:**
```javascript
const {
  // Estado
  suppliers,           // Lista de proveedores
  loading,            // Estado de carga
  error,              // Mensajes de error
  stats,              // Estadísticas
  pagination,         // Información de paginación
  filters,            // Filtros activos
  
  // Acciones
  fetchSuppliers,     // Cargar proveedores
  createSupplier,     // Crear proveedor
  updateSupplier,     // Actualizar proveedor
  deleteSupplier,     // Eliminar proveedor
  changeSupplierStatus, // Cambiar estado
  searchSuppliers,    // Buscar proveedores
  updateFilters,      // Actualizar filtros
  changePage,         // Cambiar página
  changeLimit,        // Cambiar límite por página
  sortBy,             // Ordenar
  
  // Utilidades
  clearError,         // Limpiar errores
  refresh             // Recargar datos
} = useSuppliers();
```

## 🚀 **Cómo Usar la Integración**

### **1. Configurar MongoDB Atlas:**
```bash
# Crear archivo .env en backend/
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>
JWT_SECRET=tu_secreto_jwt
PORT=5000
FRONTEND_URL=http://localhost:5173
```

### **2. Inicializar Base de Datos:**
```bash
cd backend
npm run init-db          # Crear usuario admin
npm run init-suppliers   # Crear proveedores de ejemplo
```

### **3. Ejecutar Backend:**
```bash
cd backend
npm run dev              # Con MongoDB
# o
npm run dev-simple       # Sin MongoDB (modo desarrollo)
```

### **4. Ejecutar Frontend:**
```bash
npm run dev
```

## 📊 **Características de la Página**

### **Funcionalidades:**
- ✅ **Búsqueda en tiempo real** por nombre, contacto o email
- ✅ **Filtros avanzados** por categoría y estado
- ✅ **Paginación** con navegación intuitiva
- ✅ **Estadísticas en tiempo real** del dashboard
- ✅ **Estado de carga** y manejo de errores
- ✅ **Diseño responsivo** para todos los dispositivos
- ✅ **Iconos y emojis** para mejor UX
- ✅ **Transiciones suaves** y animaciones

### **Componentes:**
- **Header:** Título y botón de nuevo proveedor
- **Filtros:** Búsqueda, categoría, estado (expandibles)
- **Lista:** Grid de tarjetas de proveedores
- **Paginación:** Navegación entre páginas
- **Estadísticas:** Cards con métricas en tiempo real

## 🔧 **Personalización y Extensión**

### **Agregar Nuevos Campos:**
1. Actualizar el modelo en `backend/models/Supplier.js`
2. Modificar las APIs en `backend/routes/suppliers.js`
3. Actualizar el hook `useSuppliers` en el frontend
4. Modificar la UI en `ProveedoresPage.jsx`

### **Agregar Nuevas Funcionalidades:**
- **Importar/Exportar:** CSV, Excel
- **Notificaciones:** Email, SMS
- **Reportes:** PDF, gráficos
- **Auditoría:** Historial de cambios
- **Documentos:** Subida de archivos

## 🧪 **Pruebas de la Integración**

### **1. Verificar Backend:**
```bash
curl http://localhost:5000/api/suppliers
```

### **2. Verificar Frontend:**
- Navegar a `/proveedores`
- Verificar que se carguen los datos
- Probar búsqueda y filtros
- Verificar paginación

### **3. Verificar Autenticación:**
- Hacer login con admin@innovadomprod.com / admin123
- Verificar que las APIs requieran token
- Probar permisos de usuario

## 📝 **Próximos Pasos**

### **Funcionalidades Pendientes:**
- [ ] **Modal de Crear/Editar** proveedor
- [ ] **Vista detallada** del proveedor
- [ ] **Historial de pedidos** por proveedor
- [ ] **Evaluaciones y ratings** del sistema
- [ ] **Notificaciones** automáticas
- [ ] **Reportes** y análisis

### **Integraciones Futuras:**
- [ ] **Sistema de Compras** vinculado a proveedores
- [ ] **Gestión de Inventario** por proveedor
- [ ] **Sistema de Pagos** y facturación
- [ ] **API externa** para validación de datos
- [ ] **Integración con ERP** existente

## 🎉 **¡Integración Completada!**

La página de Proveedores está ahora completamente integrada con el backend, proporcionando:

- **Datos reales** desde MongoDB Atlas
- **APIs robustas** con autenticación JWT
- **Frontend reactivo** con estado en tiempo real
- **UX mejorada** con filtros y búsqueda avanzada
- **Arquitectura escalable** para futuras funcionalidades

¡La integración está lista para usar en producción! 🚀
