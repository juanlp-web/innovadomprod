# Módulo de Reportes Estadísticos - ProductOneX

## Descripción General

El módulo de Reportes Estadísticos es una herramienta integral que permite generar informes detallados y visualizaciones estadísticas de todos los módulos del sistema ProductOneX. Proporciona análisis de datos avanzados, gráficos interactivos y reportes exportables en múltiples formatos.

## Características Principales

### 📊 **Informes Estadísticos Disponibles**
- **Dashboard**: Resumen estadístico general del negocio con múltiples gráficos
- **Ventas**: Análisis estadístico de ventas, tendencias y distribución
- **Compras**: Análisis estadístico de compras y proveedores
- **Productos**: Análisis estadístico de productos, inventario y categorías
- **Clientes**: Análisis estadístico de clientes y su distribución
- **Proveedores**: Análisis estadístico de proveedores y compras
- **Lotes**: Análisis estadístico de lotes y producción
- **Recetas**: Análisis estadístico de recetas y producción

### 📈 **Tipos de Gráficos Estadísticos**
- **Gráficos de Barras**: Para comparaciones y rankings
- **Gráficos de Líneas**: Para tendencias temporales
- **Gráficos Circulares**: Para distribución y proporciones
- **Indicadores de Tendencia**: Con porcentajes de cambio

### 📅 **Rangos de Fecha**
- Últimos 7 días
- Últimos 30 días
- Últimos 90 días
- Último año
- Todo el historial

### 📁 **Formatos de Exportación**
- **TXT**: Reporte estadístico en texto plano
- **JSON**: Datos estructurados para análisis
- **Excel**: (En desarrollo)
- **PDF**: (En desarrollo)

## Estructura de Archivos

```
src/
├── pages/
│   └── ReporteriaPage.jsx          # Página principal de reportes estadísticos
├── components/
│   └── ReportChart.jsx             # Componente de gráficos estadísticos
├── hooks/
│   └── useReporteria.jsx           # Hook personalizado para reportería
└── components/
    └── Sidebar.jsx                 # Navegación (actualizado)
```

## Funcionalidades Implementadas

### 1. **Generación de Reportes Estadísticos**
- Selección de módulo específico
- Filtrado por rango de fechas
- Vista previa en tiempo real
- Generación asíncrona con indicador de carga
- **NUEVO**: Gráficos estadísticos interactivos

### 2. **Análisis Estadístico Avanzado**
- **Dashboard**: 
  - Ventas mensuales (gráfico de líneas)
  - Categorías de productos (gráfico circular)
  - Niveles de stock (gráfico de barras)
- **Ventas**: 
  - Total, monto, items, promedio
  - Venta más alta y más baja
  - Gráficos de tendencias temporales
- **Compras**: 
  - Total, monto, items, promedio
  - Compra más alta y más baja
  - Análisis por proveedor
- **Productos**: 
  - Total, activos, stock bajo, con lotes
  - Stock total y promedio
  - Distribución por categorías
- **Clientes**: 
  - Total, activos, inactivos
  - Porcentaje de clientes activos
- **Proveedores**: 
  - Total, activos, inactivos
  - Porcentaje de proveedores activos

### 3. **Visualización Estadística Avanzada**
- **Gráficos de Barras**: Con gradientes y animaciones
- **Gráficos de Líneas**: Con grid, puntos interactivos y gradientes
- **Gráficos Circulares**: Con centro blanco y leyenda detallada
- **Indicadores de Tendencia**: Con colores y porcentajes
- **Resumen Estadístico**: Total y promedio en cada gráfico
- **Contador de Registros**: Información de cantidad de datos

### 4. **Exportación y Reportes**
- Descarga automática de archivos
- Nombres de archivo con timestamp
- Formato legible y estructurado
- **NUEVO**: Reportes con análisis estadístico detallado

## Uso del Sistema

