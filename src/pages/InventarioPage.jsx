import { useState } from 'react'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export function InventarioPage() {
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('todos')
  const [inventory, setInventory] = useState([
    {
      id: 1,
      productName: 'Crema Hidratante Facial',
      category: 'Producto Terminado',
      currentStock: 120,
      minStock: 50,
      maxStock: 200,
      unit: 'ml',
      location: 'Estante A-1',
      lastMovement: '2024-01-15',
      movementType: 'entrada',
      quantity: 25,
      cost: 25.99,
      supplier: 'Proveedor A'
    },
    {
      id: 2,
      productName: 'Aceite de Coco',
      category: 'Materia Prima',
      currentStock: 25,
      minStock: 10,
      maxStock: 100,
      unit: 'kg',
      location: 'Almacén B-3',
      lastMovement: '2024-01-14',
      movementType: 'salida',
      quantity: 5,
      cost: 15.50,
      supplier: 'Proveedor B'
    },
    {
      id: 3,
      productName: 'Frasco 50ml',
      category: 'Envases',
      currentStock: 200,
      minStock: 100,
      maxStock: 500,
      unit: 'unidad',
      location: 'Estante C-2',
      lastMovement: '2024-01-13',
      movementType: 'entrada',
      quantity: 50,
      cost: 0.85,
      supplier: 'Proveedor C'
    }
  ])

  const [formData, setFormData] = useState({
    productName: '',
    category: '',
    currentStock: 0,
    minStock: 0,
    maxStock: 0,
    unit: '',
    location: '',
    cost: 0,
    supplier: ''
  })

  const categories = [
    'Materia Prima',
    'Producto Terminado',
    'Envases',
    'Material de Empaque',
    'Herramientas'
  ]

  const units = ['g', 'kg', 'ml', 'l', 'unidad', 'docena', 'caja']

  const movementTypes = [
    { value: 'entrada', label: 'Entrada', icon: TrendingUp, color: 'text-green-600' },
    { value: 'salida', label: 'Salida', icon: TrendingDown, color: 'text-red-600' },
    { value: 'ajuste', label: 'Ajuste', icon: BarChart3, color: 'text-blue-600' }
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (editingItem) {
      setInventory(prev => prev.map(item => 
        item.id === editingItem.id ? { ...formData, id: item.id } : item
      ))
      setEditingItem(null)
    } else {
      const newItem = {
        ...formData,
        id: Date.now(),
        lastMovement: new Date().toISOString().split('T')[0],
        movementType: 'entrada',
        quantity: 0
      }
      setInventory(prev => [...prev, newItem])
    }
    
    setFormData({
      productName: '',
      category: '',
      currentStock: 0,
      minStock: 0,
      maxStock: 0,
      unit: '',
      location: '',
      cost: 0,
      supplier: ''
    })
    setShowForm(false)
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setFormData(item)
    setShowForm(true)
  }

  const handleDelete = (itemId) => {
    if (window.confirm('¿Está seguro de que desea eliminar este elemento del inventario?')) {
      setInventory(prev => prev.filter(item => item.id !== itemId))
    }
  }

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === 'todos' || item.category === filterType
    return matchesSearch && matchesFilter
  })

  const getMovementTypeInfo = (type) => {
    return movementTypes.find(t => t.value === type)
  }

  const getStockStatus = (current, min, max) => {
    if (current <= 0) return { status: 'agotado', color: 'text-red-600', icon: XCircle, bgColor: 'bg-red-50' }
    if (current <= min) return { status: 'bajo', color: 'text-orange-600', icon: AlertTriangle, bgColor: 'bg-orange-50' }
    if (current >= max * 0.9) return { status: 'alto', color: 'text-blue-600', icon: TrendingUp, bgColor: 'bg-blue-50' }
    return { status: 'normal', color: 'text-green-600', icon: CheckCircle, bgColor: 'bg-green-50' }
  }

  const getStockPercentage = (current, max) => {
    return Math.round((current / max) * 100)
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Control de Inventario</h1>
          <p className="text-gray-600">Gestiona el stock y movimientos de inventario</p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center space-x-2 shadow-medium hover:shadow-strong transform hover:-translate-y-1 transition-all duration-300"
        >
          <Plus className="w-5 h-5" />
          <span>Nuevo Item</span>
        </Button>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar en inventario..."
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
          <option value="todos">Todas las categorías</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {/* Formulario de Creación/Edición */}
      {showForm && (
        <div className="card card-hover p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {editingItem ? 'Editar Item de Inventario' : 'Agregar Nuevo Item'}
            </h2>
            <Button
              variant="ghost"
              onClick={() => {
                setShowForm(false)
                setEditingItem(null)
                setFormData({
                  productName: '',
                  category: '',
                  currentStock: 0,
                  minStock: 0,
                  maxStock: 0,
                  unit: '',
                  location: '',
                  cost: 0,
                  supplier: ''
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
                  name="productName"
                  value={formData.productName}
                  onChange={handleInputChange}
                  required
                  className="w-full input-field"
                  placeholder="Ej: Crema Hidratante Facial"
                />
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full input-field"
                >
                  <option value="">Seleccionar categoría</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Unidad */}
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
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>

              {/* Stock Actual */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Actual *
                </label>
                <input
                  type="number"
                  name="currentStock"
                  value={formData.currentStock}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full input-field"
                  placeholder="0"
                />
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

              {/* Stock Máximo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Máximo *
                </label>
                <input
                  type="number"
                  name="maxStock"
                  value={formData.maxStock}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full input-field"
                  placeholder="0"
                />
              </div>

              {/* Ubicación */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ubicación *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  className="w-full input-field"
                  placeholder="Ej: Estante A-1"
                />
              </div>

              {/* Precio */}
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

            {/* Botones */}
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false)
                  setEditingItem(null)
                }}
                className="btn-secondary"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="btn-primary shadow-medium hover:shadow-strong transform hover:-translate-y-1 transition-all duration-300"
              >
                {editingItem ? 'Actualizar Item' : 'Crear Item'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Inventario */}
      <div className="card card-hover">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            Inventario ({filteredInventory.length})
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
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ubicación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Último Movimiento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInventory.map((item) => {
                const stockStatus = getStockStatus(item.currentStock, item.minStock, item.maxStock)
                const stockPercentage = getStockPercentage(item.currentStock, item.maxStock)
                const StatusIcon = stockStatus.icon
                const movementInfo = getMovementTypeInfo(item.movementType)
                const MovementIcon = movementInfo.icon
                
                return (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.productName}</div>
                        <div className="text-sm text-gray-500">
                          Costo: ${item.cost.toFixed(2)} • Proveedor: {item.supplier}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.category}</div>
                      <div className="text-xs text-gray-500">{item.unit}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <StatusIcon className={`w-5 h-5 ${stockStatus.color}`} />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.currentStock} {item.unit}
                          </div>
                          <div className="text-xs text-gray-500">
                            Mín: {item.minStock} • Máx: {item.maxStock}
                          </div>
                          {/* Barra de progreso */}
                          <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className={`h-2 rounded-full ${stockStatus.bgColor.replace('bg-', 'bg-').replace('-50', '-500')}`}
                              style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <MovementIcon className={`w-4 h-4 ${movementInfo.color}`} />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.lastMovement}
                          </div>
                          <div className="text-xs text-gray-500">
                            {movementInfo.label} • {item.quantity} {item.unit}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-900 transition-colors duration-200"
                          title="Eliminar"
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

        {filteredInventory.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay items en inventario</h3>
            <p className="text-gray-500">
              {searchTerm || filterType !== 'todos' 
                ? 'No se encontraron items con los filtros aplicados'
                : 'Comienza agregando tu primer item al inventario'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
