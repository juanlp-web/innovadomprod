import { useState, useEffect } from 'react'
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
  TrendingUp,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSales } from '@/hooks/useSales'
import { useClients } from '@/hooks/useClients'
import { useProducts } from '@/hooks/useProducts'

export function VentasPage() {
  const { 
    sales, 
    loading, 
    error, 
    createSale, 
    updatePaymentStatus, 
    deleteSale, 
    clearError 
  } = useSales()
  
  const { clients, loading: clientsLoading } = useClients()
  const { products, loading: productsLoading } = useProducts()
  
  const [showForm, setShowForm] = useState(false)
  const [editingSale, setEditingSale] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('todos')
  const [selectedClient, setSelectedClient] = useState('')
  const [selectedProducts, setSelectedProducts] = useState([])

  const [formData, setFormData] = useState({
    client: '',
    items: [],
    paymentMethod: '',
    notes: '',
    dueDate: ''
  })

  const statuses = [
    { value: 'pendiente', label: 'Pendiente', color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
    { value: 'pagado', label: 'Pagado', color: 'text-green-600', bgColor: 'bg-green-50' },
    { value: 'parcial', label: 'Parcial', color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { value: 'cancelado', label: 'Cancelado', color: 'text-red-600', bgColor: 'bg-red-50' }
  ]

  const paymentMethods = [
    { value: 'efectivo', label: 'Efectivo' },
    { value: 'tarjeta', label: 'Tarjeta' },
    { value: 'transferencia', label: 'Transferencia' },
    { value: 'cheque', label: 'Cheque' }
  ]

  // Limpiar error cuando se desmonte el componente
  useEffect(() => {
    return () => clearError()
  }, [clearError])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleClientChange = (e) => {
    const clientId = e.target.value
    setSelectedClient(clientId)
    setFormData(prev => ({
      ...prev,
      client: clientId
    }))
  }

  const handleProductSelect = (productId) => {
    const product = products.find(p => p._id === productId)
    if (!product) return

    const existingItem = selectedProducts.find(item => item.product === productId)
    
    if (existingItem) {
      setSelectedProducts(prev => prev.map(item => 
        item.product === productId 
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.unitPrice }
          : item
      ))
    } else {
      setSelectedProducts(prev => [...prev, {
        product: productId,
        quantity: 1,
        unitPrice: product.price,
        total: product.price,
        discount: 0
      }])
    }
  }

  const handleProductQuantityChange = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      setSelectedProducts(prev => prev.filter(item => item.product !== productId))
      return
    }

    setSelectedProducts(prev => prev.map(item => 
      item.product === productId 
        ? { ...item, quantity: newQuantity, total: newQuantity * item.unitPrice }
        : item
    ))
  }

  const handleProductPriceChange = (productId, newPrice) => {
    setSelectedProducts(prev => prev.map(item => 
      item.product === productId 
        ? { ...item, unitPrice: newPrice, total: newPrice * item.quantity }
        : item
    ))
  }

  const handleProductDiscountChange = (productId, newDiscount) => {
    setSelectedProducts(prev => prev.map(item => 
      item.product === productId 
        ? { ...item, discount: newDiscount, total: (item.unitPrice - newDiscount) * item.quantity }
        : item
    ))
  }

  const calculateTotals = () => {
    const subtotal = selectedProducts.reduce((sum, item) => sum + item.total, 0)
    const tax = subtotal * 0.16 // 16% IVA
    const total = subtotal + tax
    return { subtotal, tax, total }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.client) {
      alert('Debe seleccionar un cliente')
      return
    }
    
    if (selectedProducts.length === 0) {
      alert('Debe agregar al menos un producto')
      return
    }

    try {
      const saleData = {
        ...formData,
        items: selectedProducts,
        dueDate: formData.dueDate || null
      }

      await createSale(saleData)
      
      // Limpiar formulario
      setFormData({
        client: '',
        items: [],
        paymentMethod: '',
        notes: '',
        dueDate: ''
      })
      setSelectedClient('')
      setSelectedProducts([])
      setShowForm(false)
    } catch (err) {
      console.error('Error al crear venta:', err)
    }
  }

  const handleEdit = (sale) => {
    setEditingSale(sale)
    setFormData({
      client: sale.client._id || sale.client,
      items: sale.items || [],
      paymentMethod: sale.paymentMethod || '',
      notes: sale.notes || '',
      dueDate: sale.dueDate ? new Date(sale.dueDate).toISOString().split('T')[0] : ''
    })
    setSelectedClient(sale.client._id || sale.client)
    setSelectedProducts(sale.items || [])
    setShowForm(true)
  }

  const handleDelete = async (saleId) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta venta?')) {
      try {
        await deleteSale(saleId)
      } catch (err) {
        console.error('Error al eliminar venta:', err)
      }
    }
  }

  const handleStatusChange = async (saleId, newStatus) => {
    try {
      await updatePaymentStatus(saleId, newStatus)
    } catch (err) {
      console.error('Error al actualizar estado:', err)
    }
  }

  const filteredSales = sales.filter(sale => {
    const matchesSearch = 
      (sale.client?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sale.invoiceNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'todos' || sale.paymentStatus === filterStatus
    return matchesSearch && matchesFilter
  })

  const getStatusInfo = (status) => {
    return statuses.find(s => s.value === status)
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pagado': return CheckCircle
      case 'parcial': return Clock
      case 'pendiente': return Clock
      case 'cancelado': return XCircle
      default: return Clock
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP'
    }).format(amount)
  }

  const getClientName = (clientId) => {
    if (typeof clientId === 'string') {
      const client = clients.find(c => c._id === clientId)
      return client ? client.name : 'Cliente no encontrado'
    }
    return clientId?.name || 'Cliente no encontrado'
  }

  const getProductName = (productId) => {
    if (typeof productId === 'string') {
      const product = products.find(p => p._id === productId)
      return product ? product.name : 'Producto no encontrado'
    }
    return productId?.name || 'Producto no encontrado'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando ventas...</p>
        </div>
      </div>
    )
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

      {/* Mostrar error si existe */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <div>
            <p className="text-red-800 font-medium">Error</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearError}
            className="text-red-500 hover:text-red-700"
          >
            <XCircle className="w-4 h-4" />
          </Button>
        </div>
      )}

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
                  client: '',
                  items: [],
                  paymentMethod: '',
                  notes: '',
                  dueDate: ''
                })
                setSelectedClient('')
                setSelectedProducts([])
              }}
            >
              <XCircle className="w-5 h-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Selección de Cliente */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cliente *
                </label>
                <select
                  name="client"
                  value={selectedClient}
                  onChange={handleClientChange}
                  required
                  className="w-full input-field"
                >
                  <option value="">Seleccionar cliente</option>
                  {clients.map(client => (
                    <option key={client._id} value={client._id}>
                      {client.name} - {client.email}
                    </option>
                  ))}
                </select>
              </div>

              {/* Método de Pago */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Método de Pago *
                </label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  required
                  className="w-full input-field"
                >
                  <option value="">Seleccionar método</option>
                  {paymentMethods.map(method => (
                    <option key={method.value} value={method.value}>{method.label}</option>
                  ))}
                </select>
              </div>

              {/* Fecha de Vencimiento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Vencimiento
                </label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  className="w-full input-field"
                />
              </div>
            </div>

            {/* Selección de Productos */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Productos</h3>
              
              {/* Selector de productos */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Agregar Producto
                </label>
                <select
                  onChange={(e) => handleProductSelect(e.target.value)}
                  className="w-full input-field"
                  defaultValue=""
                >
                  <option value="">Seleccionar producto</option>
                  {products.map(product => (
                    <option key={product._id} value={product._id}>
                      {product.name} - Precio: {formatCurrency(product.price)} - Stock: {product.stock || 0}
                    </option>
                  ))}
                </select>
              </div>

              {/* Lista de productos seleccionados */}
              {selectedProducts.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Productos Seleccionados:</h4>
                  {selectedProducts.map((item, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{getProductName(item.product)}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedProducts(prev => prev.filter((_, i) => i !== index))}
                          className="text-red-500 hover:text-red-700"
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Cantidad</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleProductQuantityChange(item.product, parseInt(e.target.value))}
                            className="w-full input-field text-sm"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Precio Unitario</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => handleProductPriceChange(item.product, parseFloat(e.target.value))}
                            className="w-full input-field text-sm"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Descuento</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.discount}
                            onChange={(e) => handleProductDiscountChange(item.product, parseFloat(e.target.value))}
                            className="w-full input-field text-sm"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Total</label>
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(item.total)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Totales */}
              {selectedProducts.length > 0 && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Resumen de Totales</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="font-medium">{formatCurrency(calculateTotals().subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>IVA (16%):</span>
                      <span className="font-medium">{formatCurrency(calculateTotals().tax)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-blue-900">
                      <span>Total:</span>
                      <span>{formatCurrency(calculateTotals().total)}</span>
                    </div>
                  </div>
                </div>
              )}
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
                  setFormData({
                    client: '',
                    items: [],
                    paymentMethod: '',
                    notes: '',
                    dueDate: ''
                  })
                  setSelectedClient('')
                  setSelectedProducts([])
                }}
                className="btn-secondary"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="btn-primary shadow-medium hover:shadow-strong transform hover:-translate-y-1 transition-all duration-300"
                disabled={!selectedClient || selectedProducts.length === 0}
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
                const statusInfo = getStatusInfo(sale.paymentStatus)
                const StatusIcon = getStatusIcon(sale.paymentStatus)
                
                return (
                  <tr key={sale._id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{sale.invoiceNumber}</div>
                        <div className="text-xs text-gray-500">
                          {paymentMethods.find(m => m.value === sale.paymentMethod)?.label || sale.paymentMethod} • {sale.items?.length || 0} productos
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{getClientName(sale.client)}</div>
                        <div className="text-xs text-gray-500">
                          {sale.client?.email || 'Email no disponible'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        {sale.items?.map((item, index) => (
                          <div key={index} className="text-xs text-gray-600">
                            {item.quantity}x {getProductName(item.product)}
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
                        <StatusIcon className={`w-4 h-4 ${statusInfo?.color}`} />
                        <span className={`text-sm font-medium ${statusInfo?.color}`}>
                          {statusInfo?.label}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs text-gray-600">
                        <div>Venta: {new Date(sale.saleDate).toLocaleDateString('es-DO')}</div>
                        <div>Vencimiento: {sale.dueDate ? new Date(sale.dueDate).toLocaleDateString('es-DO') : 'No definida'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <select
                          value={sale.paymentStatus}
                          onChange={(e) => handleStatusChange(sale._id, e.target.value)}
                          className="text-xs border border-gray-300 rounded px-2 py-1"
                        >
                          {statuses.map(status => (
                            <option key={status.value} value={status.value}>{status.label}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleEdit(sale)}
                          className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(sale._id)}
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
