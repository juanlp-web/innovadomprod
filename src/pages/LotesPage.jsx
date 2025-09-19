import { useState, useEffect } from 'react'
import { 
  Plus, 
  Search, 
  Calendar,
  Package,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Minus,
  RotateCcw,
  Loader2,
  Eye
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useBatches } from '@/hooks/useBatches'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/toast'
import { useConfirmationModal, ConfirmationModal } from '@/components/ui/confirmation-modal'
import { ToastContainer } from '@/components/ui/toast'

export function LotesPage() {
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('todos')
  const [filterProduct, setFilterProduct] = useState('todos')
  const [showConsumeModal, setShowConsumeModal] = useState(false)
  const [showRestoreModal, setShowRestoreModal] = useState(false)
  const [selectedBatch, setSelectedBatch] = useState(null)
  const [consumeQuantity, setConsumeQuantity] = useState('')
  const [restoreQuantity, setRestoreQuantity] = useState('')

  // Hook para manejar lotes
  const {
    batches,
    loading,
    error,
    totalPages,
    currentPage,
    total,
    fetchBatches,
    createBatch,
    consumeBatchStock,
    restoreBatchStock,
    clearError
  } = useBatches()

  // Hook para autenticación
  const { user } = useAuth()

  // Hook para toast
  const { toasts, removeToast, success, error: showError, warning, info } = useToast()

  // Hook para modal de confirmación
  const { modalState, openModal, closeModal, confirm } = useConfirmationModal()

  const [formData, setFormData] = useState({
    batchNumber: '',
    product: null,
    productName: '',
    quantity: '',
    unit: 'unidad',
    productionDate: new Date(),
    expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    cost: 0,
    notes: ''
  })

  const units = ['unidad', 'docena', 'caja', 'kg', 'g', 'l', 'ml']

  const statuses = [
    { value: 'activo', label: 'Activo', color: 'text-green-600', bgColor: 'bg-green-50' },
    { value: 'vencido', label: 'Vencido', color: 'text-red-600', bgColor: 'bg-red-50' },
    { value: 'agotado', label: 'Agotado', color: 'text-gray-600', bgColor: 'bg-gray-50' }
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!user) {
      showError('Debe estar autenticado para crear un lote.')
      return
    }
    
    try {
      if (!formData.product || !formData.quantity || !formData.unit || !formData.expirationDate) {
        showError('Debe completar todos los campos requeridos.')
        return
      }

      const batchData = {
        ...formData,
        product: formData.product._id,
        productName: formData.product.name,
        initialStock: parseFloat(formData.quantity),
        currentStock: parseFloat(formData.quantity),
        productionDate: formData.productionDate,
        expirationDate: formData.expirationDate,
        cost: parseFloat(formData.cost) || 0,
        createdBy: user._id
      }

      await createBatch(batchData)
      success('Lote creado exitosamente')
      
      // Limpiar formulario
      setFormData({
        batchNumber: '',
        product: null,
        productName: '',
        quantity: '',
        unit: 'unidad',
        productionDate: new Date(),
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        cost: 0,
        notes: ''
      })
      setShowForm(false)
    } catch (error) {
      console.error('Error al guardar lote:', error)
      showError('Error al guardar el lote')
    }
  }


  const handleConsumeStock = async () => {
    if (!selectedBatch || !consumeQuantity || consumeQuantity <= 0) {
      showError('Debe especificar una cantidad válida para consumir')
      return
    }

    try {
      await consumeBatchStock(selectedBatch._id, parseFloat(consumeQuantity))
      success(`Stock consumido exitosamente. Cantidad: ${consumeQuantity}`)
      setShowConsumeModal(false)
      setSelectedBatch(null)
      setConsumeQuantity('')
    } catch (error) {
      console.error('Error al consumir stock:', error)
      showError('Error al consumir stock del lote')
    }
  }

  const handleRestoreStock = async () => {
    if (!selectedBatch || !restoreQuantity || restoreQuantity <= 0) {
      showError('Debe especificar una cantidad válida para restaurar')
      return
    }

    try {
      await restoreBatchStock(selectedBatch._id, parseFloat(restoreQuantity))
      success(`Stock restaurado exitosamente. Cantidad: ${restoreQuantity}`)
      setShowRestoreModal(false)
      setSelectedBatch(null)
      setRestoreQuantity('')
    } catch (error) {
      console.error('Error al restaurar stock:', error)
      showError('Error al restaurar stock del lote')
    }
  }

  const openConsumeModal = (batch) => {
    setSelectedBatch(batch)
    setConsumeQuantity('')
    setShowConsumeModal(true)
  }

  const openRestoreModal = (batch) => {
    setSelectedBatch(batch)
    setRestoreQuantity('')
    setShowRestoreModal(true)
  }

  const getStatusInfo = (status) => {
    return statuses.find(s => s.value === status) || statuses[0]
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-DO')
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP'
    }).format(amount)
  }

  const filteredBatches = batches.filter(batch => {
    const matchesSearch = batch.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         batch.productName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'todos' || batch.status === filterStatus
    const matchesProduct = filterProduct === 'todos' || batch.product === filterProduct
    return matchesSearch && matchesStatus && matchesProduct
  })

  // Aplicar filtros cuando cambien los parámetros
  useEffect(() => {
    const params = {}
    if (searchTerm) params.search = searchTerm
    if (filterStatus !== 'todos') params.status = filterStatus
    if (filterProduct !== 'todos') params.product = filterProduct
    
    fetchBatches(params)
  }, [searchTerm, filterStatus, filterProduct, fetchBatches])

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Banner de Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <XCircle className="w-5 h-5 text-red-600" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
          <Button
            onClick={clearError}
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700"
          >
            <XCircle className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestión de Lotes</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            Administra los lotes de producción con control de inventario y fechas de vencimiento
          </p>
        </div>
        <div className="flex-shrink-0">
          <Button
            onClick={() => setShowForm(true)}
            className="btn-primary w-full lg:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Nuevo Lote</span>
            <span className="sm:hidden">Nuevo</span>
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por número de lote o producto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="todos">Todos los estados</option>
              <option value="activo">Activo</option>
              <option value="vencido">Vencido</option>
              <option value="agotado">Agotado</option>
            </select>
          </div>
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Producto
            </label>
            <select
              value={filterProduct}
              onChange={(e) => setFilterProduct(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="todos">Todos los productos</option>
              {/* Aquí se podrían agregar opciones de productos */}
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Lotes */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Lotes ({filteredBatches.length})
          </h2>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
            <p className="text-gray-600 mt-2">Cargando lotes...</p>
          </div>
        ) : filteredBatches.length === 0 ? (
          <div className="p-8 text-center">
            <Package className="w-12 h-12 mx-auto text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mt-4">No hay lotes</h3>
            <p className="text-gray-600 mt-2">
              {searchTerm || filterStatus !== 'todos' || filterProduct !== 'todos'
                ? 'No se encontraron lotes con los filtros aplicados.'
                : 'Comienza creando tu primer lote de producción.'}
            </p>
          </div>
        ) : (
          <>
            {/* Vista de tarjetas para móviles */}
            <div className="lg:hidden p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredBatches.map((batch) => (
                  <div key={batch._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    {/* Header de la tarjeta */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-sm">{batch.batchNumber}</h4>
                        <p className="text-xs text-gray-600">{batch.recipeName}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusInfo(batch.status).bgColor} ${getStatusInfo(batch.status).color}`}>
                        {getStatusInfo(batch.status).label}
                      </span>
                    </div>
                    
                    {/* Información del producto */}
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-900">{batch.productName}</p>
                      <p className="text-xs text-gray-600">{batch.quantity} {batch.unit}</p>
                    </div>
                    
                    {/* Stock y costo */}
                    <div className="mb-3">
                      <p className="text-sm text-gray-900">
                        Stock: {batch.currentStock} / {batch.initialStock}
                      </p>
                      <p className="text-xs text-gray-600">{formatCurrency(batch.cost || 0)}</p>
                    </div>
                    
                    {/* Fechas */}
                    <div className="mb-4 text-xs text-gray-600">
                      <div className="flex items-center mb-1">
                        <Calendar className="w-3 h-3 mr-1" />
                        Prod: {formatDate(batch.productionDate)}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        Venc: {formatDate(batch.expirationDate)}
                      </div>
                    </div>
                    
                    {/* Acciones */}
                    <div className="flex flex-wrap gap-2">
                      {batch.status === 'activo' && batch.currentStock > 0 && (
                        <>
                          <Button
                            onClick={() => openConsumeModal(batch)}
                            variant="ghost"
                            size="sm"
                            className="text-orange-600 hover:text-orange-700 p-1 h-8 w-8"
                            title="Consumir stock"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <Button
                            onClick={() => openRestoreModal(batch)}
                            variant="ghost"
                            size="sm"
                            className="text-green-600 hover:text-green-700 p-1 h-8 w-8"
                            title="Restaurar stock"
                          >
                            <RotateCcw className="w-3 h-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Vista de tabla para desktop */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lote
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fechas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBatches.map((batch) => (
                    <tr key={batch._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {batch.batchNumber}
                          </div>
                          <div className="text-sm text-gray-500">
                            {batch.recipeName}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {batch.productName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {batch.quantity} {batch.unit}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {batch.currentStock} / {batch.initialStock}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatCurrency(batch.cost || 0)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm text-gray-900">
                            <Calendar className="w-4 h-4 inline mr-1" />
                            Prod: {formatDate(batch.productionDate)}
                          </div>
                          <div className="text-sm text-gray-500">
                            <Calendar className="w-4 h-4 inline mr-1" />
                            Venc: {formatDate(batch.expirationDate)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusInfo(batch.status).bgColor} ${getStatusInfo(batch.status).color}`}>
                          {getStatusInfo(batch.status).label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {batch.status === 'activo' && batch.currentStock > 0 && (
                            <>
                              <Button
                                onClick={() => openConsumeModal(batch)}
                                variant="ghost"
                                size="sm"
                                className="text-orange-600 hover:text-orange-700"
                                title="Consumir stock"
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => openRestoreModal(batch)}
                                variant="ghost"
                                size="sm"
                                className="text-green-600 hover:text-green-700"
                                title="Restaurar stock"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Modal de Consumir Stock */}
      {showConsumeModal && selectedBatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Consumir Stock del Lote
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lote: {selectedBatch.batchNumber}
                </label>
                <p className="text-sm text-gray-600">
                  Stock disponible: {selectedBatch.currentStock} {selectedBatch.unit}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cantidad a consumir
                </label>
                <input
                  type="number"
                  value={consumeQuantity}
                  onChange={(e) => setConsumeQuantity(e.target.value)}
                  min="1"
                  max={selectedBatch.currentStock}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <Button
                onClick={() => setShowConsumeModal(false)}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConsumeStock}
                className="flex-1 btn-primary"
              >
                Consumir
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Restaurar Stock */}
      {showRestoreModal && selectedBatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Restaurar Stock del Lote
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lote: {selectedBatch.batchNumber}
                </label>
                <p className="text-sm text-gray-600">
                  Stock actual: {selectedBatch.currentStock} {selectedBatch.unit}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cantidad a restaurar
                </label>
                <input
                  type="number"
                  value={restoreQuantity}
                  onChange={(e) => setRestoreQuantity(e.target.value)}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <Button
                onClick={() => setShowRestoreModal(false)}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleRestoreStock}
                className="flex-1 btn-primary"
              >
                Restaurar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación */}
      <ConfirmationModal
        modalState={modalState}
        closeModal={closeModal}
        confirm={confirm}
      />

      {/* Toast Container */}
      <ToastContainer
        toasts={toasts}
        removeToast={removeToast}
      />
    </div>
  )
}

