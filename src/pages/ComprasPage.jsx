import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search, ShoppingCart, Package, Truck, DollarSign, AlertCircle, Package2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePurchases } from '@/hooks/usePurchases'
import { useSuppliers } from '@/hooks/useSuppliers'
import { useProducts } from '@/hooks/useProducts'
import { useMobile } from '@/hooks/useMobile'
import { PurchaseModal } from '@/components/PurchaseModal'

function ComprasPage() {
  const { isMobile } = useMobile()
  const [showForm, setShowForm] = useState(false)
  const [editingPurchase, setEditingPurchase] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('todos')
  const [filterCategory, setFilterCategory] = useState('todos')
  const [filterSupplier, setFilterSupplier] = useState('todos')
  const [currentPage, setCurrentPage] = useState(1)
  
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
    clearError
  } = usePurchases()
  
  const { suppliers } = useSuppliers()
  const { products } = useProducts()

  const statuses = [
    { value: 'pendiente', label: 'Pendiente', color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
    { value: 'en_transito', label: 'En Tránsito', color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { value: 'recibida', label: 'Recibida', color: 'text-green-600', bgColor: 'bg-green-50' },
    { value: 'cancelada', label: 'Cancelada', color: 'text-red-600', bgColor: 'bg-red-50' }
  ]

  const categories = ['Materia Prima', 'Envases', 'Químicos', 'Equipos', 'Herramientas', 'Otros']

  // Aplicar filtros y búsqueda
  const applyFilters = () => {
    console.log('🚀 applyFilters ejecutándose')
    const params = {
      page: currentPage,
      limit: 10
    }

    if (searchTerm) params.search = searchTerm
    if (filterStatus !== 'todos') params.status = filterStatus
    if (filterCategory !== 'todos') params.category = filterCategory
    if (filterSupplier !== 'todos') params.supplier = filterSupplier

    console.log('📡 Llamando fetchPurchases con params:', params)
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
    console.log('🔄 useEffect filtros ejecutándose:', { filterStatus, filterCategory, filterSupplier })
    // Evitar ejecutar en el montaje inicial
    if (filterStatus !== 'todos' || filterCategory !== 'todos' || filterSupplier !== 'todos') {
      console.log('📡 Aplicando filtros desde useEffect')
      applyFilters()
    }
  }, [filterStatus, filterCategory, filterSupplier])

  // Aplicar búsqueda con debounce
  useEffect(() => {
    console.log('🔍 useEffect búsqueda ejecutándose:', { searchTerm })
    const timer = setTimeout(() => {
      console.log('📡 Aplicando búsqueda desde useEffect')
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
        setShowForm(false)
      }
    }
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
        <div className="flex-shrink-0">
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
            className="text-red-600 hover:text-red-800"
          >
            ×
          </Button>
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
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className={`w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isMobile ? 'px-4 py-3 text-base' : 'px-3 sm:px-4 py-2 text-sm'}`}
            >
              <option value="todos">Todas las categorías</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
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
              <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 sm:gap-6'}`}>
                {purchases.map((purchase) => {
                  const statusInfo = getStatusInfo(purchase.status)
                  
                  return (
                    <div key={purchase._id} className={`bg-white border border-gray-200 rounded-xl hover:shadow-medium transition-all duration-200 ${isMobile ? 'p-4' : 'p-4 sm:p-6'}`}>
                      {/* Header de la compra */}
                      <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'flex-col sm:flex-row sm:items-start sm:justify-between gap-2'} mb-4`}>
                        <div className="flex-1">
                          <h4 className={`font-semibold text-gray-900 mb-1 ${isMobile ? 'text-base' : 'text-base sm:text-lg'}`}>{purchase.purchaseNumber}</h4>
                          <p className={`text-gray-600 ${isMobile ? 'text-sm' : 'text-sm'}`}>{purchase.supplierName}</p>
                        </div>
                        <div className={`flex items-center space-x-2 ${isMobile ? 'self-start' : 'self-start'}`}>
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
                            <div key={index} className="text-xs text-gray-600 flex items-center justify-between">
                              <span>
                                {item.quantity} {item.unit} {item.productName} - {formatCurrency(item.total)}
                              </span>
                              {(() => {
                                const product = products.find(p => p._id === item.product)
                                return product?.managesBatches ? (
                                  <div className="flex items-center space-x-1 text-blue-600">
                                    <Package2 className="w-3 h-3" />
                                    <span className="text-xs">Lotes</span>
                                  </div>
                                ) : null
                              })()}
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
                          <div>Orden: {formatDate(purchase.orderDate)}</div>
                          <div>Entrega: {formatDate(purchase.expectedDelivery)}</div>
                        </div>
                        <div className="text-right">
                          <div>Categoría: {purchase.category}</div>
                          <div>{purchase.paymentMethod}</div>
                        </div>
                      </div>

                      {/* Acciones */}
                      <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'items-center space-x-2'}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`btn-secondary ${isMobile ? 'w-full' : 'flex-1'}`}
                          onClick={() => handleEdit(purchase)}
                        >
                          <Edit className={`${isMobile ? 'w-4 h-4 mr-2' : 'w-4 h-4 mr-2'}`} />
                          Editar
                        </Button>
                        
                        <div className={`flex ${isMobile ? 'space-x-2' : 'items-center space-x-2'}`}>
                          {/* Selector de estado */}
                          <select
                            value={purchase.status}
                            onChange={(e) => handleStatusChange(purchase._id, e.target.value)}
                            className={`border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${isMobile ? 'px-3 py-2 text-sm flex-1' : 'px-3 py-1 text-xs'}`}
                          >
                            {statuses.map(status => (
                              <option key={status.value} value={status.value}>{status.label}</option>
                            ))}
                          </select>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(purchase._id)}
                            className={`text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 ${isMobile ? 'px-3' : ''}`}
                            disabled={purchase.status !== 'pendiente'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
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
    </div>
  )
}

// Exportaciones
export { ComprasPage };
export default ComprasPage;
