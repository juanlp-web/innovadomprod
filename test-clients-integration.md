# Prueba de Integración del Módulo de Clientes

## Pasos para Probar la Integración

### 1. Verificar Configuración del Backend

Asegúrate de que el backend esté configurado y funcionando:

```bash
# En el directorio backend
cd backend

# Instalar dependencias si no están instaladas
npm install

# Verificar que existe el archivo .env
# Si no existe, copia env-template.txt como .env y configura:
# MONGODB_URI=mongodb://localhost:27017/innovadomprod
# JWT_SECRET=tu_secret_jwt_aqui
# PORT=5000

# Iniciar el servidor
npm start
# o
node server.js
```

### 2. Verificar Configuración del Frontend

En el directorio raíz del proyecto:

```bash
# Verificar que existe el archivo .env
# Si no existe, crea uno con:
VITE_API_URL=http://localhost:5000/api

# Instalar dependencias si no están instaladas
npm install

# Iniciar el frontend
npm run dev
```

### 3. Probar la Autenticación

Antes de probar los clientes, asegúrate de estar autenticado:

1. Ve a la página de login
2. Inicia sesión con un usuario válido
3. Verifica que tienes acceso a la página de clientes

### 4. Probar Funcionalidades de Clientes

#### 4.1 Cargar Lista de Clientes

1. Navega a la página de clientes
2. Verifica que se muestre el indicador de loading
3. Verifica que se carguen los clientes (puede estar vacía inicialmente)

#### 4.2 Crear Nuevo Cliente

1. Haz clic en "+ Nuevo Cliente"
2. Llena el formulario con datos de prueba:
   - **Nombre**: "Juan Pérez Test"
   - **Email**: "juan.test@email.com"
   - **Teléfono**: "+1 809-555-0123"
   - **Tipo**: "Individual"
   - **Ciudad**: "Santo Domingo"
   - **Límite de Crédito**: "1000"
   - **Términos de Pago**: "30"
3. Haz clic en "Crear"
4. Verifica que el cliente aparezca en la lista

#### 4.3 Ver Detalle del Cliente

1. Haz clic en "Ver" en el cliente creado
2. Verifica que se abra el modal de detalle
3. Verifica que se muestre toda la información correctamente
4. Cierra el modal

#### 4.4 Editar Cliente

1. Haz clic en "Editar" en el cliente
2. Modifica algún campo (ej: cambiar el límite de crédito a 2000)
3. Haz clic en "Actualizar"
4. Verifica que los cambios se reflejen en la lista

#### 4.5 Buscar Clientes

1. En el campo de búsqueda, escribe "Juan"
2. Haz clic en "Buscar"
3. Verifica que se muestre solo el cliente "Juan Pérez Test"

#### 4.6 Filtrar por Tipo

1. En el filtro de tipo, selecciona "Individual"
2. Haz clic en "Buscar"
3. Verifica que se muestren solo clientes individuales

#### 4.7 Filtrar por Estado

1. En el filtro de estado, selecciona "Activo"
2. Haz clic en "Buscar"
3. Verifica que se muestren solo clientes activos

#### 4.8 Eliminar Cliente

1. Haz clic en "Eliminar" en el cliente de prueba
2. Confirma la eliminación
3. Verifica que el cliente desaparezca de la lista

### 5. Verificar Estados de Loading

Durante las operaciones, verifica que:

- Los botones se deshabiliten
- Se muestren indicadores de loading
- Se muestren mensajes apropiados

### 6. Verificar Manejo de Errores

#### 6.1 Error de Conexión

1. Detén el backend
2. Intenta crear un cliente
3. Verifica que se muestre un mensaje de error apropiado

#### 6.2 Error de Validación

1. Intenta crear un cliente sin nombre
2. Verifica que se muestre el mensaje de error del campo

### 7. Verificar Responsividad

1. Cambia el tamaño de la ventana del navegador
2. Verifica que la interfaz se adapte correctamente
3. Prueba en diferentes dispositivos si es posible

## Casos de Prueba Específicos

### Caso 1: Cliente Individual

```javascript
{
  name: "María González",
  email: "maria@email.com",
  phone: "+1 809-555-0123",
  type: "individual",
  address: {
    street: "Calle Principal 123",
    city: "Santo Domingo",
    state: "Distrito Nacional",
    zipCode: "10101"
  },
  creditLimit: 5000,
  paymentTerms: 30,
  isActive: true
}
```

