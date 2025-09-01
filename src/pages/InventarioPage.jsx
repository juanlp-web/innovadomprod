import { useState, useEffect } from 'react'
import { 
  Search, 
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  Loader2,
  Package2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useInventory } from '@/hooks/useInventory'
import { useBatches } from '@/hooks/useBatches'
import { batchesAPI } from '@/config/api'
import { toast } from 'react-hot-toast'

export function InventarioPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('todos')
  const [showBatchSelector, setShowBatchSelector] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [adjustmentQuantity, setAdjustmentQuantity] = useState(0)
  const [adjustmentReason, setAdjustmentReason] = useState('')
  const [selectedBatch, setSelectedBatch] = useState('')
  const [availableBatches, setAvailableBatches] = useState([])

  const {
    inventory,
    loading,
    error,
    summary,
    adjustStock
  } = useInventory()

  const { getActiveBatchesByProduct } = useBatches()













  const handleStockAdjustment = async (itemId, quantity) => {
    const product = inventory.find(item => item.id === itemId)
    if (!product) return

    // Cargar lotes disponibles del producto
    try {
      const batches = await getActiveBatchesByProduct(itemId)
      const activeBatches = batches.filter(batch => batch.currentStock > 0 && batch.status === 'activo')
      
      if (activeBatches.length > 0) {
        // El producto tiene lotes, mostrar selector
        setSelectedProduct(product)
        setAdjustmentQuantity(quantity)
        setAdjustmentReason('')
        setSelectedBatch('')
        setAvailableBatches(activeBatches)
        setShowBatchSelector(true)
      } else {
        // El producto no tiene lotes, hacer ajuste directo
        await performStockAdjustment(itemId, quantity, 'ajuste', 'Ajuste manual de stock')
      }
    } catch (err) {
      console.error('Error al cargar lotes del producto:', err)
      // Si hay error, hacer ajuste directo
      await performStockAdjustment(itemId, quantity, 'ajuste', 'Ajuste manual de stock')
    }
  }

  const performStockAdjustment = async (itemId, quantity, reason, notes) => {
    try {
      await adjustStock(itemId, quantity, reason, notes)
      toast.success('Stock ajustado exitosamente')
    } catch (error) {
      console.error('Error al ajustar stock:', error)
      toast.error('Error al ajustar el stock')
    }
  }

  const handleBatchStockAdjustment = async () => {
    if (!selectedProduct || !selectedBatch || !adjustmentReason.trim()) {
      toast.error('Debe completar todos los campos')
      return
    }

    try {
      // Hacer el ajuste en el lote específico
      const batch = availableBatches.find(b => b._id === selectedBatch)
      if (!batch) {
        toast.error('Lote no encontrado')
        return
      }

      // Ajustar el stock del lote específico
      if (adjustmentQuantity > 0) {
        // Aumentar stock del lote
        await batchesAPI.restoreStock(selectedBatch, adjustmentQuantity)
      } else {
        // Disminuir stock del lote
        await batchesAPI.consumeStock(selectedBatch, Math.abs(adjustmentQuantity))
      }

      // También ajustar el stock general del producto
      await performStockAdjustment(
        selectedProduct.id, 
        adjustmentQuantity, 
        adjustmentReason, 
        `Ajuste en lote #${batch.batchNumber}: ${adjustmentReason}`
      )

      toast.success(`Stock del lote #${batch.batchNumber} ajustado exitosamente`)

      // Cerrar el modal
      setShowBatchSelector(false)
      setSelectedProduct(null)
      setAdjustmentQuantity(0)
      setAdjustmentReason('')
      setSelectedBatch('')
      setAvailableBatches([])
    } catch (error) {
      console.error('Error al ajustar stock del lote:', error)
      toast.error('Error al ajustar el stock del lote')
    }
  }

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.productName?.toLowerCase().includes(searchTerm.toLowerCase()) || false
    const matchesFilter = filterType === 'todos' || item.category === filterType
    return matchesSearch && matchesFilter
  })

  const getStockStatus = (current, min) => {
    if (current <= 0) return { status: 'agotado', color: 'text-red-600', icon: XCircle }
    if (current <= min) return { status: 'bajo', color: 'text-orange-600', icon: AlertTriangle }
    return { status: 'normal', color: 'text-green-600', icon: CheckCircle }
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar el inventario</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
          Reintentar
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Control de Inventario</h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Gestiona el stock y movimientos de inventario
            {loading && <span className="ml-2 text-blue-600">• Cargando...</span>}
            {error && <span className="ml-2 text-red-600">• Error: {error}</span>}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            onClick={() => window.location.reload()}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded flex items-center space-x-2 w-full lg:w-auto"
            title="Recargar inventario"
          >
            <Loader2 className="w-5 h-5" />
            <span className="hidden sm:inline">Recargar</span>
            <span className="sm:hidden">Recargar</span>
          </Button>
        </div>
      </div>

      {/* Resumen del Inventario */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <Package className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 text-center">{summary.totalProducts || 0}</h3>
          <p className="text-gray-600 text-center text-sm sm:text-base">Total Productos</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <AlertTriangle className="w-8 h-8 text-orange-600 mx-auto mb-2" />
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 text-center">{summary.lowStockProducts || 0}</h3>
          <p className="text-gray-600 text-center text-sm sm:text-base">Stock Bajo</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 text-center">{summary.outOfStockProducts || 0}</h3>
          <p className="text-gray-600 text-center text-sm sm:text-base">Sin Stock</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <BarChart3 className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 text-center">${(summary.totalValue || 0).toFixed(2)}</h3>
          <p className="text-gray-600 text-center text-sm sm:text-base">Valor Total</p>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar en inventario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="todos">Todas las categorías</option>
          </select>
        </div>
      </div>



          

      {/* Lista de Inventario */}
      <div className="bg-white rounded-lg shadow border">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Inventario ({filteredInventory.length})
          </h3>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Cargando inventario...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar el inventario</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
              Reintentar
            </Button>
          </div>
        ) : (
          <>
            {/* Vista de tarjetas para móviles */}
            <div className="lg:hidden p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredInventory.map((item) => {
                  const stockStatus = getStockStatus(item.currentStock || 0, item.minStock || 0)
                  const StatusIcon = stockStatus.icon
                  
                  return (
                    <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      {/* Header de la tarjeta */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 text-sm">{item.productName || 'N/A'}</h4>
                          <p className="text-xs text-gray-600">SKU: {item.sku || 'N/A'}</p>
                        </div>
                        <StatusIcon className={`w-5 h-5 ${stockStatus.color} flex-shrink-0`} />
                      </div>
                      
                      {/* Información del producto */}
                      <div className="mb-3">
                        <p className="text-xs text-gray-600">
                          Categoría: {item.category || 'N/A'} • {item.unit || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-600">
                          Proveedor: {item.supplier || 'N/A'}
                        </p>
                        {item.description && (
                          <p className="text-xs text-gray-400 mt-1">{item.description}</p>
                        )}
                      </div>
                      
                      {/* Stock */}
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-900">
                          Stock: {item.currentStock || 0} {item.unit || ''}
                        </p>
                        <p className="text-xs text-gray-600">
                          Mín: {item.minStock || 0}
                        </p>
                        <div className="flex items-center mt-1">
                          <Package2 className="w-3 h-3 text-blue-500 mr-1" />
                          <span className="text-xs text-blue-600">
                            {item.hasBatches ? 'Maneja lotes' : 'Sin lotes'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Costo y acciones */}
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          ${(item.cost || 0).toFixed(2)}
                        </p>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleStockAdjustment(item.id, 1)}
                            className="text-green-600 hover:text-green-900 transition-colors duration-200 p-1"
                            title="Aumentar Stock"
                          >
                            <TrendingUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleStockAdjustment(item.id, -1)}
                            className="text-red-600 hover:text-red-900 transition-colors duration-200 p-1"
                            title="Disminuir Stock"
                          >
                            <TrendingDown className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            
            {/* Vista de tabla para desktop */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
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
                      Costo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredInventory.map((item) => {
                    const stockStatus = getStockStatus(item.currentStock || 0, item.minStock || 0)
                    const StatusIcon = stockStatus.icon
                    
                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{item.productName || 'N/A'}</div>
                            <div className="text-sm text-gray-500">
                              SKU: {item.sku || 'N/A'} • Proveedor: {item.supplier || 'N/A'}
                            </div>
                            {item.description && (
                              <div className="text-xs text-gray-400 mt-1">{item.description}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{item.category || 'N/A'}</div>
                          <div className="text-xs text-gray-500">{item.unit || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <StatusIcon className={`w-5 h-5 ${stockStatus.color}`} />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {item.currentStock || 0} {item.unit || ''}
                              </div>
                              <div className="text-xs text-gray-500">
                                Mín: {item.minStock || 0}
                              </div>
                              {/* Indicador de lotes */}
                              <div className="flex items-center mt-1">
                                <Package2 className="w-3 h-3 text-blue-500 mr-1" />
                                <span className="text-xs text-blue-600">
                                  {item.hasBatches ? 'Maneja lotes' : 'Sin lotes'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">${(item.cost || 0).toFixed(2)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleStockAdjustment(item.id, 1)}
                              className="text-green-600 hover:text-green-900 transition-colors duration-200"
                              title="Aumentar Stock"
                            >
                              <TrendingUp className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleStockAdjustment(item.id, -1)}
                              className="text-red-600 hover:text-red-900 transition-colors duration-200"
                              title="Disminuir Stock"
                            >
                              <TrendingDown className="w-4 h-4" />
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || filterType !== 'todos' 
                    ? 'No se encontraron items con los filtros aplicados'
                    : 'No hay items en el inventario'
                  }
                </h3>
                                 <p className="text-gray-500 mb-4">
                   {searchTerm || filterType !== 'todos' 
                     ? 'Intenta cambiar los filtros de búsqueda'
                     : 'No hay items en el inventario'
                   }
                 </p>
                
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de Selección de Lotes para Ajuste de Stock */}
      {showBatchSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Package2 className="w-5 h-5 mr-2" />
                Ajuste de Stock con Lote
              </h3>
              <button
                onClick={() => setShowBatchSelector(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Información del Producto */}
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm font-medium text-gray-900">
                  Producto: {selectedProduct?.productName}
                </p>
                <p className="text-sm text-gray-600">
                  Cantidad: {adjustmentQuantity > 0 ? '+' : ''}{adjustmentQuantity} {selectedProduct?.unit}
                </p>
              </div>

              {/* Mensaje informativo */}
              <div className="bg-blue-50 p-3 rounded border border-blue-200">
                <p className="text-xs text-blue-700">
                  <strong>💡 Sistema de Lotes:</strong> Este producto maneja lotes de producción. 
                  Al hacer un ajuste de stock, debe seleccionar el lote específico al que se aplicará el cambio. 
                  Esto mantiene la trazabilidad del inventario por lotes.
                </p>
              </div>

              {/* Selector de Lotes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seleccionar Lote *
                </label>
                <select
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Seleccionar lote...</option>
                  {availableBatches.map(batch => (
                    <option key={batch._id} value={batch._id}>
                      Lote #{batch.batchNumber} - Stock: {batch.currentStock} {batch.unit} - Vence: {new Date(batch.expirationDate).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Razón del Ajuste */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Razón del Ajuste *
                </label>
                <input
                  type="text"
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  placeholder="Ej: Pérdida, Ajuste de inventario, etc."
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Botones */}
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  onClick={() => setShowBatchSelector(false)}
                  variant="outline"
                  className="px-4 py-2"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleBatchStockAdjustment}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={!selectedBatch || !adjustmentReason.trim()}
                >
                  Confirmar Ajuste
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
