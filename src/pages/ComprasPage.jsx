import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search, ShoppingCart, Package, Truck, DollarSign, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePurchases } from '@/hooks/usePurchases'
import { useSuppliers } from '@/hooks/useSuppliers'
import { useProducts } from '@/hooks/useProducts'
import { PurchaseModal } from '@/components/PurchaseModal'

export function ComprasPage() {
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

  // Aplicar filtros cuando cambien
  useEffect(() => {
    applyFilters()
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
    return new Date(dateString).toLocaleDateString('es-DO')
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

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="todos">Todas las categorías</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select
              value={filterSupplier}
              onChange={(e) => setFilterSupplier(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="todos">Todos los proveedores</option>
              {suppliers.map(supplier => (
                <option key={supplier._id} value={supplier._id}>{supplier.name}</option>
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
              Compras ({pagination.total})
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <ShoppingCart className="w-4 h-4" />
              <span>Total: {pagination.total}</span>
            </div>
          </div>
        </div>
        
        {/* Vista en Grid */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {purchases.map((purchase) => {
                  const statusInfo = getStatusInfo(purchase.status)
                  
                  return (
                    <div key={purchase._id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-medium transition-all duration-200">
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
                              {item.quantity} {item.unit} {item.productName} - {formatCurrency(item.total)}
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
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 btn-secondary"
                          onClick={() => handleEdit(purchase)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </Button>
                        
                        {/* Selector de estado */}
                        <select
                          value={purchase.status}
                          onChange={(e) => handleStatusChange(purchase._id, e.target.value)}
                          className="px-3 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                          disabled={purchase.status !== 'pendiente'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
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
