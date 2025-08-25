# Solución para Actualización de Stock en Compras

## Problema Identificado

Al crear una compra, el stock de los productos no se estaba sumando automáticamente, lo que causaba inconsistencias en el inventario.

## Solución Implementada

Se han implementado **3 mecanismos** para asegurar que el stock se actualice correctamente cuando se reciben compras:

### 1. **Actualización Automática al Cambiar Estado**

Cuando se cambia el estado de una compra a "recibida", el stock se actualiza automáticamente:

```javascript
// Si se está cambiando a "recibida" y antes no lo estaba, actualizar stock
if (status === 'recibida' && purchase.status !== 'recibida') {
  // Actualizar stock de todos los productos en la compra
  for (const item of purchase.items) {
    await Product.findByIdAndUpdate(
      item.product,
      { $inc: { stock: item.quantity } },
      { new: true }
    );
  }
}
```

**Características:**
- ✅ Se ejecuta automáticamente al cambiar estado
- ✅ Suma la cantidad comprada al stock existente
- ✅ Maneja errores individuales por producto
- ✅ Logs detallados para auditoría

### 2. **Actualización Inmediata al Crear Compra**

Si se crea una compra marcada como "recibida" desde el inicio:

```javascript
// Si se marca como recibida al crear, actualizar stock inmediatamente
if (status === 'recibida') {
  purchase.actualDelivery = new Date();
  
  // Actualizar stock de todos los productos
  for (const item of validatedItems) {
    await Product.findByIdAndUpdate(
      item.product,
      { $inc: { stock: item.quantity } },
      { new: true }
    );
  }
}
```

**Características:**
- ✅ Opcional al crear la compra
- ✅ Permite recibir productos inmediatamente
- ✅ Establece fecha de entrega automáticamente

### 3. **Endpoint Específico para Recibir Compras**

Endpoint dedicado para marcar compras como recibidas y actualizar stock:

```javascript
POST /api/purchases/:id/receive
```

**Características:**
- ✅ Endpoint específico y claro
- ✅ Validaciones completas antes de actualizar
- ✅ Respuesta detallada con cambios de stock
- ✅ Manejo de errores robusto

## Flujo de Trabajo Completo

### **Escenario 1: Compra Pendiente → Recibida**
1. Usuario crea compra con estado "pendiente"
2. Compra se guarda sin afectar stock
3. Usuario cambia estado a "recibida"
4. Sistema actualiza stock automáticamente
5. Se establece fecha de entrega actual

### **Escenario 2: Compra Creada como Recibida**
1. Usuario crea compra con estado "recibida"
2. Sistema actualiza stock inmediatamente
3. Se establece fecha de entrega actual
4. Compra queda marcada como recibida

### **Escenario 3: Uso del Endpoint de Recepción**
1. Usuario llama a `/api/purchases/:id/receive`
2. Sistema valida que la compra pueda ser recibida
3. Se actualiza stock de todos los productos
4. Se marca compra como recibida
5. Se retorna resumen de cambios de stock

## Endpoints Disponibles

### **Cambiar Estado de Compra**
```
PATCH /api/purchases/:id/status
Body: { "status": "recibida" }
```

### **Recibir Compra Específicamente**
```
POST /api/purchases/:id/receive
```

### **Crear Compra con Estado**
```
POST /api/purchases
Body: { 
  "status": "recibida",  // Opcional, por defecto "pendiente"
  "items": [...],
  // ... otros campos
}
```

## Validaciones Implementadas

### **Antes de Actualizar Stock:**
- ✅ Compra existe y es válida
- ✅ Estado no es "recibida" ya
- ✅ Estado no es "cancelada"
- ✅ Productos existen en la base de datos

### **Durante la Actualización:**
- ✅ Operación atómica por producto
- ✅ Manejo de errores individuales
- ✅ Logs detallados para auditoría
- ✅ Continuación aunque falle un producto

### **Después de la Actualización:**
- ✅ Estado de compra actualizado
- ✅ Fecha de entrega establecida
- ✅ Respuesta con resumen de cambios
- ✅ Stock actualizado en productos

## Manejo de Errores

### **Errores de Producto:**
- Si un producto no existe, se retorna error
- Si falla la actualización de stock, se retorna error específico
- Se mantiene consistencia de datos

### **Errores de Base de Datos:**
- Transacciones atómicas por producto
- Rollback automático en caso de fallo
- Logs detallados para debugging

### **Errores de Validación:**
- Estados inválidos son rechazados
- Compras canceladas no pueden ser recibidas
- Compras ya recibidas no pueden ser procesadas nuevamente

## Logs y Auditoría

### **Logs de Stock:**
```
Stock actualizado para producto 507f1f77bcf86cd799439011: +50
Stock actualizado para producto 507f1f77bcf86cd799439012: +25
```

### **Logs de Errores:**
```
Error al actualizar stock del producto 507f1f77bcf86cd799439011: Product not found
```

### **Respuesta de API:**
```json
{
  "success": true,
  "message": "Compra recibida exitosamente y stock actualizado",
  "data": {
    "purchase": { ... },
    "stockUpdates": [
      {
        "productId": "507f1f77bcf86cd799439011",
        "productName": "Aceite de Oliva",
        "quantity": 50,
        "oldStock": 100,
        "newStock": 150
      }
    ]
  }
}
```

## Beneficios de la Solución

1. **Consistencia de Datos**: Stock siempre refleja las compras recibidas
2. **Flexibilidad**: Múltiples formas de recibir compras
3. **Auditoría**: Logs detallados de todos los cambios
4. **Robustez**: Manejo de errores y validaciones completas
5. **Automatización**: Stock se actualiza sin intervención manual

## Casos de Uso

### **Compras Inmediatas:**
- Productos que llegan el mismo día
- Compras de emergencia
- Recepción inmediata de mercancía

### **Compras Programadas:**
- Productos que llegan en fechas futuras
- Compras por lotes
- Recepción programada

### **Gestión de Inventario:**
- Control automático de stock
- Trazabilidad de productos
- Reportes de inventario actualizados

## Próximos Pasos Recomendados

1. **Implementar notificaciones** cuando se reciban compras
2. **Agregar reportes** de movimientos de stock por compras
3. **Implementar validaciones** de stock mínimo antes de recibir
4. **Agregar historial** de cambios de estado de compras
5. **Implementar alertas** para compras pendientes de recepción

## Notas Técnicas

- Las operaciones de stock son atómicas por producto
- Se mantiene consistencia entre compras y productos
- Los logs permiten auditoría completa de cambios
- La solución es escalable para grandes volúmenes
- Se mantiene compatibilidad con el sistema existente
