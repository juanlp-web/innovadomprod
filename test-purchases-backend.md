# Prueba del Backend de Compras

## Configuración

1. **Verificar que el servidor esté corriendo:**
   ```bash
   cd backend
   npm start
   ```

2. **Verificar que MongoDB esté conectado**

## Endpoints a Probar

### 1. Obtener todas las compras
```bash
GET http://localhost:5000/api/purchases
Headers: Authorization: Bearer <token>
```

### 2. Obtener estadísticas de compras
```bash
GET http://localhost:5000/api/purchases/stats/overview
Headers: Authorization: Bearer <token>
```

### 3. Crear nueva compra
```bash
POST http://localhost:5000/api/purchases
Headers: Authorization: Bearer <token>
Content-Type: application/json

{
  "supplier": "ID_DEL_PROVEEDOR",
  "items": [
    {
      "product": "ID_DEL_PRODUCTO",
      "quantity": 10,
      "unit": "kg",
      "price": 2.50
    }
  ],
  "paymentMethod": "Transferencia Bancaria",
  "expectedDelivery": "2024-02-15",
  "category": "Materia Prima",
  "notes": "Compra de prueba"
}
```

### 4. Obtener compra por ID
```bash
GET http://localhost:5000/api/purchases/:id
Headers: Authorization: Bearer <token>
```

### 5. Actualizar compra
```bash
PUT http://localhost:5000/api/purchases/:id
Headers: Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "en_transito",
  "notes": "Compra actualizada"
}
```

### 6. Cambiar estado de compra
```bash
PATCH http://localhost:5000/api/purchases/:id/status
Headers: Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "recibida"
}
```

### 7. Eliminar compra
```bash
DELETE http://localhost:5000/api/purchases/:id
Headers: Authorization: Bearer <token>
```

### 8. Obtener compras por proveedor
```bash
GET http://localhost:5000/api/purchases/supplier/:supplierId
Headers: Authorization: Bearer <token>
```

## Pruebas del Frontend

1. **Verificar que la página de compras cargue correctamente**
2. **Probar la creación de una nueva compra**
3. **Probar la edición de una compra existente**
4. **Probar el cambio de estado de compras**
5. **Probar la eliminación de compras**
6. **Probar los filtros y búsqueda**
7. **Probar la paginación**

## Verificaciones

### Base de Datos
- Verificar que se creen documentos en la colección `purchases`
- Verificar que las referencias a `suppliers` y `products` sean válidas
- Verificar que se actualicen las estadísticas del proveedor

### Validaciones
- Probar crear compra sin proveedor (debe fallar)
- Probar crear compra sin items (debe fallar)
- Probar crear compra con items inválidos (debe fallar)
- Probar editar compra cancelada (debe fallar)

### Permisos
- Verificar que solo usuarios autenticados puedan acceder
- Verificar que solo usuarios con rol apropiado puedan modificar

## Errores Comunes

1. **Error de conexión a MongoDB**
   - Verificar que MongoDB esté corriendo
   - Verificar la cadena de conexión

2. **Error de validación**
   - Verificar que todos los campos requeridos estén presentes
   - Verificar que los tipos de datos sean correctos

3. **Error de referencia**
   - Verificar que el proveedor y productos existan
   - Verificar que los IDs sean válidos

4. **Error de permisos**
   - Verificar que el token sea válido
   - Verificar que el usuario tenga los permisos necesarios

## Logs a Monitorear

- Creación de compras
- Actualización de estados
- Eliminación de compras
- Errores de validación
- Errores de base de datos
- Errores de permisos
