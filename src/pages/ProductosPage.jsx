import { useState, useEffect } from 'react'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Package,
  Leaf,
  Box,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  Package2,
  Upload,
  Download
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useProducts } from '@/hooks/useProducts'
import { useImport } from '@/hooks/useImport'
import { ImportModal } from '@/components/ImportModal'

export function ProductosPage() {
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('todos')
  
  // Hook para productos del backend
  const {
    products,
    loading,
    error,
    pagination,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    clearError
  } = useProducts()

  // Hook para importación
  const {
    loading: importLoading,
    importModalOpen,
    openImportModal,
    closeImportModal,
    importData
  } = useImport('products')

  const [formData, setFormData] = useState({
    name: '',
    unit: '',
    category: 'materia_prima',
    minStock: 0,
    description: '',
    price: 0,
    cost: 0,
    managesBatches: false
  })

  const units = [
    { value: 'g', label: 'Gramos (g)' },
    { value: 'kg', label: 'Kilogramos (kg)' },
    { value: 'ml', label: 'Mililitros (ml)' },
    { value: 'l', label: 'Litros (l)' },
    { value: 'unidad', label: 'Unidad' },
    { value: 'docena', label: 'Docena' },
    { value: 'caja', label: 'Caja' },
    { value: 'metro', label: 'Metro' },
    { value: 'cm', label: 'Centímetros (cm)' }
  ]

  // Configuración para importación
  const importConfig = {
    title: "Importar Productos",
    description: "Importa productos desde un archivo CSV o Excel",
    sampleData: [
      {
        name: "Harina de Trigo",
        unit: "kg",
        category: "materia_prima",
        minStock: "10",
        description: "Harina de trigo para panadería",
        price: "2.50",
        cost: "1.80",
        managesBatches: "true"
      },
      {
        name: "Pan Integral",
        unit: "unidad",
        category: "producto_terminado",
        minStock: "50",
        description: "Pan integral artesanal",
        price: "3.00",
        cost: "1.50",
        managesBatches: "false"
      },
      {
        name: "Caja de Empaque",
        unit: "caja",
        category: "empaque",
        minStock: "20",
        description: "Caja para empaque de productos",
        price: "0.50",
        cost: "0.30",
        managesBatches: "false"
      }
    ],
    columns: [
      { key: 'name', header: 'Nombre', required: true },
      { key: 'unit', header: 'Unidad (kg/g/l/ml/unidad/docena/caja/metro/cm)', required: true },
      { key: 'category', header: 'Categoría (materia_prima/producto_terminado/empaque/servicio)', required: true },
      { key: 'minStock', header: 'Stock Mínimo', required: false },
      { key: 'description', header: 'Descripción', required: false },
      { key: 'price', header: 'Precio', required: true },
      { key: 'cost', header: 'Costo', required: false },
      { key: 'managesBatches', header: 'Maneja Lotes (true/false)', required: false }
    ]
  }

  const inventoryTypes = [
    { value: 'materia_prima', label: 'Materia Prima', icon: Leaf, color: 'text-green-600' },
    { value: 'producto_terminado', label: 'Producto Terminado', icon: Package, color: 'text-blue-600' },
    { value: 'empaque', label: 'Empaque', icon: Box, color: 'text-purple-600' },
    { value: 'servicio', label: 'Servicio', icon: Package, color: 'text-orange-600' }
  ]

  // Buscar productos cuando cambien los filtros
  useEffect(() => {
    const params = {
      page: 1,
      limit: 50
    }
    
    if (searchTerm) {
      params.search = searchTerm
    }
    
    if (filterType !== 'todos') {
      params.category = filterType
    }
    
    fetchProducts(params)
  }, [searchTerm, filterType, fetchProducts])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (editingProduct) {
        // Actualizar producto existente
        const result = await updateProduct(editingProduct._id, formData)
        if (result.success) {
          setEditingProduct(null)
          resetForm()
          setShowForm(false)
        }
      } else {
        // Crear nuevo producto
        const result = await createProduct(formData)
        if (result.success) {
          resetForm()
          setShowForm(false)
        }
      }
    } catch (error) {
    }
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name || '',
      unit: product.unit || '',
      category: product.category || 'materia_prima',
      minStock: product.minStock || 0,
      description: product.description || '',
      price: product.price || 0,
      cost: product.cost || 0,
      managesBatches: product.managesBatches || false
    })
    setShowForm(true)
  }

  const handleDelete = async (productId) => {
    if (window.confirm('¿Está seguro de que desea eliminar este producto?')) {
      const result = await deleteProduct(productId)
      if (!result.success) {
        alert(`Error al eliminar: ${result.error}`)
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      unit: '',
      category: 'materia_prima',
      minStock: 0,
      description: '',
      price: 0,
      cost: 0,
      managesBatches: false
    })
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesFilter = filterType === 'todos' || product.category === filterType
    return matchesSearch && matchesFilter
  })

  const getInventoryTypeInfo = (type) => {
    return inventoryTypes.find(t => t.value === type)
  }

  const getStockStatus = (current, min) => {
    if (current <= 0) return { status: 'agotado', color: 'text-red-600', icon: XCircle }
    if (current <= min) return { status: 'bajo', color: 'text-orange-600', icon: AlertTriangle }
    return { status: 'normal', color: 'text-green-600', icon: CheckCircle }
  }

  // Mostrar mensaje de error si existe
  if (error) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="card card-hover p-6">
          <div className="text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error de conexión</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <Button onClick={clearError} className="btn-primary">
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Gestión de Productos</h1>
          <p className="text-gray-600 text-sm sm:text-base">Administra el catálogo de productos, materias primas y envases</p>
        </div>
        <div className="flex-shrink-0 flex flex-col sm:flex-row gap-2">
          <Button 
            onClick={openImportModal}
            variant="outline"
            className="w-full lg:w-auto flex items-center justify-center space-x-2 shadow-medium hover:shadow-strong transform hover:-translate-y-1 transition-all duration-300"
          >
            <Upload className="w-5 h-5" />
            <span className="hidden sm:inline">Importar</span>
            <span className="sm:hidden">Importar</span>
          </Button>
          <Button 
            onClick={() => setShowForm(true)}
            className="w-full lg:w-auto btn-primary flex items-center justify-center space-x-2 shadow-medium hover:shadow-strong transform hover:-translate-y-1 transition-all duration-300"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Nuevo Producto</span>
            <span className="sm:hidden">Nuevo</span>
          </Button>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-3 sm:px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="todos">Todos los tipos</option>
            {inventoryTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Formulario de Creación/Edición */}
      {showForm && (
        <div className="card card-hover p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              {editingProduct ? 'Editar Producto' : 'Crear Nuevo Producto'}
            </h2>
            <Button
              variant="ghost"
              onClick={() => {
                setShowForm(false)
                setEditingProduct(null)
                resetForm()
              }}
              className="self-end sm:self-auto"
            >
              <XCircle className="w-5 h-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Nombre del Producto */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full input-field"
                  placeholder="Ej: Crema Hidratante Facial"
                />
              </div>

              {/* Tipo de Inventario */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Inventario *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full input-field"
                >
                  {inventoryTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              {/* Unidad de Medida */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unidad de Medida *
                </label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  required
                  className="w-full input-field"
                >
                  <option value="">Seleccionar unidad</option>
                  {units.map(unit => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stock Mínimo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Mínimo *
                </label>
                <input
                  type="number"
                  name="minStock"
                  value={formData.minStock}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full input-field"
                  placeholder="0"
                />
              </div>

              {/* Precio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio Unitario
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full input-field"
                  placeholder="0.00"
                />
              </div>

              {/* Manejo de Lotes */}
              <div className="sm:col-span-2">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="managesBatches"
                    name="managesBatches"
                    checked={formData.managesBatches}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      managesBatches: e.target.checked
                    }))}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 mt-1 flex-shrink-0"
                  />
                  <div className="flex-1">
                    <label htmlFor="managesBatches" className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                      <Package2 className="w-4 h-4 text-blue-500" />
                      <span>Maneja lotes de producción</span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Marque esta opción si el producto requiere control de lotes con fechas de vencimiento
                    </p>
                  </div>
                </div>
              </div>

              {/* Costo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Costo Unitario
                </label>
                <input
                  type="number"
                  name="cost"
                  value={formData.cost}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full input-field"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                className="w-full input-field"
                placeholder="Descripción detallada del producto..."
              />
            </div>

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false)
                  setEditingProduct(null)
                  resetForm()
                }}
                className="btn-secondary w-full sm:w-auto order-2 sm:order-1"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="btn-primary w-full sm:w-auto order-1 sm:order-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    <span className="hidden sm:inline">
                      {editingProduct ? 'Actualizando...' : 'Creando...'}
                    </span>
                    <span className="sm:hidden">
                      {editingProduct ? 'Actualizando...' : 'Creando...'}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">
                      {editingProduct ? 'Actualizar Producto' : 'Crear Producto'}
                    </span>
                    <span className="sm:hidden">
                      {editingProduct ? 'Actualizar' : 'Crear'}
                    </span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Productos */}
      <div className="card card-hover">
        <div className="p-4 sm:p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            Productos ({filteredProducts.length})
          </h3>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-500">Cargando productos...</p>
          </div>
        ) : (
          <>
            {/* Vista en Tabla para pantallas grandes */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="table-header">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unidad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lotes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product) => {
                    const typeInfo = getInventoryTypeInfo(product.category)
                    const stockStatus = getStockStatus(product.stock, product.minStock)
                    const TypeIcon = typeInfo.icon
                    const StatusIcon = stockStatus.icon
                    
                    return (
                      <tr key={product._id} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">{product.description}</div>
                            <div className="text-xs text-gray-400">{product.category}</div>
                            {product.sku && (
                              <div className="text-xs text-gray-400">SKU: {product.sku}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <TypeIcon className={`w-4 h-4 ${typeInfo.color}`} />
                            <span className="text-sm text-gray-900">{typeInfo.label}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {product.unit}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <Package2 className={`w-4 h-4 ${product.managesBatches ? 'text-blue-500' : 'text-gray-400'}`} />
                            <span className={`text-sm ${product.managesBatches ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                              {product.managesBatches ? 'Maneja lotes' : 'Sin lotes'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <StatusIcon className={`w-4 h-4 ${stockStatus.color}`} />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {product.stock} {product.unit}
                              </div>
                              <div className="text-xs text-gray-500">
                                Mín: {product.minStock} {product.unit}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            ${product.price.toFixed(2)}
                          </div>
                          {product.cost > 0 && (
                            <div className="text-xs text-gray-500">
                              Costo: ${product.cost.toFixed(2)}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEdit(product)}
                              className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(product._id)}
                              className="text-red-600 hover:text-red-900 transition-colors duration-200"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Vista en Cards para pantallas pequeñas */}
            <div className="lg:hidden">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
                {filteredProducts.map((product) => {
                  const typeInfo = getInventoryTypeInfo(product.category)
                  const stockStatus = getStockStatus(product.stock, product.minStock)
                  const TypeIcon = typeInfo.icon
                  const StatusIcon = stockStatus.icon
                  
                  return (
                    <div key={product._id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-medium transition-all duration-200">
                      {/* Header del producto */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="text-base font-semibold text-gray-900 mb-1">{product.name}</h4>
                          {product.description && (
                            <p className="text-sm text-gray-600 mb-1">{product.description}</p>
                          )}
                          {product.sku && (
                            <p className="text-xs text-gray-400">SKU: {product.sku}</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <TypeIcon className={`w-4 h-4 ${typeInfo.color}`} />
                          <span className="text-xs text-gray-500">{typeInfo.label}</span>
                        </div>
                      </div>

                      {/* Información del producto */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Unidad:</span>
                          <span className="font-medium">{product.unit}</span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Lotes:</span>
                          <div className="flex items-center space-x-1">
                            <Package2 className={`w-4 h-4 ${product.managesBatches ? 'text-blue-500' : 'text-gray-400'}`} />
                            <span className={`text-xs ${product.managesBatches ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                              {product.managesBatches ? 'Maneja lotes' : 'Sin lotes'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Stock:</span>
                          <div className="flex items-center space-x-1">
                            <StatusIcon className={`w-4 h-4 ${stockStatus.color}`} />
                            <span className="font-medium">{product.stock} {product.unit}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Mínimo:</span>
                          <span className="text-gray-500">{product.minStock} {product.unit}</span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Precio:</span>
                          <span className="font-medium text-green-600">${product.price.toFixed(2)}</span>
                        </div>

                        {product.cost > 0 && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Costo:</span>
                            <span className="text-gray-500">${product.cost.toFixed(2)}</span>
                          </div>
                        )}
                      </div>

                      {/* Acciones */}
                      <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-100">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-blue-600 hover:text-blue-900 transition-colors duration-200 p-2 rounded-lg hover:bg-blue-50"
                          title="Editar producto"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="text-red-600 hover:text-red-900 transition-colors duration-200 p-2 rounded-lg hover:bg-red-50"
                          title="Eliminar producto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay productos</h3>
                <p className="text-gray-500">
                  {searchTerm || filterType !== 'todos' 
                    ? 'No se encontraron productos con los filtros aplicados'
                    : 'Comienza creando tu primer producto'
                  }
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de Importación */}
      <ImportModal
        isOpen={importModalOpen}
        onClose={closeImportModal}
        onImport={importData}
        title={importConfig.title}
        description={importConfig.description}
        sampleData={importConfig.sampleData}
        columns={importConfig.columns}
        loading={importLoading}
      />
    </div>
  )
}
