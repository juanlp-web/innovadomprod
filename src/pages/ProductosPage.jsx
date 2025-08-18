import { useState } from 'react'
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
  XCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ProductosPage() {
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('todos')
  const [products, setProducts] = useState([
    {
      id: 1,
      name: 'Crema Hidratante Facial',
      unit: 'ml',
      baseUnit: 'ml',
      conversionFactor: 1,
      inventoryType: 'producto_terminado',
      minStock: 50,
      currentStock: 120,
      description: 'Crema hidratante para piel seca y sensible',
      price: 25.99,
      supplier: 'Proveedor A',
      category: 'Cuidado Facial'
    },
    {
      id: 2,
      name: 'Aceite de Coco',
      unit: 'kg',
      baseUnit: 'g',
      conversionFactor: 1000,
      inventoryType: 'materia_prima',
      minStock: 10,
      currentStock: 25,
      description: 'Aceite de coco virgen para formulaciones',
      price: 15.50,
      supplier: 'Proveedor B',
      category: 'Materias Primas'
    },
    {
      id: 3,
      name: 'Frasco 50ml',
      unit: 'unidad',
      baseUnit: 'unidad',
      conversionFactor: 1,
      inventoryType: 'envases',
      minStock: 100,
      currentStock: 200,
      description: 'Frasco de vidrio con tapa rosca',
      price: 0.85,
      supplier: 'Proveedor C',
      category: 'Envases'
    }
  ])

  const [formData, setFormData] = useState({
    name: '',
    unit: '',
    baseUnit: '',
    conversionFactor: 1,
    inventoryType: 'materia_prima',
    minStock: 0,
    description: '',
    price: 0,
    supplier: '',
    category: ''
  })

  const units = [
    { value: 'g', label: 'Gramos (g)', baseUnit: 'g', factor: 1 },
    { value: 'kg', label: 'Kilogramos (kg)', baseUnit: 'g', factor: 1000 },
    { value: 'ml', label: 'Mililitros (ml)', baseUnit: 'ml', factor: 1 },
    { value: 'l', label: 'Litros (l)', baseUnit: 'ml', factor: 1000 },
    { value: 'unidad', label: 'Unidad', baseUnit: 'unidad', factor: 1 },
    { value: 'docena', label: 'Docena', baseUnit: 'unidad', factor: 12 },
    { value: 'caja', label: 'Caja', baseUnit: 'unidad', factor: 24 }
  ]

  const inventoryTypes = [
    { value: 'materia_prima', label: 'Materia Prima', icon: Leaf, color: 'text-green-600' },
    { value: 'producto_terminado', label: 'Producto Terminado', icon: Package, color: 'text-blue-600' },
    { value: 'envases', label: 'Envases', icon: Box, color: 'text-purple-600' }
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Auto-update baseUnit and conversionFactor when unit changes
    if (name === 'unit') {
      const selectedUnit = units.find(u => u.value === value)
      if (selectedUnit) {
        setFormData(prev => ({
          ...prev,
          unit: value,
          baseUnit: selectedUnit.baseUnit,
          conversionFactor: selectedUnit.factor
        }))
      }
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (editingProduct) {
      // Update existing product
      setProducts(prev => prev.map(p => 
        p.id === editingProduct.id ? { ...formData, id: p.id } : p
      ))
      setEditingProduct(null)
    } else {
      // Create new product
      const newProduct = {
        ...formData,
        id: Date.now(),
        currentStock: 0
      }
      setProducts(prev => [...prev, newProduct])
    }
    
    setFormData({
      name: '',
      unit: '',
      baseUnit: '',
      conversionFactor: 1,
      inventoryType: 'materia_prima',
      minStock: 0,
      description: '',
      price: 0,
      supplier: '',
      category: ''
    })
    setShowForm(false)
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setFormData(product)
    setShowForm(true)
  }

  const handleDelete = (productId) => {
    if (window.confirm('¿Está seguro de que desea eliminar este producto?')) {
      setProducts(prev => prev.filter(p => p.id !== productId))
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === 'todos' || product.inventoryType === filterType
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
                setFormData({
                  name: '',
                  unit: '',
                  baseUnit: '',
                  conversionFactor: 1,
                  inventoryType: 'materia_prima',
                  minStock: 0,
                  description: '',
                  price: 0,
                  supplier: '',
                  category: ''
                })
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
                  name="inventoryType"
                  value={formData.inventoryType}
                  onChange={handleInputChange}
                  required
                  className="w-full input-field"
                >
                  {inventoryTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría
                </label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full input-field"
                  placeholder="Ej: Cuidado Facial"
                />
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

              {/* Unidad Base */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unidad Base
                </label>
                <input
                  type="text"
                  name="baseUnit"
                  value={formData.baseUnit}
                  readOnly
                  className="w-full input-field bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Unidad base para conversiones automáticas
                </p>
              </div>

              {/* Factor de Conversión */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Factor de Conversión
                </label>
                <input
                  type="number"
                  name="conversionFactor"
                  value={formData.conversionFactor}
                  readOnly
                  className="w-full input-field bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Factor automático: 1 {formData.unit} = {formData.conversionFactor} {formData.baseUnit}
                </p>
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
                }}
                className="btn-secondary"
              >
                Cancelar
              </Button>
              <Button type="submit" className="btn-primary">
                {editingProduct ? 'Actualizar Producto' : 'Crear Producto'}
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
                const typeInfo = getInventoryTypeInfo(product.inventoryType)
                const stockStatus = getStockStatus(product.currentStock, product.minStock)
                const TypeIcon = typeInfo.icon
                const StatusIcon = stockStatus.icon
                
                return (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.description}</div>
                        <div className="text-xs text-gray-400">{product.category}</div>
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
                        {product.conversionFactor > 1 && (
                          <span className="text-xs text-gray-500 ml-1">
                            (1 = {product.conversionFactor} {product.baseUnit})
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <StatusIcon className={`w-4 h-4 ${stockStatus.color}`} />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {product.currentStock} {product.unit}
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
                      <div className="text-xs text-gray-500">
                        {product.supplier}
                      </div>
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
                          onClick={() => handleDelete(product.id)}
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
      </div>
    </div>
  )
}
