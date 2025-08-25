# Integración del Backend con VentasPage

## Descripción General

Se ha implementado la integración completa del backend con la página de ventas (`VentasPage`), permitiendo operaciones CRUD reales con la base de datos MongoDB a través de la API REST.

## Componentes Implementados

### 1. Hook `useSales` (`src/hooks/useSales.jsx`)

Hook personalizado que maneja todas las operaciones relacionadas con ventas:

- **Estado local**: `sales`, `loading`, `error`, `stats`
- **Funciones principales**:
  - `fetchSales()`: Obtener todas las ventas
  - `fetchSaleById(id)`: Obtener venta específica
  - `createSale(saleData)`: Crear nueva venta
  - `updatePaymentStatus(id, status)`: Actualizar estado de pago
  - `deleteSale(id)`: Eliminar venta
  - `fetchStats(params)`: Obtener estadísticas
  - `clearError()`: Limpiar errores

### 2. VentasPage Actualizada (`src/pages/VentasPage.jsx`)

Página completamente integrada con el backend que incluye:

#### Funcionalidades Principales:
- **Gestión de ventas en tiempo real** con datos del backend
- **Selección de clientes** desde la base de datos
- **Selección de productos** con información de stock y precios
- **Cálculo automático de totales** (subtotal, IVA, total)
- **Gestión de estados de pago** (pendiente, pagado, parcial, cancelado)
- **Validaciones** antes de crear ventas

#### Estructura de Datos:
```javascript
// Formato de venta según el modelo del backend
{
  client: "ObjectId",           // Referencia al cliente
  items: [{                     // Array de productos
    product: "ObjectId",        // Referencia al producto
    quantity: 2,                // Cantidad
    unitPrice: 25.99,          // Precio unitario
    discount: 0,                // Descuento aplicado
    total: 51.98               // Total del item
  }],
  subtotal: 51.98,             // Subtotal calculado
  tax: 8.32,                   // IVA (16%)
  total: 60.30,                // Total final
  paymentMethod: "efectivo",   // Método de pago
  paymentStatus: "pendiente",  // Estado del pago
  notes: "Notas adicionales",  // Observaciones
  dueDate: "2024-02-15"       // Fecha de vencimiento
}
```

## Endpoints del Backend Utilizados

### Rutas de Ventas (`/api/sales`)

1. **GET `/api/sales`** - Obtener todas las ventas
2. **GET `/api/sales/:id`** - Obtener venta por ID
3. **POST `/api/sales`** - Crear nueva venta
4. **PUT `/api/sales/:id/payment-status`** - Actualizar estado de pago
5. **GET `/api/sales/stats/summary`** - Obtener estadísticas

### Rutas de Clientes (`/api/clients`)
- **GET `/api/clients`** - Obtener lista de clientes para selección

### Rutas de Productos (`/api/products`)
- **GET `/api/products`** - Obtener lista de productos para selección

## Flujo de Trabajo

### 1. Creación de Venta
1. Usuario selecciona cliente del dropdown
2. Usuario agrega productos uno por uno
3. Sistema calcula automáticamente totales
4. Usuario selecciona método de pago
5. Sistema valida datos y envía al backend
6. Backend valida stock y crea la venta
7. Stock se actualiza automáticamente

### 2. Gestión de Estados
- **Pendiente**: Venta creada, pago no realizado
- **Pagado**: Pago completo recibido
- **Parcial**: Pago parcial recibido
- **Cancelado**: Venta cancelada

### 3. Validaciones Implementadas
- Cliente obligatorio
- Al menos un producto
- Stock disponible
- Método de pago requerido
- Cálculo automático de totales

## Características Técnicas

### Manejo de Errores
- Interceptores de Axios para errores de autenticación
- Manejo de errores específicos del backend
- UI para mostrar y limpiar errores

### Estado de Carga
- Indicadores de carga durante operaciones
- Estados de carga separados para ventas, clientes y productos

### Persistencia de Datos
- Datos se mantienen sincronizados con el backend
- Actualizaciones en tiempo real del estado local
- Manejo de referencias entre entidades (cliente, productos)

## Archivos Modificados/Creados

1. **`src/hooks/useSales.jsx`** - Nuevo hook para ventas
2. **`src/pages/VentasPage.jsx`** - Página completamente refactorizada
3. **`src/config/api.js`** - Ya incluía configuración para ventas

## Dependencias Utilizadas

- **React Hooks**: `useState`, `useEffect`, `useCallback`
- **Axios**: Para comunicación con la API
- **Lucide React**: Iconos de la interfaz
- **Tailwind CSS**: Estilos y componentes

## Configuración Requerida

### Variables de Entorno
```bash
VITE_API_URL=http://localhost:5000/api
```

### Backend
- MongoDB corriendo
- Servidor Express funcionando en puerto 5000
- Middleware de autenticación configurado
- Modelos de datos (Sale, Client, Product) configurados

## Próximos Pasos Recomendados

1. **Implementar edición completa de ventas** (actualmente solo estado de pago)
2. **Agregar paginación** para grandes volúmenes de ventas
3. **Implementar filtros avanzados** por fechas, rangos de precios
4. **Agregar reportes y estadísticas** visuales
5. **Implementar notificaciones** para cambios de estado
6. **Agregar validación de stock en tiempo real**

## Notas de Implementación

- La funcionalidad de edición está parcialmente implementada
- El backend actual no tiene endpoint de eliminación de ventas
- Los cálculos de IVA están hardcodeados al 16%
- La validación de stock se realiza en el backend
- Los números de factura se generan automáticamente en el backend
