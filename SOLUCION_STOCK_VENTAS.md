# Solución al Problema de Stock en Ventas

## Problema Identificado

Cuando se realizan ventas, el stock puede llegar a 0 o valores negativos debido a:

1. **Validación insuficiente** en el frontend antes de crear ventas
2. **Falta de indicadores visuales** para productos sin stock
3. **No hay alertas** para productos con stock bajo
4. **Validación de stock** solo en el backend, no en tiempo real en el frontend

## Soluciones Implementadas

### 1. Validación de Stock en Frontend

#### Antes de Agregar Productos
```javascript
const handleProductSelect = (productId) => {
  const product = products.find(p => p._id === productId)
  if (!product) return

  // Validar stock antes de agregar
  if (product.stock <= 0) {
    alert(`No hay stock disponible para ${product.name}. Stock actual: ${product.stock}`)
    return
  }
  // ... resto de la lógica
}
```

#### Al Cambiar Cantidades
```javascript
const handleProductQuantityChange = (productId, newQuantity) => {
  // Validar que no exceda el stock disponible
  const product = products.find(p => p._id === productId)
  if (product && newQuantity > product.stock) {
    alert(`No hay suficiente stock para ${product.name}. Stock disponible: ${product.stock}, Cantidad solicitada: ${newQuantity}`)
    return
  }
  // ... resto de la lógica
}
```

#### Antes de Enviar al Backend
```javascript
const handleSubmit = async (e) => {
  // ... validaciones básicas

  // Validar stock antes de enviar al backend
  for (const item of selectedProducts) {
    const product = products.find(p => p._id === item.product)
    if (product && item.quantity > product.stock) {
      alert(`Stock insuficiente para ${product.name}. Stock disponible: ${product.stock}, Cantidad solicitada: ${item.quantity}`)
      return
    }
  }
  // ... resto de la lógica
}
```

### 2. Indicadores Visuales de Stock

#### En el Selector de Productos
- Productos sin stock aparecen deshabilitados
- Se muestra claramente el stock disponible
- Texto explicativo: "Solo se muestran productos con stock disponible"

```javascript
<option 
  key={product._id} 
  value={product._id}
  disabled={product.stock <= 0}
  className={product.stock <= 0 ? 'text-gray-400' : ''}
>
  {product.name} - Stock: {product.stock} - Precio: {formatCurrency(product.price)}
  {product.stock <= 0 ? ' (Sin stock)' : ''}
</option>
```

#### En Productos Seleccionados
- Muestra stock disponible en tiempo real
- Indica stock restante después de la venta
- Advertencia visual si cantidad excede stock
- Validación en el campo de cantidad (max attribute)

```javascript
<div className="text-xs text-gray-600 mt-1">
  Stock disponible: <span className={stockDisponible > 0 ? 'text-green-600' : 'text-red-600'}>{stockDisponible}</span>
  {stockRestante >= 0 ? (
    <span className="text-blue-600 ml-2">• Restante después de la venta: {stockRestante}</span>
  ) : (
    <span className="text-red-600 ml-2">• ⚠️ Stock insuficiente</span>
  )}
</div>
```

#### En la Tabla de Ventas
- Badges para productos con stock bajo
- Indicadores para productos sin stock
- Información visual clara del estado del stock

```javascript
{stockBajo && (
  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
    Stock bajo: {stockDisponible}
  </span>
)}
{stockDisponible === 0 && (
  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
    Sin stock
  </span>
)}
```

### 3. Alertas de Stock

#### Productos Sin Stock
- Alerta roja para productos con stock 0
- Lista de todos los productos afectados
- Visibilidad inmediata del problema

#### Productos con Stock Bajo
- Alerta amarilla para productos con stock bajo
- Considera el stock mínimo configurado
- Ayuda a identificar productos que necesitan reabastecimiento

### 4. Validaciones en el Backend

El backend ya tiene validaciones implementadas:

```javascript
// En backend/routes/sales.js
if (product.stock < item.quantity) {
  return res.status(400).json({ 
    message: `Stock insuficiente para ${product.name}. Disponible: ${product.stock}` 
  });
}

// Actualizar stock después de la venta
await Product.findByIdAndUpdate(item.product, {
  $inc: { stock: -item.quantity }
});
```

## Flujo de Validación Completo

### 1. **Frontend - Selección de Productos**
- ✅ Verificar stock > 0 antes de agregar
- ✅ Validar cantidad no exceda stock disponible
- ✅ Mostrar productos sin stock como deshabilitados

### 2. **Frontend - Gestión de Cantidades**
- ✅ Validar cambios de cantidad contra stock disponible
- ✅ Mostrar advertencias visuales si se excede stock
- ✅ Calcular stock restante en tiempo real

### 3. **Frontend - Envío de Venta**
- ✅ Validación final de stock antes de enviar al backend
- ✅ Prevenir envío si hay problemas de stock

### 4. **Backend - Validación Final**
- ✅ Verificar stock disponible en la base de datos
- ✅ Rechazar venta si stock insuficiente
- ✅ Actualizar stock solo si la venta es exitosa

## Beneficios de la Solución

1. **Prevención de Errores**: No se pueden crear ventas con stock insuficiente
2. **Visibilidad Clara**: Indicadores visuales del estado del stock
3. **Validación en Tiempo Real**: Feedback inmediato al usuario
4. **Consistencia de Datos**: Stock siempre refleja la realidad
5. **Mejor UX**: Usuario entiende claramente las limitaciones

## Configuración de Stock Mínimo

El sistema considera un stock mínimo por defecto de 5 unidades:

```javascript
const stockBajo = stockDisponible <= (product?.minStock || 5)
```

Para personalizar esto, se puede:
1. Configurar `minStock` en el modelo de Product
2. Ajustar el valor por defecto en el código
3. Hacer configurable desde la interfaz de administración

## Próximos Pasos Recomendados

1. **Implementar notificaciones automáticas** cuando el stock llegue a niveles críticos
2. **Agregar reportes de stock** para análisis de tendencias
3. **Implementar sistema de reabastecimiento automático** basado en stock mínimo
4. **Agregar historial de movimientos de stock** para auditoría
5. **Implementar alertas por email/SMS** para stock crítico

## Notas Técnicas

- Las validaciones se ejecutan tanto en el frontend como en el backend
- El stock se actualiza de forma atómica en el backend
- Se mantiene consistencia entre el estado local y la base de datos
- Las alertas se muestran dinámicamente basadas en el estado actual de los productos
