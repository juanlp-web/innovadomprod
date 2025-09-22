import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search, ShoppingCart, Package, Truck, DollarSign, AlertCircle, Package2, Eye, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePurchases } from '@/hooks/usePurchases'
import { useSuppliers } from '@/hooks/useSuppliers'
import { useProducts } from '@/hooks/useProducts'
import { useBanks } from '@/hooks/useBanks'
import { useMobile } from '@/hooks/useMobile'
import { PurchaseModal } from '@/components/PurchaseModal'
import { PaymentModal } from '@/components/PaymentModal'
import { PaymentHistoryModal } from '@/components/PaymentHistoryModal'
import { PaymentPromptModal } from '@/components/PaymentPromptModal'
import { useImport } from '@/hooks/useImport'
import { ImportModal } from '@/components/ImportModal'

function ComprasPage() {
  const { isMobile } = useMobile()
  const [showForm, setShowForm] = useState(false)
  const [editingPurchase, setEditingPurchase] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('todos')
  const [filterCategory, setFilterCategory] = useState('todos')
  const [filterSupplier, setFilterSupplier] = useState('todos')
  const [currentPage, setCurrentPage] = useState(1)
  
  // Estados para pagos parciales
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedPurchaseForPayment, setSelectedPurchaseForPayment] = useState(null)
  const [purchasePayments, setPurchasePayments] = useState({}) // { purchaseId: { payments, paidAmount, remainingAmount } }
  const [showPaymentHistoryModal, setShowPaymentHistoryModal] = useState(false)
  const [selectedPurchaseForHistory, setSelectedPurchaseForHistory] = useState(null)
  const [showPaymentPromptModal, setShowPaymentPromptModal] = useState(false)
  const [newlyCreatedPurchase, setNewlyCreatedPurchase] = useState(null)
  
  // Hook para importación
  const {
    loading: importLoading,
    importModalOpen,
    openImportModal,
    closeImportModal,
    importData
  } = useImport('purchases');

  // Configuración para importación
  const importConfig = {
    title: "Importar Compras",
    description: "Importa compras desde un archivo CSV o Excel",
    sampleData: [
      {
        supplierId: "64a1b2c3d4e5f6789012345",
        productId: "64a1b2c3d4e5f6789012346",
        quantity: "100",
        price: "15.75",
        total: "1575.00",
        date: "2024-01-15",
        status: "completada"
      },
      {
        supplierId: "64a1b2c3d4e5f6789012347",
        productId: "64a1b2c3d4e5f6789012348",
        quantity: "50",
        price: "25.50",
        total: "1275.00",
        date: "2024-01-16",
        status: "pendiente"
      }
    ],
    columns: [
      { key: 'supplierId', header: 'ID del Proveedor', required: true },
      { key: 'productId', header: 'ID del Producto', required: true },
      { key: 'quantity', header: 'Cantidad', required: true },
      { key: 'price', header: 'Precio Unitario', required: true },
      { key: 'total', header: 'Total', required: true },
      { key: 'date', header: 'Fecha (YYYY-MM-DD)', required: true },
      { key: 'status', header: 'Estado (completada/pendiente/cancelada)', required: false }
    ]
  };
  
  // Hooks personalizados
  const { 
    purchases, 
    loading, 
    error, 
    stats, 
    pagination,
    fetchPurchases,
    createPurchase,
    updatePurchase,
    deletePurchase,
    changePurchaseStatus,
    addPayment,
    getPayments,
    deletePayment,
    clearError
  } = usePurchases()
  
  const { suppliers } = useSuppliers()
  const { products } = useProducts()
  const { banks, fetchBanks } = useBanks()

  const statuses = [
    { value: 'pendiente', label: 'Pendiente', color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
    { value: 'en_transito', label: 'En Tránsito', color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { value: 'recibida', label: 'Recibida', color: 'text-green-600', bgColor: 'bg-green-50' },
    { value: 'cancelada', label: 'Cancelada', color: 'text-red-600', bgColor: 'bg-red-50' }
  ]

  const categories = ['Materia Prima', 'Envases', 'Químicos', 'Equipos', 'Herramientas', 'Otros']

  // Aplicar filtros y búsqueda
  const applyFilters = () => {
    const params = {
      page: currentPage,
      limit: 10
    }

    if (searchTerm) params.search = searchTerm
    if (filterStatus !== 'todos') params.status = filterStatus
    if (filterCategory !== 'todos') params.category = filterCategory
    if (filterSupplier !== 'todos') params.supplier = filterSupplier

    fetchPurchases(params)
  }

  // Cambiar página
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
    const params = {
      page: newPage,
      limit: 10
    }
    
    if (searchTerm) params.search = searchTerm
    if (filterStatus !== 'todos') params.status = filterStatus
    if (filterCategory !== 'todos') params.category = filterCategory
    if (filterSupplier !== 'todos') params.supplier = filterSupplier

    fetchPurchases(params)
  }

  // Aplicar filtros cuando cambien (solo después del montaje inicial)
  useEffect(() => {
    // Evitar ejecutar en el montaje inicial
    if (filterStatus !== 'todos' || filterCategory !== 'todos' || filterSupplier !== 'todos') {
      applyFilters()
    }
  }, [filterStatus, filterCategory, filterSupplier])

  // Aplicar búsqueda con debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1)
      applyFilters()
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Manejar cambio de estado
  const handleStatusChange = async (purchaseId, newStatus) => {
    const result = await changePurchaseStatus(purchaseId, newStatus)
    if (result.success) {
      // Los datos se actualizan automáticamente
    }
  }

  // Manejar eliminación
  const handleDelete = async (purchaseId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta compra?')) {
      const result = await deletePurchase(purchaseId)
      if (result.success) {
        // Los datos se actualizan automáticamente
      }
    }
  }

  // Manejar guardado de compra
  const handleSavePurchase = async (purchaseData) => {
    if (editingPurchase) {
      // Modo edición
      const result = await updatePurchase(editingPurchase._id, purchaseData)
      if (result.success) {
        setEditingPurchase(null)
        setShowForm(false)
      }
    } else {
      // Modo creación
      const result = await createPurchase(purchaseData)
      if (result.success) {
        setNewlyCreatedPurchase(result.data)
        setShowForm(false)
        setShowPaymentPromptModal(true)
      }
    }
  }

  // Funciones para pagos parciales
  const handleAddPayment = async (purchaseId, paymentData) => {
    const result = await addPayment(purchaseId, paymentData)
    if (result) {
      setShowPaymentModal(false)
      setSelectedPurchaseForPayment(null)
      // Recargar pagos de la compra
      await loadPurchasePayments(purchaseId)
      // Recargar cuentas bancarias para obtener balances actualizados
      await fetchBanks()
    }
  }

  const loadPurchasePayments = async (purchaseId) => {
    const paymentsData = await getPayments(purchaseId)
    if (paymentsData) {
      setPurchasePayments(prev => ({
        ...prev,
        [purchaseId]: paymentsData
      }))
    }
  }

  const handleOpenPaymentModal = (purchase) => {
    setSelectedPurchaseForPayment(purchase)
    setShowPaymentModal(true)
    loadPurchasePayments(purchase._id)
  }

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false)
    setSelectedPurchaseForPayment(null)
  }

  const handleOpenPaymentHistory = (purchase) => {
    setSelectedPurchaseForHistory(purchase)
    setShowPaymentHistoryModal(true)
    loadPurchasePayments(purchase._id)
  }

  const handleClosePaymentHistory = () => {
    setShowPaymentHistoryModal(false)
    setSelectedPurchaseForHistory(null)
  }

  const handleDeletePaymentFromHistory = async (paymentId) => {
    if (!selectedPurchaseForHistory) return

    const result = await deletePayment(selectedPurchaseForHistory._id, paymentId)
    if (result) {
      // Recargar pagos de la compra
      await loadPurchasePayments(selectedPurchaseForHistory._id)
      // Recargar cuentas bancarias para obtener balances actualizados
      await fetchBanks()
    }
  }

  const handlePayNow = () => {
    setShowPaymentPromptModal(false)
    setShowPaymentModal(true)
    setSelectedPurchaseForPayment(newlyCreatedPurchase)
    loadPurchasePayments(newlyCreatedPurchase._id)
  }

  const handleSkipPayment = () => {
    setShowPaymentPromptModal(false)
    setNewlyCreatedPurchase(null)
  }

  const handleClosePaymentPrompt = () => {
    setShowPaymentPromptModal(false)
    setNewlyCreatedPurchase(null)
  }




  // Abrir modal para editar
  const handleEdit = (purchase) => {
    setEditingPurchase(purchase)
    setShowForm(true)
  }

  // Cerrar modal
  const handleCloseModal = () => {
    setShowForm(false)
    setEditingPurchase(null)
  }

  const getStatusInfo = (status) => {
    return statuses.find(s => s.value === status)
  }

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return '$0.00'
    }
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP'
    }).format(amount)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    
    // Extraer solo la parte de la fecha si incluye tiempo
    const datePart = dateString.includes('T') ? dateString.split('T')[0] : dateString
    
    // Dividir la fecha en componentes
    const [year, month, day] = datePart.split('-')
    
    // Formatear directamente sin usar new Date para evitar problemas de zona horaria
    const dayNum = parseInt(day, 10)
    const monthNum = parseInt(month, 10)
    const yearNum = parseInt(year, 10)
    
    // Crear fecha en formato local sin conversión de zona horaria
    const formattedDate = `${dayNum}/${monthNum}/${yearNum}`
    return formattedDate
  }

  if (loading && purchases.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando compras...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className={`flex ${isMobile ? 'flex-col space-y-4' : 'flex-col lg:flex-row lg:items-center lg:justify-between gap-4'}`}>
        <div className="flex-1">
          <h1 className={`font-bold text-gray-900 mb-2 ${isMobile ? 'text-xl' : 'text-2xl sm:text-3xl lg:text-4xl'}`}>Gestión de Compras</h1>
          <p className={`text-gray-600 ${isMobile ? 'text-sm' : 'text-sm sm:text-base'}`}>Administra las compras y proveedores</p>
        </div>
        <div className={`flex-shrink-0 ${isMobile ? 'space-y-2' : 'flex space-x-3'}`}>
          <Button 
            onClick={openImportModal}
            variant="outline"
            className={`w-full sm:w-auto flex items-center justify-center space-x-2 shadow-medium hover:shadow-strong transform hover:-translate-y-1 transition-all duration-300 ${isMobile ? 'py-3' : ''}`}
          >
            <Upload className="w-5 h-5" />
            <span className={isMobile ? 'text-base' : 'hidden sm:inline'}>Importar</span>
            <span className={isMobile ? 'hidden' : 'sm:hidden'}>Importar</span>
          </Button>
          <Button 
            onClick={() => setShowForm(true)}
            className={`btn-primary flex items-center justify-center space-x-2 shadow-medium hover:shadow-strong transform hover:-translate-y-1 transition-all duration-300 ${isMobile ? 'w-full py-3' : 'w-full lg:w-auto'}`}
          >
            <Plus className="w-5 h-5" />
            <span className={isMobile ? 'text-base' : 'hidden sm:inline'}>Nueva Compra</span>
            <span className={isMobile ? 'hidden' : 'sm:hidden'}>Nueva</span>
          </Button>
        </div>
      </div>

      {/* Mostrar error si existe */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <div>
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchPurchases()}
              className="text-red-600 hover:text-red-800 border-red-200 hover:border-red-300"
            >
              Reintentar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearError}
              className="text-red-600 hover:text-red-800"
            >
              ×
            </Button>
          </div>
        </div>
      )}

      {/* Filtros y Búsqueda */}
      <div className={`card card-hover ${isMobile ? 'p-4' : 'p-4 sm:p-6'}`}>
        <div className="flex flex-col gap-4">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={isMobile ? "Buscar compras..." : "Buscar compras por número o proveedor..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isMobile ? 'py-3 text-base' : 'py-2'}`}
            />
          </div>
          
          {/* Filtros */}
          <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isMobile ? 'px-4 py-3 text-base' : 'px-3 sm:px-4 py-2 text-sm'}`}
            >
              <option value="todos">Todos los estados</option>
              {statuses.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>

      

            <select
              value={filterSupplier}
              onChange={(e) => setFilterSupplier(e.target.value)}
              className={`w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isMobile ? 'px-4 py-3 text-base' : 'px-3 sm:px-4 py-2 text-sm'}`}
            >
              <option value="todos">Todos los proveedores</option>
              {suppliers.map(supplier => (
                <option key={supplier._id} value={supplier.name}>{supplier.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Compras */}
      <div className="card card-hover">
        <div className="p-4 sm:p-6 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h3 className="text-lg font-semibold text-gray-900">
              Compras ({pagination.total})
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <ShoppingCart className="w-4 h-4" />
              <span>Total: {pagination.total}</span>
              <span>|</span>
              <span>Pagos Contables: {purchases.filter(p => p.isAccountPayment).length}</span>
            </div>
          </div>
        </div>
        
        {/* Vista en Grid */}
        <div className="p-4 sm:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* Tabla de compras */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Compra
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Proveedor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Productos
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Pagos
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {purchases.map((purchase) => {
                        const statusInfo = getStatusInfo(purchase.status)
                        
                        return (
                          <tr key={purchase._id} className="hover:bg-gray-50">
                            {/* Compra */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{purchase.purchaseNumber}</div>
                             
                                {purchase.isAccountPayment && (
                                  <div className="text-xs text-blue-600 font-medium">
                                    💰 Pago Contable
                                  </div>
                                )}
                              </div>
                            </td>
                            
                            {/* Proveedor */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {purchase.isAccountPayment ? (
                                  <div>
                                    <div className="font-medium">{purchase.supplierName}</div>
                                    <div className="text-xs text-gray-500">
                                      Cuenta: {purchase.accountCode} - {purchase.accountName}
                                    </div>
                                  </div>
                                ) : (
                                  purchase.supplierName
                                )}
                              </div>
                            </td>
                            
                            {/* Productos */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                <Package className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-900">
                                  {purchase.isAccountPayment ? (
                                    <div>
                                      <div>{purchase.items[0]?.productName || 'Pago Contable'}</div>
                                      <div className="text-xs text-gray-500">
                                        {purchase.items[0]?.description || 'Sin descripción'}
                                      </div>
                                    </div>
                                  ) : (
                                    <div>
                                      <div>{purchase.items.length} items</div>
                                      {purchase.items.some(item => {
                                        const product = products.find(p => p._id === item.product)
                                        return product?.managesBatches
                                      }) && (
                                        <div className="flex items-center space-x-1 text-blue-600">
                                          <Package2 className="w-3 h-3" />
                                          <span className="text-xs">Lotes</span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </span>
                              </div>
                            </td>
                            
                            {/* Total */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{formatCurrency(purchase.total || 0)}</div>
                            </td>
                            
                            {/* Pagos */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm">
                                {(purchase.paidAmount || 0) > 0 && (
                                  <div className="text-green-600 font-medium">
                                    Pagado: {formatCurrency(purchase.paidAmount || 0)}
                                  </div>
                                )}
                                {purchase.paymentStatus !== 'pagado' && (purchase.remainingAmount || 0) > 0 && (
                                  <div className="text-orange-600 text-xs">
                                    Restante: {formatCurrency(purchase.remainingAmount || 0)}
                                  </div>
                                )}
                                <div className={`text-xs font-medium ${
                                  purchase.paymentStatus === 'pagado' ? 'text-green-600' :
                                  purchase.paymentStatus === 'parcial' ? 'text-orange-600' :
                                  'text-gray-600'
                                }`}>
                                  {purchase.paymentStatus === 'pagado' ? 'Pagado' :
                                   purchase.paymentStatus === 'parcial' ? 'Pago Parcial' :
                                   'Pendiente'}
                                </div>
                              </div>
                            </td>
                            
                            {/* Estado */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded-full ${statusInfo.bgColor} ${statusInfo.color}`}>
                                {statusInfo.label}
                              </span>
                            </td>
                            
                            {/* Fecha */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div>{formatDate(purchase.orderDate)}</div>
                              <div className="text-xs">Entrega: {formatDate(purchase.expectedDelivery)}</div>
                            </td>
                            
                            {/* Acciones */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                {!purchase.isAccountPayment && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEdit(purchase)}
                                    className="text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                )}
                                
                                {/* Botones de pagos - solo para compras regulares */}
                                {!purchase.isAccountPayment && purchase.paymentStatus !== 'pagado' && purchase.paymentStatus !== 'cancelado' && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-green-600 hover:text-green-700 border-green-200 hover:border-green-300"
                                    onClick={() => handleOpenPaymentModal(purchase)}
                                  >
                                    <DollarSign className="w-4 h-4" />
                                  </Button>
                                )}
                                
                                {!purchase.isAccountPayment && purchase.paidAmount > 0 && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300"
                                    onClick={() => handleOpenPaymentHistory(purchase)}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                )}
                                
                                {/* Para pagos contables, mostrar información adicional */}
                                {purchase.isAccountPayment && (
                                  <div className="text-xs text-gray-500">
                                    <div>Método: {purchase.paymentMethod}</div>
                                    {purchase.reference && <div>Ref: {purchase.reference}</div>}
                                  </div>
                                )}
                                
                                <select
                                  value={purchase.status}
                                  onChange={(e) => handleStatusChange(purchase._id, e.target.value)}
                                  className="border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  disabled={purchase.isAccountPayment}
                                >
                                  {statuses.map(status => (
                                    <option key={status.value} value={status.value}>{status.label}</option>
                                  ))}
                                </select>
                                
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDelete(purchase._id)}
                                  className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Paginación */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-center mt-8 space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </Button>
                  
                  <span className="text-sm text-gray-600">
                    Página {currentPage} de {pagination.pages}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === pagination.pages}
                  >
                    Siguiente
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {purchases.length === 0 && !loading && (
          <div className="text-center py-12">
            <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay compras</h3>
            <p className="text-gray-500">
              {searchTerm || filterStatus !== 'todos' || filterCategory !== 'todos' || filterSupplier !== 'todos'
                ? 'No se encontraron compras con los filtros aplicados'
                : 'Comienza creando tu primera compra'
              }
            </p>
          </div>
        )}
      </div>

      {/* Modal de Compra */}
      <PurchaseModal
        isOpen={showForm}
        onClose={handleCloseModal}
        purchase={editingPurchase}
        onSave={handleSavePurchase}
        loading={loading}
      />

      {/* Modal de Pago Parcial */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={handleClosePaymentModal}
        purchase={selectedPurchaseForPayment}
        onSave={handleAddPayment}
        banks={banks}
      />

      {/* Modal de Historial de Pagos */}
      <PaymentHistoryModal
        isOpen={showPaymentHistoryModal}
        onClose={handleClosePaymentHistory}
        purchase={selectedPurchaseForHistory}
        payments={purchasePayments[selectedPurchaseForHistory?._id]?.payments || []}
        paidAmount={purchasePayments[selectedPurchaseForHistory?._id]?.paidAmount || 0}
        remainingAmount={purchasePayments[selectedPurchaseForHistory?._id]?.remainingAmount || 0}
        onDeletePayment={handleDeletePaymentFromHistory}
      />

      {/* Modal de Prompt de Pago */}
      <PaymentPromptModal
        isOpen={showPaymentPromptModal}
        onClose={handleClosePaymentPrompt}
        purchase={newlyCreatedPurchase}
        onPayNow={handlePayNow}
        onSkip={handleSkipPayment}
      />

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

// Exportaciones
export { ComprasPage };
export default ComprasPage;
