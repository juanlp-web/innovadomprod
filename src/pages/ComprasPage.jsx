import { useState } from 'react'
import { Plus, Edit, Trash2, Search, ShoppingCart, Package, Truck, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ComprasPage() {
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('todos')
  
  const [purchases, setPurchases] = useState([
    {
      id: 1,
      purchaseNumber: 'C-001',
      supplierName: 'Distribuidora Cosmética S.A.',
      items: [
        { name: 'Aceite de Coco Orgánico', quantity: 50, unit: 'kg', price: 2.50, total: 125.00 },
        { name: 'Manteca de Karité', quantity: 25, unit: 'kg', price: 3.80, total: 95.00 }
      ],
      total: 278.00,
      status: 'recibida',
      paymentMethod: 'Transferencia Bancaria',
      orderDate: '2024-01-10',
      expectedDelivery: '2024-01-15',
      category: 'Materia Prima'
    },
    {
      id: 2,
      purchaseNumber: 'C-002',
      supplierName: 'Envases y Empaques Pro',
      items: [
        { name: 'Frasco 50ml Cristal', quantity: 200, unit: 'unidad', price: 0.85, total: 170.00 },
        { name: 'Tapa Rosca 50ml', quantity: 200, unit: 'unidad', price: 0.25, total: 50.00 }
      ],
      total: 283.00,
      status: 'en_transito',
      paymentMethod: 'Tarjeta de Crédito',
      orderDate: '2024-01-12',
      expectedDelivery: '2024-01-18',
      category: 'Envases'
    }
  ])

  const statuses = [
    { value: 'pendiente', label: 'Pendiente', color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
    { value: 'en_transito', label: 'En Tránsito', color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { value: 'recibida', label: 'Recibida', color: 'text-green-600', bgColor: 'bg-green-50' },
    { value: 'cancelada', label: 'Cancelada', color: 'text-red-600', bgColor: 'bg-red-50' }
  ]

  const categories = ['Materia Prima', 'Envases', 'Químicos', 'Equipos', 'Herramientas']

  const filteredPurchases = purchases.filter(purchase => {
    const matchesSearch = purchase.purchaseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         purchase.supplierName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'todos' || purchase.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const getStatusInfo = (status) => {
    return statuses.find(s => s.value === status)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP'
    }).format(amount)
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Gestión de Compras</h1>
          <p className="text-gray-600">Administra las compras y proveedores</p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center space-x-2 shadow-medium hover:shadow-strong transform hover:-translate-y-1 transition-all duration-300"
        >
          <Plus className="w-5 h-5" />
          <span>Nueva Compra</span>
        </Button>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="card card-hover p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar compras por número o proveedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {/* Filtros */}
          <div className="flex flex-wrap gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="todos">Todos los estados</option>
              {statuses.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Compras */}
      <div className="card card-hover">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Compras ({filteredPurchases.length})
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <ShoppingCart className="w-4 h-4" />
              <span>Total: {purchases.length}</span>
            </div>
          </div>
        </div>
        
        {/* Vista en Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredPurchases.map((purchase) => {
              const statusInfo = getStatusInfo(purchase.status)
              
              return (
                <div key={purchase.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-medium transition-all duration-200">
                  {/* Header de la compra */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 mb-1">{purchase.purchaseNumber}</h4>
                      <p className="text-sm text-gray-600">{purchase.supplierName}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${statusInfo.bgColor} ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                  </div>

                  {/* Productos */}
                  <div className="mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Package className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">Productos ({purchase.items.length})</span>
                    </div>
                    <div className="space-y-1">
                      {purchase.items.slice(0, 3).map((item, index) => (
                        <div key={index} className="text-xs text-gray-600">
                          {item.quantity} {item.unit} {item.name} - {formatCurrency(item.total)}
                        </div>
                      ))}
                      {purchase.items.length > 3 && (
                        <div className="text-xs text-gray-500">
                          +{purchase.items.length - 3} productos más
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Información financiera */}
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Total:</span>
                      <span className="font-bold text-lg text-gray-900">{formatCurrency(purchase.total)}</span>
                    </div>
                  </div>

                  {/* Información adicional */}
                  <div className="mb-4 flex items-center justify-between text-xs text-gray-500">
                    <div>
                      <div>Orden: {purchase.orderDate}</div>
                      <div>Entrega: {purchase.expectedDelivery}</div>
                    </div>
                    <div className="text-right">
                      <div>Categoría: {purchase.category}</div>
                      <div>{purchase.paymentMethod}</div>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 btn-secondary"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {filteredPurchases.length === 0 && (
          <div className="text-center py-12">
            <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay compras</h3>
            <p className="text-gray-500">
              {searchTerm || filterStatus !== 'todos'
                ? 'No se encontraron compras con los filtros aplicados'
                : 'Comienza creando tu primera compra'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