### **Acceso**
1. Navegar a "Reportería" en el sidebar
2. Seleccionar el módulo deseado
3. Elegir el rango de fechas
4. Visualizar gráficos estadísticos en tiempo real
5. Hacer clic en "Generar Reporte" para descargar

### **Navegación**
- **Sidebar**: Nueva entrada "Reportería" con ícono FileBarChart
- **Ruta**: `/reporteria`
- **Acceso**: Usuarios autenticados

### **Interfaz de Usuario**
- **Header**: Título, descripción y botón de generación
- **Filtros**: Selector de módulo y rango de fechas
- **Módulos**: Grid de tarjetas seleccionables
- **Gráficos Estadísticos**: Visualizaciones interactivas por módulo
- **Vista Previa**: Contenido del reporte en tiempo real

## Componentes Técnicos

### **ReporteriaPage.jsx**
- Página principal del módulo de reportes estadísticos
- Gestión de estado local y filtros
- Integración con hooks de datos
- Generación de contenido estadístico
- **NUEVO**: Renderizado de gráficos estadísticos por módulo

### **ReportChart.jsx**
- Componente reutilizable para gráficos estadísticos
- Soporte para múltiples tipos de gráficos
- Indicadores de tendencia y estadísticas
- **NUEVO**: Resumen estadístico (total y promedio)
- **NUEVO**: Iconos específicos por tipo de gráfico
- **NUEVO**: Mejoras visuales y animaciones
- **NUEVO**: Grid lines y gradientes en gráficos de líneas
- **NUEVO**: Centro blanco en gráficos circulares

### **useReporteria.jsx**
- Hook personalizado para lógica de reportería
- Estado de generación de reportes
- Funciones de exportación
- Manejo de errores

## Datos y Estadísticas

### **Dashboard - Estadísticas Generales**
```javascript
{
  totalSales: number,           // Total de ventas
  totalPurchases: number,       // Total de compras
  totalProducts: number,        // Total de productos
  totalClients: number,         // Total de clientes
  totalSuppliers: number,       // Total de proveedores
  pendingSales: number,         // Ventas pendientes
  pendingPurchases: number      // Compras pendientes
}
```

### **Ventas - Análisis Estadístico**
```javascript
{
  totalSales: number,           // Cantidad total de ventas
  totalAmount: number,          // Monto total
  totalItems: number,           // Total de items vendidos
  averagePerSale: number,       // Promedio por venta
  highestSale: number,          // Venta más alta
  lowestSale: number            // Venta más baja
}
```

### **Productos - Análisis Estadístico**
```javascript
{
  totalProducts: number,        // Total de productos
  activeProducts: number,       // Productos activos
  lowStockProducts: number,     // Productos con stock bajo
  productsWithBatches: number,  // Productos con lotes
  totalStock: number,           // Stock total
  averageStock: number          // Stock promedio
}
```

### **Clientes - Análisis Estadístico**
```javascript
{
  totalClients: number,         // Total de clientes
  activeClients: number,        // Clientes activos
  inactiveClients: number,      // Clientes inactivos
  activePercentage: number      // Porcentaje de clientes activos
}
```

## Personalización y Estilos

### **Colores por Módulo**
- Dashboard: Azul (`from-blue-500 to-blue-600`)
- Ventas: Verde (`from-green-500 to-green-600`)
- Compras: Naranja (`from-orange-500 to-orange-600`)
- Productos: Púrpura (`from-purple-500 to-purple-600`)
- Clientes: Índigo (`from-indigo-500 to-indigo-600`)
- Proveedores: Rojo (`from-red-500 to-red-600`)
- Lotes: Teal (`from-teal-500 to-teal-600`)
- Recetas: Rosa (`from-pink-500 to-pink-600`)

### **Tipos de Gráficos Estadísticos**
- **Bar**: Gráfico de barras horizontales con gradientes y animaciones
- **Line**: Gráfico de líneas con grid, puntos interactivos y gradientes
- **Pie**: Gráfico circular con centro blanco y leyenda detallada

