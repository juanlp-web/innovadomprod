import { useState } from 'react'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  DollarSign,
  ShoppingCart,
  User,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export function VentasPage() {
  const [showForm, setShowForm] = useState(false)
  const [editingSale, setEditingSale] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('todos')
  const [sales, setSales] = useState([
    {
      id: 1,
      invoiceNumber: 'V-001',
      customerName: 'María González',
      customerEmail: 'maria@email.com',
      customerPhone: '+1 809-555-0101',
      products: [
        { name: 'Crema Hidratante Facial', quantity: 2, price: 25.99, total: 51.98 },
        { name: 'Mascarilla de Arcilla', quantity: 1, price: 18.50, total: 18.50 }
      ],
      subtotal: 70.48,
      tax: 10.57,
      total: 81.05,
      status: 'completada',
      paymentMethod: 'Tarjeta de Crédito',
      saleDate: '2024-01-15',
      deliveryDate: '2024-01-17',
      notes: 'Cliente preferente, entrega a domicilio'
    },
    {
      id: 2,
      invoiceNumber: 'V-002',
      customerName: 'Carlos Rodríguez',
      customerEmail: 'carlos@email.com',
      customerPhone: '+1 809-555-0102',
      products: [
        { name: 'Serum Vitamina C', quantity: 1, price: 32.99, total: 32.99 }
      ],
      subtotal: 32.99,
      tax: 4.95,
      total: 37.94,
      status: 'pendiente',
      paymentMethod: 'Efectivo',
      saleDate: '2024-01-16',
      deliveryDate: '2024-01-18',
      notes: 'Pago pendiente de confirmación'
    },
    {
      id: 3,
      invoiceNumber: 'V-003',
      customerName: 'Ana Martínez',
      customerEmail: 'ana@email.com',
      customerPhone: '+1 809-555-0103',
      products: [
        { name: 'Aceite Corporal Relajante', quantity: 3, price: 28.75, total: 86.25 },
        { name: 'Shampoo Natural', quantity: 2, price: 22.00, total: 44.00 }
      ],
      subtotal: 130.25,
      tax: 19.54,
      total: 149.79,
      status: 'en_proceso',
      paymentMethod: 'Transferencia Bancaria',
      saleDate: '2024-01-14',
      deliveryDate: '2024-01-20',
      notes: 'Productos en preparación'
    }
  ])

  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    products: [],
    subtotal: 0,
    tax: 0,
    total: 0,
    status: 'pendiente',
    paymentMethod: '',
    saleDate: '',
    deliveryDate: '',
    notes: ''
  })

  const statuses = [
    { value: 'pendiente', label: 'Pendiente', color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
    { value: 'en_proceso', label: 'En Proceso', color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { value: 'completada', label: 'Completada', color: 'text-green-600', bgColor: 'bg-green-50' },
    { value: 'cancelada', label: 'Cancelada', color: 'text-red-600', bgColor: 'bg-red-50' }
  ]

  const paymentMethods = [
    'Efectivo',
    'Tarjeta de Crédito',
    'Tarjeta de Débito',
    'Transferencia Bancaria',
    'Cheque',
    'PayPal'
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
    
    if (editingSale) {
      setSales(prev => prev.map(sale => 
        sale.id === editingSale.id ? { ...formData, id: sale.id } : sale
      ))
      setEditingSale(null)
    } else {
      const newSale = {
        ...formData,
        id: Date.now(),
        invoiceNumber: `V-${String(Date.now()).slice(-3)}`,
        saleDate: new Date().toISOString().split('T')[0]
      }
      setSales(prev => [...prev, newSale])
    }
    
    setFormData({
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      products: [],
      subtotal: 0,
      tax: 0,
      total: 0,
      status: 'pendiente',
      paymentMethod: '',
      saleDate: '',
      deliveryDate: '',
      notes: ''
    })
    setShowForm(false)
  }

  const handleEdit = (sale) => {
    setEditingSale(sale)
    setFormData(sale)
    setShowForm(true)
  }

  const handleDelete = (saleId) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta venta?')) {
      setSales(prev => prev.filter(sale => sale.id !== saleId))
    }
  }

  const filteredSales = sales.filter(sale => {
    const matchesSearch = sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sale.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'todos' || sale.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const getStatusInfo = (status) => {
    return statuses.find(s => s.value === status)
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completada': return CheckCircle
      case 'en_proceso': return Clock
      case 'pendiente': return Clock
      case 'cancelada': return XCircle
      default: return Clock
    }
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Gestión de Ventas</h1>
          <p className="text-gray-600">Administra las ventas y pedidos de clientes</p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center space-x-2 shadow-medium hover:shadow-strong transform hover:-translate-y-1 transition-all duration-300"
        >
          <Plus className="w-5 h-5" />
          <span>Nueva Venta</span>
        </Button>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar ventas por cliente o factura..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
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

      {/* Formulario de Creación/Edición */}
      {showForm && (
        <div className="card card-hover p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {editingSale ? 'Editar Venta' : 'Crear Nueva Venta'}
            </h2>
            <Button
              variant="ghost"
              onClick={() => {
                setShowForm(false)
                setEditingSale(null)
                setFormData({
                  customerName: '',
                  customerEmail: '',
                  customerPhone: '',
                  products: [],
                  subtotal: 0,
                  tax: 0,
                  total: 0,
                  status: 'pendiente',
                  paymentMethod: '',
                  saleDate: '',
                  deliveryDate: '',
                  notes: ''
                })
              }}
            >
              <XCircle className="w-5 h-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Información del Cliente */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Cliente</h3>
              </div>

              {/* Nombre del Cliente */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Cliente *
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  required
                  className="w-full input-field"
                  placeholder="Nombre completo del cliente"
                />
              </div>

              {/* Email del Cliente */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email del Cliente
                </label>
                <input
                  type="email"
                  name="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleInputChange}
                  className="w-full input-field"
                  placeholder="cliente@email.com"
                />
              </div>

              {/* Teléfono del Cliente */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono del Cliente
                </label>
                <input
                  type="tel"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleInputChange}
                  className="w-full input-field"
                  placeholder="+1 809-555-0100"
                />
              </div>

              {/* Método de Pago */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Método de Pago
                </label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  className="w-full input-field"
                >
                  <option value="">Seleccionar método</option>
                  {paymentMethods.map(method => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>

              {/* Estado de la Venta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado de la Venta *
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                  className="w-full input-field"
                >
                  {statuses.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>

              {/* Fecha de Entrega */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Entrega
                </label>
                <input
                  type="date"
                  name="deliveryDate"
                  value={formData.deliveryDate}
                  onChange={handleInputChange}
                  className="w-full input-field"
                />
              </div>
            </div>

            {/* Productos (simplificado para el ejemplo) */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Productos</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  {editingSale ? 'Edición de productos no disponible en esta versión' : 'Los productos se pueden agregar después de crear la venta'}
                </p>
              </div>
            </div>

            {/* Notas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas Adicionales
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="3"
                className="w-full input-field"
                placeholder="Observaciones, instrucciones de entrega, etc..."
              />
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false)
                  setEditingSale(null)
                }}
                className="btn-secondary"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="btn-primary shadow-medium hover:shadow-strong transform hover:-translate-y-1 transition-all duration-300"
              >
                {editingSale ? 'Actualizar Venta' : 'Crear Venta'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Ventas */}
      <div className="card card-hover">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            Ventas ({filteredSales.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="table-header">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Venta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Productos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fechas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSales.map((sale) => {
                const statusInfo = getStatusInfo(sale.status)
                const StatusIcon = getStatusIcon(sale.status)
                
                return (
                  <tr key={sale.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{sale.invoiceNumber}</div>
                        <div className="text-xs text-gray-500">
                          {sale.paymentMethod} • {sale.products.length} productos
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{sale.customerName}</div>
                        <div className="text-xs text-gray-500">{sale.customerEmail}</div>
                        <div className="text-xs text-gray-500">{sale.customerPhone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        {sale.products.map((product, index) => (
                          <div key={index} className="text-xs text-gray-600">
                            {product.quantity}x {product.name}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(sale.total)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Subtotal: {formatCurrency(sale.subtotal)}
                        </div>
                        <div className="text-xs text-gray-500">
                          IVA: {formatCurrency(sale.tax)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
                        <span className={`text-sm font-medium ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs text-gray-600">
                        <div>Venta: {sale.saleDate}</div>
                        <div>Entrega: {sale.deliveryDate || 'No definida'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(sale)}
                          className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(sale.id)}
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

        {filteredSales.length === 0 && (
          <div className="text-center py-12">
            <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay ventas</h3>
            <p className="text-gray-500">
              {searchTerm || filterStatus !== 'todos' 
                ? 'No se encontraron ventas con los filtros aplicados'
                : 'Comienza creando tu primera venta'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
