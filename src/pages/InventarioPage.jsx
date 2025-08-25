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
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useInventory } from '@/hooks/useInventory'
import { toast } from 'react-hot-toast'

export function InventarioPage() {


  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('todos')

  const {
    inventory,
    loading,
    error,
    summary,
    adjustStock
  } = useInventory()













  const handleStockAdjustment = async (itemId, quantity) => {
    try {
      await adjustStock(itemId, quantity, 'ajuste', 'Ajuste manual de stock')
      toast.success('Stock ajustado exitosamente')
    } catch (error) {
      console.error('Error al ajustar stock:', error)
      toast.error('Error al ajustar el stock')
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Control de Inventario</h1>
          <p className="text-gray-600">
            Gestiona el stock y movimientos de inventario
            {loading && <span className="ml-2 text-blue-600">• Cargando...</span>}
            {error && <span className="ml-2 text-red-600">• Error: {error}</span>}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            onClick={() => window.location.reload()}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded flex items-center space-x-2"
            title="Recargar inventario"
          >
            <Loader2 className="w-5 h-5" />
            <span>Recargar</span>
          </Button>
          
        </div>
      </div>

      {/* Resumen del Inventario */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <Package className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <h3 className="text-2xl font-bold text-gray-900 text-center">{summary.totalProducts || 0}</h3>
          <p className="text-gray-600 text-center">Total Productos</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <AlertTriangle className="w-8 h-8 text-orange-600 mx-auto mb-2" />
          <h3 className="text-2xl font-bold text-gray-900 text-center">{summary.lowStockProducts || 0}</h3>
          <p className="text-gray-600 text-center">Stock Bajo</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
          <h3 className="text-2xl font-bold text-gray-900 text-center">{summary.outOfStockProducts || 0}</h3>
          <p className="text-gray-600 text-center">Sin Stock</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <BarChart3 className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <h3 className="text-2xl font-bold text-gray-900 text-center">${(summary.totalValue || 0).toFixed(2)}</h3>
          <p className="text-gray-600 text-center">Valor Total</p>
        </div>
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
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
                     <option value="todos">Todas las categorías</option>
        </select>
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
            <div className="overflow-x-auto">
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
    </div>
  )
}
