# Sistema de Importación de Registros

## 📋 Descripción General

El sistema de importación permite cargar registros masivamente desde archivos CSV o Excel en todos los módulos del sistema. Incluye validación de datos, vista previa y opciones de configuración avanzadas.

## 🚀 Características

### ✅ Funcionalidades Implementadas
- **Componente ImportModal reutilizable** - Modal universal para importación
- **Hook useImport** - Manejo de estado y lógica de importación
- **Rutas de backend** - API para procesar archivos CSV/Excel
- **Validación de datos** - Verificación antes de importar
- **Vista previa** - Muestra datos antes de confirmar importación
- **Archivos de ejemplo** - Descarga de plantillas CSV
- **Soporte multi-módulo** - Funciona en todos los módulos del sistema

### 📁 Módulos con Importación
- ✅ **Productos** - Importar catálogo de productos
- ✅ **Clientes** - Importar base de datos de clientes  
- ✅ **Proveedores** - Importar lista de proveedores
- 🔄 **Ventas** - Importar transacciones de venta
- 🔄 **Compras** - Importar transacciones de compra
- 🔄 **Bancos** - Importar transacciones bancarias
- 🔄 **Lotes** - Importar información de lotes
- 🔄 **Paquetes** - Importar paquetes de productos
- 🔄 **Recetas** - Importar recetas de producción
- 🔄 **Inventario** - Importar movimientos de inventario

## 🛠️ Uso del Sistema

### 1. Acceder a la Importación
En cualquier módulo, hacer clic en el botón **"Importar"** junto al botón "Nuevo".

### 2. Seleccionar Archivo
- Hacer clic en el área de selección de archivos
- Seleccionar archivo CSV, XLSX o XLS
- El sistema procesará automáticamente el archivo

### 3. Configurar Opciones
- **Saltar primera fila** - Si el archivo tiene encabezados
- **Actualizar existentes** - Actualizar registros que ya existen
- **Validar datos** - Verificar datos antes de importar

### 4. Vista Previa
- Revisar los datos que se van a importar
- Verificar que las columnas estén correctas
- Corregir errores si es necesario

### 5. Confirmar Importación
- Hacer clic en "Importar"
- El sistema procesará los datos
- Recibir confirmación del resultado

## 📊 Formatos de Archivo Soportados

### Productos
```csv
name,unit,category,minStock,description,price,cost,managesBatches
"Harina de Trigo",kg,materia_prima,10,"Harina para panadería",2.50,1.80,true
"Pan Integral",pcs,producto_terminado,50,"Pan artesanal",3.00,1.50,false
```

### Clientes
```csv
name,email,phone,address,type,status
"Juan Pérez",juan.perez@email.com,555-0123,"Calle Principal 123",persona,activo
"Empresa ABC S.A.",contacto@empresaabc.com,555-0456,"Av. Comercial 456",empresa,activo
```

### Proveedores
```csv
name,email,phone,address,status
"Proveedor ABC",contacto@proveedorabc.com,555-0123,"Calle Industrial 123",activo
"Distribuidora XYZ",ventas@distribuidoraxyz.com,555-0456,"Av. Comercial 456",activo
```

## 🔧 Configuración Técnica

### Frontend
- **ImportModal.jsx** - Componente principal del modal
- **useImport.jsx** - Hook para manejo de estado
- Integración en cada módulo con configuración específica

### Backend
- **routes/import.js** - Rutas de API para importación
- **multer** - Manejo de archivos subidos
- **csv-parser** - Procesamiento de archivos CSV
- Validación y mapeo de datos por módulo

### Dependencias
```json
{
  "multer": "^1.4.5",
  "csv-parser": "^3.0.0"
}
```

## 📝 Ejemplos de Uso

### Importar Productos
1. Ir a **Productos** → **Importar**
2. Seleccionar archivo CSV con datos de productos
3. Configurar opciones (saltar primera fila, validar datos)
4. Revisar vista previa
5. Confirmar importación

### Importar Clientes
1. Ir a **Clientes** → **Importar**
2. Descargar archivo de ejemplo si es necesario
3. Preparar archivo con datos de clientes
4. Subir archivo y configurar opciones
5. Importar datos

## ⚠️ Consideraciones Importantes

### Validación de Datos
- El sistema valida campos requeridos
- Verifica formatos de datos (emails, números, fechas)
- Muestra errores antes de importar

### Rendimiento
- Límite de 10MB por archivo
- Procesamiento en lotes para archivos grandes
- Feedback de progreso durante importación

### Seguridad
- Validación de tipos de archivo
- Sanitización de datos de entrada
- Manejo seguro de archivos temporales

## 🐛 Solución de Problemas

### Error: "Tipo de archivo no permitido"
- Verificar que el archivo sea CSV, XLSX o XLS
- Revisar extensión del archivo

### Error: "No se encontraron datos válidos"
- Verificar que el archivo no esté vacío
- Revisar formato de columnas
- Comprobar que los datos estén en las filas correctas

### Error: "Error al procesar archivo"
- Verificar codificación del archivo (UTF-8)
- Revisar separadores de columnas (comas)
- Comprobar que no haya caracteres especiales problemáticos

## 🔄 Próximas Mejoras

- [ ] Soporte para archivos Excel (.xlsx, .xls)
- [ ] Importación en segundo plano para archivos grandes
- [ ] Plantillas personalizables por módulo
- [ ] Historial de importaciones
- [ ] Rollback de importaciones
- [ ] Importación programada
- [ ] Notificaciones por email al completar

## 📞 Soporte

Para problemas o preguntas sobre el sistema de importación:
1. Revisar esta documentación
2. Verificar logs del sistema
3. Contactar al equipo de desarrollo

