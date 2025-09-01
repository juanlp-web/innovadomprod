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
  AlertCircle,
  Package2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSales } from '@/hooks/useSales'
import { useClients } from '@/hooks/useClients'
import { useProducts } from '@/hooks/useProducts'
import { useBatches } from '@/hooks/useBatches'

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
  const { getActiveBatchesByProduct, loading: batchesLoading } = useBatches()
  
  const [showForm, setShowForm] = useState(false)
  const [editingSale, setEditingSale] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('todos')
  const [selectedClient, setSelectedClient] = useState('')
  const [selectedProducts, setSelectedProducts] = useState([])
  const [availableBatches, setAvailableBatches] = useState({}) // { productId: [batches] }
  const [selectedBatches, setSelectedBatches] = useState({}) // { productId: batchId }

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

  const handleProductSelect = async (productId) => {
    const product = products.find(p => p._id === productId)
    if (!product) return

    // Cargar lotes disponibles del producto
    try {
      const batches = await getActiveBatchesByProduct(productId)
      setAvailableBatches(prev => ({
        ...prev,
        [productId]: batches.filter(batch => batch.currentStock > 0 && batch.status === 'activo')
      }))
    } catch (err) {
      console.error('Error al cargar lotes del producto:', err)
      setAvailableBatches(prev => ({
        ...prev,
        [productId]: []
      }))
    }

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

  const handleBatchSelect = (productId, batchId) => {
    if (!batchId) {
      setSelectedBatches(prev => {
        const newBatches = { ...prev }
        delete newBatches[productId]
        return newBatches
      })
      return
    }

    // Validar que la cantidad actual no exceda el stock del lote seleccionado
    const selectedProduct = selectedProducts.find(item => item.product === productId)
    const selectedBatch = availableBatches[productId]?.find(batch => batch._id === batchId)
    
    if (selectedProduct && selectedBatch && selectedProduct.quantity > selectedBatch.currentStock) {
      alert(`La cantidad actual (${selectedProduct.quantity}) excede el stock disponible del lote #${selectedBatch.batchNumber} (${selectedBatch.currentStock} ${selectedBatch.unit}). Se ajustará la cantidad automáticamente.`)
      
      // Ajustar la cantidad al stock disponible
      handleProductQuantityChange(productId, selectedBatch.currentStock)
    }

    setSelectedBatches(prev => ({
      ...prev,
      [productId]: batchId
    }))
  }

  const handleProductQuantityChange = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      setSelectedProducts(prev => prev.filter(item => item.product !== productId))
      // Limpiar el lote seleccionado cuando se elimina el producto
      setSelectedBatches(prev => {
        const newBatches = { ...prev }
        delete newBatches[productId]
        return newBatches
      })
      return
    }

    // Validar que la cantidad no exceda el stock del lote seleccionado
    const selectedBatchId = selectedBatches[productId]
    if (selectedBatchId) {
      const availableBatch = availableBatches[productId]?.find(batch => batch._id === selectedBatchId)
      if (availableBatch && newQuantity > availableBatch.currentStock) {
        alert(`La cantidad solicitada (${newQuantity}) excede el stock disponible del lote #${availableBatch.batchNumber} (${availableBatch.currentStock} ${availableBatch.unit})`)
        return
      }
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

    // Validar que todos los productos tengan lote seleccionado (solo si tienen lotes disponibles)
    const productsWithoutBatch = selectedProducts.filter(item => {
      const hasAvailableBatches = availableBatches[item.product] && availableBatches[item.product].length > 0;
      return hasAvailableBatches && !selectedBatches[item.product];
    });
    
    if (productsWithoutBatch.length > 0) {
      const productNames = productsWithoutBatch.map(item => getProductName(item.product)).join(', ');
      alert(`Debe seleccionar un lote para los siguientes productos: ${productNames}`)
      return
    }

    try {
      const saleData = {
        ...formData,
        items: selectedProducts.map(item => ({
          ...item,
          batch: selectedBatches[item.product]
        })),
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
      setSelectedBatches({})
      setAvailableBatches({})
      setShowForm(false)
    } catch (err) {
      console.error('Error al crear venta:', err)
    }
  }

  const handleEdit = async (sale) => {
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
    
    // Cargar lotes para los productos de la venta
    const batchesData = {}
    const selectedBatchesData = {}
    
    for (const item of sale.items || []) {
      try {
        const batches = await getActiveBatchesByProduct(item.product)
        batchesData[item.product] = batches.filter(batch => batch.currentStock > 0 && batch.status === 'activo')
        
        // Si el item tiene un lote asignado, seleccionarlo
        if (item.batch) {
          selectedBatchesData[item.product] = item.batch
        }
      } catch (err) {
        console.error('Error al cargar lotes del producto:', err)
        batchesData[item.product] = []
      }
    }
    
    setAvailableBatches(batchesData)
    setSelectedBatches(selectedBatchesData)
    setShowForm(true)
  }

  const removeProduct = (productId, index) => {
    setSelectedProducts(prev => prev.filter((_, i) => i !== index))
    // Limpiar el lote seleccionado cuando se elimina el producto
    setSelectedBatches(prev => {
      const newBatches = { ...prev }
      delete newBatches[productId]
      return newBatches
    })
    // Limpiar los lotes disponibles del producto eliminado
    setAvailableBatches(prev => {
      const newBatches = { ...prev }
      delete newBatches[productId]
      return newBatches
    })
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

  const validateBatchesSelected = () => {
    return selectedProducts.every(item => {
      const hasAvailableBatches = availableBatches[item.product] && availableBatches[item.product].length > 0;
      // Si no hay lotes disponibles, no se requiere selección
      if (!hasAvailableBatches) return true;
      // Si hay lotes disponibles, se debe seleccionar uno
      return selectedBatches[item.product];
    });
  };

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
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Gestión de Ventas</h1>
          <p className="text-gray-600 text-sm sm:text-base">Administra las ventas y pedidos de clientes</p>
        </div>
        <div className="flex-shrink-0">
          <Button 
            onClick={() => setShowForm(true)}
            className="w-full lg:w-auto btn-primary flex items-center justify-center space-x-2 shadow-medium hover:shadow-strong transform hover:-translate-y-1 transition-all duration-300"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Nueva Venta</span>
            <span className="sm:hidden">Nueva</span>
          </Button>
        </div>
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
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar ventas por cliente o factura..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-3 sm:px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="todos">Todos los estados</option>
            {statuses.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
        </div>
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
              
              {/* Mensaje de ayuda sobre lotes */}
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700">
                  <strong>💡 Sistema de Lotes:</strong> 
                  {selectedProducts.some(item => availableBatches[item.product] && availableBatches[item.product].length > 0) ? (
                    'Después de seleccionar un producto, debe elegir el lote específico del cual se venderá. Esto permite un control preciso del inventario y trazabilidad de los productos vendidos.'
                  ) : (
                    'Los productos seleccionados no manejan lotes, por lo que se pueden vender directamente desde el inventario general.'
                  )}
                </p>
              </div>
              
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
                          onClick={() => removeProduct(item.product, index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      {/* Selector de Lotes */}
                      <div className="bg-blue-50 rounded-lg p-3">
                        <label className="block text-xs font-medium text-blue-700 mb-2 flex items-center">
                          <Package2 className="w-4 h-4 mr-1" />
                          Seleccionar Lote {availableBatches[item.product] && availableBatches[item.product].length > 0 ? '*' : '(Opcional)'}
                        </label>
                        {availableBatches[item.product] && availableBatches[item.product].length > 0 ? (
                          <select
                            value={selectedBatches[item.product] || ''}
                            onChange={(e) => handleBatchSelect(item.product, e.target.value)}
                            className="w-full input-field text-sm border-blue-200 focus:border-blue-500"
                            required
                          >
                            <option value="">Seleccionar lote...</option>
                            {availableBatches[item.product].map(batch => (
                              <option key={batch._id} value={batch._id}>
                                Lote #{batch.batchNumber} - Stock: {batch.currentStock} {batch.unit} - Vence: {new Date(batch.expirationDate).toLocaleDateString()}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                            Este producto no maneja lotes - se puede vender directamente
                          </div>
                        )}
                        {!selectedBatches[item.product] && availableBatches[item.product] && availableBatches[item.product].length > 0 && (
                          <p className="text-xs text-orange-600 mt-1">
                            ⚠️ Debe seleccionar un lote para continuar
                          </p>
                        )}
                        {selectedBatches[item.product] && (
                          <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                            <p className="text-xs text-green-700">
                              ✅ Lote seleccionado: Stock disponible: {
                                availableBatches[item.product]?.find(batch => batch._id === selectedBatches[item.product])?.currentStock || 0
                              } {
                                availableBatches[item.product]?.find(batch => batch._id === selectedBatches[item.product])?.unit || ''
                              }
                            </p>
                          </div>
                        )}
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

            {/* Indicador de Progreso de Lotes */}
            {selectedProducts.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Package2 className="w-4 h-4 mr-2" />
                  Estado de Selección de Lotes
                </h4>
                <div className="space-y-2">
                  {selectedProducts.map((item, index) => {
                    const hasBatch = selectedBatches[item.product]
                    const availableBatchesForProduct = availableBatches[item.product] || []
                    return (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">
                          {getProductName(item.product)}
                        </span>
                        <div className="flex items-center space-x-2">
                          {hasBatch ? (
                            <span className="text-green-600 text-sm flex items-center">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Lote seleccionado
                            </span>
                          ) : availableBatchesForProduct.length > 0 ? (
                            <span className="text-orange-600 text-sm flex items-center">
                              <AlertCircle className="w-4 h-4 mr-1" />
                              Pendiente
                            </span>
                          ) : (
                            <span className="text-blue-600 text-sm flex items-center">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Sin lotes - Listo para vender
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

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
                  setSelectedBatches({})
                  setAvailableBatches({})
                }}
                className="btn-secondary"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="btn-primary shadow-medium hover:shadow-strong transform hover:-translate-y-1 transition-all duration-300"
                disabled={!selectedClient || selectedProducts.length === 0 || !validateBatchesSelected()}
              >
                {editingSale ? 'Actualizar Venta' : 'Crear Venta'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Ventas */}
      <div className="card card-hover">
        <div className="p-4 sm:p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            Ventas ({filteredSales.length})
          </h3>
        </div>
        
        <>
          {/* Vista de tarjetas para móviles */}
          <div className="lg:hidden p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredSales.map((sale) => {
                const statusInfo = getStatusInfo(sale.paymentStatus)
                const StatusIcon = getStatusIcon(sale.paymentStatus)
                
                return (
                  <div key={sale._id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    {/* Header de la tarjeta */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-sm">{sale.invoiceNumber}</h4>
                        <p className="text-xs text-gray-600">
                          {paymentMethods.find(m => m.value === sale.paymentMethod)?.label || sale.paymentMethod}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <StatusIcon className={`w-4 h-4 ${statusInfo?.color}`} />
                        <span className={`text-xs font-medium ${statusInfo?.color}`}>
                          {statusInfo?.label}
                        </span>
                      </div>
                    </div>
                    
                    {/* Cliente */}
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-900">{getClientName(sale.client)}</p>
                      <p className="text-xs text-gray-600">
                        {sale.client?.email || 'Email no disponible'}
                      </p>
                    </div>
                    
                    {/* Productos */}
                    <div className="mb-3">
                      <p className="text-xs text-gray-600 mb-1">
                        Productos ({sale.items?.length || 0}):
                      </p>
                      <div className="space-y-1">
                        {sale.items?.slice(0, 3).map((item, index) => (
                          <div key={index} className="text-xs text-gray-600">
                            {item.quantity}x {getProductName(item.product)}
                            {item.batch && (
                              <span className="text-blue-600 ml-1">
                                (Lote #{item.batch.batchNumber || item.batch})
                              </span>
                            )}
                          </div>
                        ))}
                        {sale.items?.length > 3 && (
                          <p className="text-xs text-gray-500">
                            +{sale.items.length - 3} productos más...
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Totales */}
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-900">
                        Total: {formatCurrency(sale.total)}
                      </p>
                      <p className="text-xs text-gray-600">
                        Subtotal: {formatCurrency(sale.subtotal)} • IVA: {formatCurrency(sale.tax)}
                      </p>
                    </div>
                    
                    {/* Acciones */}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(sale)}
                        className="flex-1 text-xs p-2"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(sale._id)}
                        className="flex-1 text-xs p-2 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          
          {/* Vista de tabla para desktop */}
          <div className="hidden lg:block overflow-x-auto">
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
                              {item.batch && (
                                <span className="text-blue-600 ml-1">
                                  (Lote #{item.batch.batchNumber || item.batch})
                                </span>
                              )}
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
        </>

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