### Caso 2: Cliente Empresa

```javascript
{
  name: "Empresa ABC SRL",
  email: "contacto@abc.com",
  phone: "+1 809-555-0456",
  type: "empresa",
  taxId: "123-4567890",
  address: {
    street: "Avenida Empresarial 456",
    city: "Santiago",
    state: "Santiago",
    zipCode: "51000"
  },
  creditLimit: 25000,
  paymentTerms: 60,
  isActive: true,
  contactPerson: {
    name: "Carlos López",
    phone: "+1 809-555-0789",
    email: "carlos@abc.com"
  }
}
```

### Caso 3: Cliente Distribuidor

```javascript
{
  name: "Distribuidora XYZ",
  email: "ventas@xyz.com",
  phone: "+1 809-555-0321",
  type: "distribuidor",
  taxId: "987-6543210",
  address: {
    street: "Zona Industrial 789",
    city: "La Romana",
    state: "La Romana",
    zipCode: "22000"
  },
  creditLimit: 50000,
  paymentTerms: 90,
  isActive: true,
  notes: "Cliente mayorista con descuentos especiales"
}
```

## Verificación de la Base de Datos

### 1. Conectar a MongoDB

```bash
# Si usas MongoDB local
mongosh
use innovadomprod

# Si usas MongoDB Atlas
mongosh "mongodb+srv://username:password@cluster.mongodb.net/innovadomprod"
```

### 2. Verificar Colección de Clientes

```javascript
// Ver todos los clientes
db.clients.find()

// Ver clientes activos
db.clients.find({isActive: true})

// Ver clientes por tipo
db.clients.find({type: "individual"})

// Ver cliente específico
db.clients.findOne({name: "Juan Pérez Test"})
```

### 3. Verificar Índices

```javascript
// Ver índices de la colección
db.clients.getIndexes()

// Verificar que existe el índice de texto
db.clients.find({$text: {$search: "Juan"}})
```

## Solución de Problemas Comunes

### Problema: No se cargan los clientes

**Posibles causas:**
- Backend no está corriendo
- Error de conexión a MongoDB
- Problema de autenticación JWT

**Solución:**
1. Verificar que el backend esté corriendo en el puerto 5000
2. Verificar la conexión a MongoDB
3. Verificar que el usuario esté autenticado
4. Revisar la consola del navegador y logs del backend

### Problema: Error 401 (No autorizado)

**Posibles causas:**
- Token JWT expirado o inválido
- Usuario no tiene permisos

**Solución:**
1. Cerrar sesión y volver a iniciar
2. Verificar que el JWT_SECRET esté configurado correctamente
3. Verificar permisos del usuario

### Problema: Error 500 (Error del servidor)

**Posibles causas:**
- Error en la base de datos
- Error en la validación del modelo
- Error en el middleware

**Solución:**
1. Revisar logs del backend
2. Verificar que el modelo Client esté correctamente definido
3. Verificar la conexión a MongoDB

### Problema: Los cambios no se reflejan

**Posibles causas:**
- Problema de caché en el frontend
- Error en la actualización del estado
- Problema de sincronización

**Solución:**
1. Recargar la página
2. Verificar que las funciones del hook estén funcionando
3. Verificar que el estado se esté actualizando correctamente

## Métricas de Rendimiento

### 1. Tiempo de Respuesta

- **Carga inicial**: < 2 segundos
- **Búsqueda**: < 1 segundo
- **Crear cliente**: < 3 segundos
- **Actualizar cliente**: < 2 segundos
- **Eliminar cliente**: < 1 segundo

### 2. Uso de Memoria

- Verificar que no haya memory leaks
- El estado se limpie correctamente al desmontar componentes

### 3. Optimizaciones

- Paginación para listas grandes
- Búsqueda con debounce
- Lazy loading de componentes pesados

## Conclusión

Si todas las pruebas pasan correctamente, la integración del módulo de clientes está funcionando perfectamente. El sistema proporciona:

- ✅ Operaciones CRUD completas
- ✅ Búsqueda y filtrado avanzado
- ✅ Paginación eficiente
- ✅ Manejo robusto de errores
- ✅ UI responsiva y profesional
- ✅ Integración completa con el backend

El módulo está listo para uso en producción y puede manejar la gestión completa de clientes para la empresa.
