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
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useProducts } from '@/hooks/useProducts'

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

  const [formData, setFormData] = useState({
    name: '',
    unit: '',
    category: 'materia_prima',
    minStock: 0,
    description: '',
    price: 0,
    supplier: '',
    cost: 0
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
      console.error('Error en el formulario:', error)
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
      supplier: product.supplier || '',
      cost: product.cost || 0
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
      supplier: '',
      cost: 0
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Gestión de Productos</h1>
          <p className="text-gray-600">Administra el catálogo de productos, materias primas y envases</p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center space-x-2 shadow-medium hover:shadow-strong transform hover:-translate-y-1 transition-all duration-300"
        >
          <Plus className="w-5 h-5" />
          <span>Nuevo Producto</span>
        </Button>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="todos">Todos los tipos</option>
          {inventoryTypes.map(type => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
      </div>

      {/* Formulario de Creación/Edición */}
      {showForm && (
        <div className="card card-hover p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {editingProduct ? 'Editar Producto' : 'Crear Nuevo Producto'}
            </h2>
            <Button
              variant="ghost"
              onClick={() => {
                setShowForm(false)
                setEditingProduct(null)
                resetForm()
              }}
            >
              <XCircle className="w-5 h-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre del Producto */}
              <div className="md:col-span-2">
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
                  Precio Unitario *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full input-field"
                  placeholder="0.00"
                />
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

              {/* Proveedor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proveedor
                </label>
                <input
                  type="text"
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleInputChange}
                  className="w-full input-field"
                  placeholder="Nombre del proveedor"
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
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false)
                  setEditingProduct(null)
                  resetForm()
                }}
                className="btn-secondary"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    {editingProduct ? 'Actualizando...' : 'Creando...'}
                  </>
                ) : (
                  editingProduct ? 'Actualizar Producto' : 'Crear Producto'
                )}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Productos */}
      <div className="card card-hover">
        <div className="p-6 border-b border-gray-100">
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
            <div className="overflow-x-auto">
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
    </div>
  )
}