### **Mejoras Visuales**
- Gradientes en barras y líneas
- Animaciones y transiciones suaves
- Grid lines en gráficos de líneas
- Centros blancos en gráficos circulares
- Iconos específicos por tipo de gráfico
- Resumen estadístico integrado

## Funciones Estadísticas Implementadas

### **generateSalesStats()**
- Agrupación de ventas por mes
- Cálculo de totales y conteos
- Simulación de tendencias

### **generateProductsStats()**
- Distribución por categorías
- Conteo de productos por tipo

### **generateStockStats()**
- Niveles de stock (bajo, medio, alto, sin stock)
- Categorización automática

### **generateClientStats()**
- Estado de clientes (activos/inactivos)
- Cálculo de porcentajes

### **generateSupplierStats()**
- Estado de proveedores (activos/inactivos)
- Análisis de compras por proveedor

## Próximas Mejoras

### **Funcionalidades Planificadas**
- [ ] Exportación a Excel real con gráficos
- [ ] Exportación a PDF con visualizaciones
- [ ] Gráficos más avanzados (Chart.js, D3.js)
- [ ] Filtros adicionales (categorías, estados, rangos personalizados)
- [ ] Programación de reportes automáticos
- [ ] Envío por email con gráficos adjuntos
- [ ] Almacenamiento de reportes generados
- [ ] **NUEVO**: Comparativas entre períodos
- [ ] **NUEVO**: Predicciones y forecasting
- [ ] **NUEVO**: Alertas estadísticas automáticas

### **Optimizaciones**
- [ ] Caché de datos para reportes frecuentes
- [ ] Lazy loading de gráficos
- [ ] Compresión de archivos grandes
- [ ] Paginación para datasets extensos
- [ ] **NUEVO**: Memoización de cálculos estadísticos
- [ ] **NUEVO**: Debounce en filtros de fecha

## Integración con el Sistema

### **Hooks Utilizados**
- `useDashboard`: Estadísticas del dashboard
- `useProducts`: Datos de productos
- `useSales`: Datos de ventas
- `usePurchases`: Datos de compras
- `useClients`: Datos de clientes
- `useSuppliers`: Datos de proveedores

### **Dependencias**
- React Hooks (useState, useEffect)
- Lucide React (íconos)
- Tailwind CSS (estilos)
- Componentes UI personalizados
- **NUEVO**: SVG para gráficos personalizados

## Mantenimiento

### **Archivos a Actualizar**
- Agregar nuevos módulos en `modules` array
- Implementar funciones de reporte estadístico específicas
- Actualizar tipos de gráficos en `ReportChart`
- Extender funcionalidades en `useReporteria`
- **NUEVO**: Agregar nuevas métricas estadísticas

### **Consideraciones de Rendimiento**
- Lazy loading de datos pesados
- Debounce en filtros de fecha
- Memoización de cálculos complejos
- Optimización de re-renders
- **NUEVO**: Cálculo eficiente de estadísticas
- **NUEVO**: Renderizado optimizado de gráficos SVG

## Conclusión

El módulo de Reportes Estadísticos proporciona una solución completa y avanzada para el análisis de datos del sistema ProductOneX, permitiendo a los usuarios generar informes detallados con visualizaciones estadísticas interactivas. La arquitectura modular y extensible facilita futuras mejoras y la adición de nuevas funcionalidades estadísticas.

### **Características Destacadas**
- ✅ **Gráficos Estadísticos Interactivos**: Barras, líneas y circulares
- ✅ **Análisis Estadístico Avanzado**: Totales, promedios, tendencias
- ✅ **Visualizaciones Mejoradas**: Gradientes, animaciones, grid lines
- ✅ **Resumen Estadístico Integrado**: Total y promedio en cada gráfico
- ✅ **Reportes Detallados**: Con análisis estadístico completo
- ✅ **Interfaz Moderna**: Diseño responsive y profesional
