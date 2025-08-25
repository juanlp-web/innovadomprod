# Integración del Módulo de Clientes con el Backend

## Descripción

Este documento describe la integración completa del módulo de clientes del frontend con el backend de Innovadomprod. La integración incluye operaciones CRUD completas, búsqueda, filtrado y paginación.

## Componentes Creados

### 1. Hook `useClients` (`src/hooks/useClients.jsx`)

Hook personalizado que maneja todas las operaciones de clientes:

- **Estado**: Lista de clientes, loading, errores, paginación
- **Funciones**:
  - `fetchClients()`: Obtener clientes con paginación y filtros
  - `getClientById(id)`: Obtener cliente específico
  - `createClient(data)`: Crear nuevo cliente
  - `updateClient(id, data)`: Actualizar cliente existente
  - `deleteClient(id)`: Eliminar cliente (soft delete)
  - `searchClients(term, filters)`: Buscar clientes
  - `changePage(page)`: Cambiar página
  - `clearError()`: Limpiar errores

### 2. Modal de Cliente (`src/components/ClientModal.jsx`)

Modal completo para crear y editar clientes con:

- **Campos del formulario**:
  - Información básica (nombre, email, teléfono, tipo)
  - Dirección completa
  - Información financiera (límite de crédito, términos de pago, RNC)
  - Persona de contacto
  - Notas y estado
- **Validación**: Campos requeridos, formatos de email, valores numéricos
- **Modo dual**: Crear nuevo cliente o editar existente

### 3. Modal de Detalle (`src/components/ClientDetailModal.jsx`)

Modal para visualizar información completa del cliente:

- **Vista detallada**:
  - Información principal con badges de estado y tipo
  - Dirección y persona de contacto
  - Información financiera en tarjetas
  - Notas y metadatos del sistema
- **Acciones**: Botón para editar directamente

### 4. Página Principal (`src/pages/ClientesPage.jsx`)

Página completamente integrada con:

- **Funcionalidades**:
  - Lista de clientes con datos reales del backend
  - Búsqueda por nombre/email
  - Filtros por tipo y estado
  - Paginación
  - Estadísticas en tiempo real
  - Operaciones CRUD completas
- **UI Responsiva**: Grid adaptativo, estados de loading, manejo de errores

## Estructura de Datos del Cliente

### Modelo del Backend (`backend/models/Client.js`)

```javascript
{
  name: String,           // Requerido
  email: String,          // Opcional, con validación
  phone: String,          // Opcional
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  type: String,           // 'individual', 'empresa', 'distribuidor'
  taxId: String,          // RNC/ID Fiscal
  creditLimit: Number,    // Límite de crédito
  paymentTerms: Number,   // Términos de pago en días
  isActive: Boolean,      // Estado activo/inactivo
  notes: String,          // Notas adicionales
  contactPerson: {
    name: String,
    phone: String,
    email: String
  },
  timestamps: true        // createdAt, updatedAt
}
```

### API Endpoints

- `GET /api/clients` - Listar clientes con paginación y filtros
- `GET /api/clients/:id` - Obtener cliente por ID
- `POST /api/clients` - Crear nuevo cliente
- `PUT /api/clients/:id` - Actualizar cliente
- `DELETE /api/clients/:id` - Eliminar cliente (soft delete)

## Configuración Requerida

### 1. Variables de Entorno

**Frontend** (`.env`):
```bash
VITE_API_URL=http://localhost:5000/api
```

**Backend** (`.env`):
```bash
MONGODB_URI=mongodb://localhost:27017/innovadomprod
JWT_SECRET=tu_secret_jwt_aqui
PORT=5000
NODE_ENV=development
```

### 2. Dependencias

**Frontend**:
```json
{
  "axios": "^1.6.0"
}
```

**Backend**:
```json
{
  "express": "^4.18.0",
  "mongoose": "^8.0.0",
  "cors": "^2.8.5",
  "dotenv": "^16.3.0"
}
```

## Uso de la Integración

### 1. Inicialización

El hook `useClients` se inicializa automáticamente al montar el componente y carga los clientes del backend.

### 2. Operaciones Básicas

```javascript
const {
  clients,
  loading,
  error,
  createClient,
  updateClient,
  deleteClient
} = useClients();

// Crear cliente
await createClient({
  name: 'Juan Pérez',
  email: 'juan@email.com',
  type: 'individual'
});

// Actualizar cliente
await updateClient(clientId, {
  creditLimit: 5000
});

// Eliminar cliente
await deleteClient(clientId);
```

### 3. Búsqueda y Filtrado

```javascript
// Búsqueda simple
searchClients('juan');

// Búsqueda con filtros
searchClients('juan', {
  type: 'individual',
  isActive: true
});
```

### 4. Paginación

```javascript
// Cambiar página
changePage(2);

// Acceder a información de paginación
console.log(pagination.currentPage, pagination.totalPages);
```

## Características Destacadas

### 1. Manejo de Errores

- Interceptores de axios para manejo automático de tokens
- Redirección automática en caso de token expirado
- Mensajes de error contextuales
- Botón para limpiar errores

### 2. Estados de Loading

- Indicadores visuales durante operaciones
- Botones deshabilitados durante operaciones
- Mensajes de estado claros

### 3. Validación de Formularios

- Validación en tiempo real
- Mensajes de error específicos por campo
- Prevención de envío con datos inválidos

### 4. UI Responsiva

- Grid adaptativo para diferentes tamaños de pantalla
- Modales con scroll para contenido largo
- Diseño consistente con el resto de la aplicación

## Flujo de Trabajo Típico

1. **Carga inicial**: La página se carga y muestra los clientes del backend
2. **Búsqueda**: El usuario puede buscar y filtrar clientes
3. **Crear**: Botón "+ Nuevo Cliente" abre el modal de creación
4. **Ver**: Botón "Ver" abre el modal de detalle
5. **Editar**: Botón "Editar" abre el modal de edición
6. **Eliminar**: Botón "Eliminar" confirma y elimina el cliente
7. **Actualización**: La lista se actualiza automáticamente

## Consideraciones de Seguridad

- **Autenticación**: Todas las operaciones requieren token JWT válido
- **Autorización**: Algunas operaciones requieren rol de manager/admin
- **Validación**: Validación tanto en frontend como backend
- **Sanitización**: Los datos se sanitizan antes de enviar al backend

## Próximas Mejoras

1. **Historial de cambios**: Tracking de modificaciones
2. **Importación masiva**: CSV/Excel para cargar múltiples clientes
3. **Exportación**: Generar reportes en PDF/Excel
4. **Notificaciones**: Alertas para límites de crédito próximos a vencer
5. **Integración con ventas**: Historial de compras del cliente

## Solución de Problemas

### Error de Conexión
- Verificar que el backend esté corriendo en el puerto correcto
- Verificar la variable `VITE_API_URL`
- Revisar logs del backend

### Error de Autenticación
- Verificar que el usuario esté logueado
- Verificar que el token JWT sea válido
- Revisar la configuración de JWT_SECRET

### Error de Base de Datos
- Verificar la conexión a MongoDB
- Verificar que las colecciones existan
- Revisar logs de MongoDB

## Conclusión

La integración del módulo de clientes proporciona una experiencia completa y profesional para la gestión de clientes, con todas las funcionalidades necesarias para un sistema empresarial moderno. La arquitectura es escalable y mantenible, siguiendo las mejores prácticas de React y Node.js.
